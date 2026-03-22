import { Request, Response, NextFunction } from 'express';
import { Role, RoleType, RoleStatus, SalaryPeriod } from '../models/Role';
import { Accumulation } from '../models/Accumulation';
import { StudentProfile } from '../models/StudentProfile';
import { evaluateCandidate } from '../services/careero.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      department,
      location,
      type,
      openings,
      salaryMin,
      salaryMax,
      salaryPeriod,
      description,
      skills,
      accumulationIds,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !department ||
      !location ||
      !type ||
      !openings ||
      !salaryMin ||
      !salaryMax ||
      !description ||
      !skills ||
      !accumulationIds
    ) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate type enum
    if (!Object.values(RoleType).includes(type as RoleType)) {
      return res.status(400).json({ message: 'Invalid role type' });
    }

    // Validate salaryPeriod enum
    if (salaryPeriod && !Object.values(SalaryPeriod).includes(salaryPeriod as SalaryPeriod)) {
      return res.status(400).json({ message: 'Invalid salary period' });
    }

    // Validate skills array length
    if (!Array.isArray(skills) || skills.length < 1 || skills.length > 10) {
      return res.status(400).json({ message: 'Skills must have between 1 and 10 items' });
    }

    // Validate accumulationIds array
    if (!Array.isArray(accumulationIds) || accumulationIds.length < 1) {
      return res.status(400).json({ message: 'At least one accumulation ID is required' });
    }

    // Verify all accumulation IDs exist (can be from school or any company)
    const validAccumulations = await Accumulation.find({
      _id: { $in: accumulationIds },
    });

    if (validAccumulations.length !== accumulationIds.length) {
      const validIds = validAccumulations.map(a => a._id.toString());
      const invalidIds = accumulationIds.filter((id: string) => !validIds.includes(id));
      return res.status(400).json({
        message: `Invalid accumulation IDs: ${invalidIds.join(', ')}. Please ensure all accumulations exist.`
      });
    }

    // Validate openings range
    if (openings < 1 || openings > 50) {
      return res.status(400).json({ message: 'Openings must be between 1 and 50' });
    }

    // Validate salary values
    if (salaryMin < 1 || salaryMax < 1) {
      return res.status(400).json({ message: 'Salary values must be greater than 0' });
    }

    if (salaryMax <= salaryMin) {
      return res.status(400).json({ message: 'Maximum salary must be greater than minimum salary' });
    }

    // Validate description length
    if (description.length < 20 || description.length > 1000) {
      return res.status(400).json({ message: 'Description must be between 20 and 1000 characters' });
    }

    // Ensure company is set from authenticated user
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    // Calculate role points based on skills and accumulations
    const { totalPoints, breakdown } = await Role.calculatePoints(skills, accumulationIds);

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                    POINTS CALCULATION                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('📊 Skill Points:', breakdown.skillPoints);
    console.log('   - Base Value: 50 points per skill');
    console.log('   - Skill Count:', breakdown.skillCount);
    console.log('   - Complexity Multiplier: ×' + breakdown.complexityMultiplier.toFixed(2));
    console.log('📅 Accumulation Points:', breakdown.accumulationPoints);
    console.log('   - Weighted Accumulation Points:', breakdown.totalAccumulationPoints);
    console.log('   - Weight Applied: ×0.5 (50%)');
    console.log('   - Accumulation Count:', breakdown.accumulationCount);
    if (breakdown.typeBreakdown) {
      console.log('   - Types:', Object.entries(breakdown.typeBreakdown)
        .map(([type, count]) => `${type} (${count})`)
        .join(', '));
    }
    console.log('🎯 TOTAL POINTS:', totalPoints);
    console.log('═══════════════════════════════════════════════════════════');

    const role = await Role.create({
      company: companyId,
      title,
      department,
      location,
      type,
      openings,
      salaryMin,
      salaryMax,
      salaryPeriod: salaryPeriod || SalaryPeriod.MONTH,
      description,
      skills,
      accumulationIds,
      points: totalPoints,
      status: RoleStatus.OPEN,
      postedDate: new Date(),
    });

    res.status(201).json({
      message: 'Role created successfully',
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { status, search } = req.query;

    const query: any = { company: companyId };

    if (status && Object.values(RoleStatus).includes(status as RoleStatus)) {
      query.status = status;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const roles = await Role.find(query).sort({ postedDate: -1 });

    res.json({
      roles,
      count: roles.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.id;

    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const role = await Role.findOne({ _id: id, company: companyId });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ role });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.id;
    const updateData = req.body;

    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    // Prevent updating certain fields
    delete updateData.company;
    delete updateData.postedDate;
    delete updateData._id;

    // Validate status if provided
    if (updateData.status && !Object.values(RoleStatus).includes(updateData.status as RoleStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Validate type if provided
    if (updateData.type && !Object.values(RoleType).includes(updateData.type as RoleType)) {
      return res.status(400).json({ message: 'Invalid role type' });
    }

    // Validate salaryPeriod if provided
    if (updateData.salaryPeriod && !Object.values(SalaryPeriod).includes(updateData.salaryPeriod as SalaryPeriod)) {
      return res.status(400).json({ message: 'Invalid salary period' });
    }

    const role = await Role.findOneAndUpdate(
      { _id: id, company: companyId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({
      message: 'Role updated successfully',
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.id;

    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const role = await Role.findOneAndDelete({ _id: id, company: companyId });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getRoleStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const roles = await Role.find({ company: companyId });

    const totalOpenings = roles.reduce((sum, role) => sum + role.openings, 0);
    const totalApplicants = roles.reduce((sum, role) => sum + role.applicants, 0);
    const totalAccepted = roles.reduce((sum, role) => sum + role.accepted, 0);
    const openRoles = roles.filter((r) => r.status === RoleStatus.OPEN).length;

    const acceptanceRate = totalApplicants > 0 ? Math.round((totalAccepted / totalApplicants) * 100) : 0;

    res.json({
      stats: {
        totalOpenings,
        totalApplicants,
        totalAccepted,
        openRoles,
        acceptanceRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/roles/student/matches
 * Fetches matching internship offers for a student using the Careero Engine
 */
export const getStudentMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized: Student ID required' });
    }

    // 1. Get Student Profile
    const profile = await StudentProfile.findOne({ user: studentId }).lean();
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please complete onboarding.' });
    }

    // 2. Extract completed events for the student
    const studentName = `${profile.basicInfo?.firstName || ''} ${profile.basicInfo?.lastName || ''}`.trim();
    // We find accumulations where this exact student name is marked as Completed
    const completedAccumulations = await Accumulation.find({
      'participantList': {
        $elemMatch: { name: studentName, status: 'Completed' }
      }
    }).lean();
    
    const completedEventIds = completedAccumulations.map(acc => acc._id.toString());

    // 3. Query Target Roles 
    // Optimization: Filter at database level by role status and matching course.
    const course = profile.basicInfo?.course;
    const rolesQuery: any = { status: RoleStatus.OPEN };
    
    if (course) {
      rolesQuery.$or = [
        { courses: { $exists: false } },
        { courses: { $size: 0 } },
        { courses: course }
      ];
    }

    // Populate company to get display details (using User model assumed reference for company)
    const openRoles = await Role.find(rolesQuery).populate('company', 'email').lean();

    // 4. Run Careero Match Engine
    const matches = [];
    for (const role of openRoles) {
      const evaluation = await evaluateCandidate(profile as any, completedEventIds, role as any);
      
      // Fetch the actual required events to show the student what they need
      const requiredEvents = await Accumulation.find({
        _id: { $in: role.accumulationIds || [] }
      }).select('_id title type points').lean();

      matches.push({
        role: {
          ...role,
          requiredEvents
        },
        careero: evaluation
      });
    }

    // 5. Rank Candidates based on computed Match Score
    matches.sort((a, b) => b.careero.matchScore - a.careero.matchScore);

    res.json({
      message: 'Careero Matches Evaluated',
      data: matches
    });

  } catch (error) {
    next(error);
  }
};

export const applyForRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized: Student ID required' });
    }

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.status !== RoleStatus.OPEN) {
      return res.status(400).json({ message: 'Role is no longer open for applications' });
    }

    const hasApplied = role.appliedStudents?.map(uid => uid.toString()).includes(studentId);

    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied for this role' });
    }

    if (!role.appliedStudents) {
      role.appliedStudents = [];
    }

    role.appliedStudents.push(studentId as any);
    role.applicants += 1;
    await role.save();

    res.json({ message: 'Application submitted successfully', role });
  } catch (error) {
    next(error);
  }
};
