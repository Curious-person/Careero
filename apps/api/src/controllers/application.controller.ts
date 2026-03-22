import { Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Accumulation } from '../models/Accumulation';
import { Document, Types } from 'mongoose';
import { evaluateCandidate } from '../services/careero.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface PopulatedApplication extends Document {
  _id: Types.ObjectId;
  student: {
    _id: Types.ObjectId;
    email: string;
  };
  role: {
    _id: Types.ObjectId;
    title: string;
    department: string;
  };
  company: Types.ObjectId;
  status: string;
  notes?: string;
  appliedDate: Date;
  reviewedAt?: Date;
  reviewedBy?: {
    _id: Types.ObjectId;
    email: string;
  } | null;
}

/**
 * Get all applications for the company
 * GET /api/v1/applications
 */
export const getCompanyApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { status, role } = req.query;

    const query: any = { company: companyId };

    if (status && ['pending', 'reviewing', 'interview', 'accepted', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    if (role) {
      query.role = role;
    }

    const applications = await Application.find(query)
      .populate('student', 'email')
      .populate('role', 'title department')
      .populate('reviewedBy', 'email')
      .sort({ appliedDate: -1 }) as unknown as PopulatedApplication[];

    // Get student profiles for additional info
    const studentIds = applications.map(app => app.student._id);
    const studentProfiles = await StudentProfile.find({ user: { $in: studentIds } });

    // Enrich applications with student profile data
    const enrichedApplications = applications.map(app => {
      const profile = studentProfiles.find(p => p.user.toString() === app.student._id.toString());
      return {
        _id: app._id,
        student: {
          _id: app.student._id,
          email: app.student.email,
          basicInfo: profile?.basicInfo,
          skillTags: profile?.skillTags,
          totalPoints: profile?.totalPoints,
        },
        role: app.role,
        status: app.status,
        notes: app.notes,
        appliedDate: app.appliedDate,
        reviewedAt: app.reviewedAt,
        reviewedBy: app.reviewedBy,
      };
    });

    res.json({
      applications: enrichedApplications,
      count: enrichedApplications.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single application by ID
 * GET /api/v1/applications/:id
 */
export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;

    const application = await Application.findOne({ _id: id, company: companyId })
      .populate('student', 'email')
      .populate('role', 'title department') as unknown as PopulatedApplication | null;

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: application.student._id });

    res.json({
      application: {
        _id: application._id,
        student: {
          _id: application.student._id,
          email: application.student.email,
          basicInfo: studentProfile?.basicInfo,
          skillTags: studentProfile?.skillTags,
          totalPoints: studentProfile?.totalPoints,
        },
        role: application.role,
        status: application.status,
        notes: application.notes,
        appliedDate: application.appliedDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save/update notes for an application
 * PATCH /api/v1/applications/:id/notes
 */
export const saveApplicationNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ message: 'Notes are required' });
    }

    if (notes.length > 2000) {
      return res.status(400).json({ message: 'Notes must be less than 2000 characters' });
    }

    const application = await Application.findOne({ _id: id, company: companyId });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.notes = notes;
    application.reviewedAt = new Date();
    application.reviewedBy = new Types.ObjectId(companyId);
    
    // If status is pending, change to reviewing when notes are added
    if (application.status === 'pending') {
      application.status = 'reviewing';
    }

    await application.save();

    res.json({
      message: 'Notes saved successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status
 * PATCH /api/v1/applications/:id/status
 */
export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'reviewing', 'interview', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findOne({ _id: id, company: companyId });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get application statistics for the company
 * GET /api/v1/applications/stats
 */
export const getApplicationStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const applications = await Application.find({ company: companyId });

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      reviewing: applications.filter(a => a.status === 'reviewing').length,
      interview: applications.filter(a => a.status === 'interview').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applicant users for the company (with their application stats)
 * GET /api/v1/applicants
 */
export const getCompanyApplicants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { status, role } = req.query;

    const query: any = { company: companyId };

    if (status && ['pending', 'reviewing', 'interview', 'accepted', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    if (role) {
      query.role = role;
    }

    const applications = await Application.find(query)
      .populate('student', 'email')
      .populate('role', 'title department')
      .populate('reviewedBy', 'email')
      .sort({ appliedDate: -1 }) as unknown as PopulatedApplication[];

    // Get student profiles for additional info
    const studentIds = applications.map(app => app.student._id);
    const studentProfiles = await StudentProfile.find({ user: { $in: studentIds } });

    // Get unique students (in case a student applied multiple times)
    const uniqueStudentMap = new Map<string, any>();

    for (const app of applications) {
      const studentId = app.student._id.toString();
      const profile = studentProfiles.find(p => p.user.toString() === studentId);

      if (!uniqueStudentMap.has(studentId)) {
        uniqueStudentMap.set(studentId, {
          _id: studentId,
          email: app.student.email,
          basicInfo: profile?.basicInfo,
          skillTags: profile?.skillTags,
          totalPoints: profile?.totalPoints,
          applications: [],
        });
      }

      uniqueStudentMap.get(studentId).applications.push({
        _id: app._id,
        role: app.role,
        status: app.status,
        appliedDate: app.appliedDate,
        notes: app.notes,
      });
    }

    const applicants = Array.from(uniqueStudentMap.values()).map(student => ({
      ...student,
      applicationCount: student.applications.length,
      latestApplication: student.applications[0],
    }));

    // Calculate stats
    const allApplications = await Application.find({ company: companyId });
    const stats = {
      total: allApplications.length,
      pending: allApplications.filter(a => a.status === 'pending').length,
      reviewing: allApplications.filter(a => a.status === 'reviewing').length,
      interview: allApplications.filter(a => a.status === 'interview').length,
      accepted: allApplications.filter(a => a.status === 'accepted').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
    };

    res.json({
      applicants,
      stats,
      count: applicants.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get applicants for a specific role with Careero match scores
 * GET /api/v1/applications/roles/:roleId/applicants
 */
export const getRoleApplicantsWithScores = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { roleId } = req.params;

    // Verify the role belongs to the company
    const role = await Role.findOne({ _id: roleId, company: companyId });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Get all applications for this role
    const applications = await Application.find({ role: roleId, company: companyId })
      .populate('student', 'email')
      .sort({ appliedDate: -1 }) as unknown as PopulatedApplication[];

    // Get student profiles
    const studentIds = applications.map(app => app.student._id);
    const studentProfiles = await StudentProfile.find({ user: { $in: studentIds } });

    // Get completed events for each student
    const applicantsWithScores = await Promise.all(
      applications.map(async (app) => {
        const profile = studentProfiles.find(p => p.user.toString() === app.student._id.toString());
        
        // Get student's completed events (accumulations)
        const studentName = profile?.basicInfo 
          ? `${profile.basicInfo.firstName || ''} ${profile.basicInfo.lastName || ''}`.trim()
          : app.student.email;
        
        const completedAccumulations = await Accumulation.find({
          'participantList': {
            $elemMatch: { name: studentName, status: 'Completed' }
          }
        }).lean();

        const completedEventIds = completedAccumulations.map(acc => acc._id.toString());

        // Run Careero evaluation
        const careeroResult = await evaluateCandidate(
          profile as any,
          completedEventIds,
          role as any
        );

        // Calculate engagement level based on activity
        let engagement = 'Low';
        const activityScore = (profile?.totalPoints || 0) / 100;
        if (activityScore > 15) engagement = 'High';
        else if (activityScore > 8) engagement = 'Medium';

        // Get primary skill
        const primarySkill = profile?.skillTags?.length 
          ? profile.skillTags[0].tag 
          : 'No skills listed';

        return {
          _id: app._id,
          student: {
            _id: app.student._id,
            email: app.student.email,
            name: studentName || app.student.email.split('@')[0],
            basicInfo: profile?.basicInfo,
            skillTags: profile?.skillTags,
            totalPoints: profile?.totalPoints,
            primarySkill,
          },
          role: app.role,
          status: app.status,
          notes: app.notes,
          appliedDate: app.appliedDate,
          careero: careeroResult,
          potential: careeroResult.matchScore,
          engagement,
          activities: Math.floor((profile?.totalPoints || 0) / 50),
        };
      })
    );

    // Sort by potential (match score) from highest to lowest
    applicantsWithScores.sort((a, b) => b.potential - a.potential);

    res.json({
      role: {
        _id: role._id,
        title: role.title,
        department: role.department,
      },
      applicants: applicantsWithScores,
      count: applicantsWithScores.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applicants across all company roles with Careero match scores
 * GET /api/v1/applicants/all
 */
export const getAllCompanyApplicantsWithScores = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    // Get all roles for the company
    const roles = await Role.find({ company: companyId });
    
    if (roles.length === 0) {
      return res.json({
        applicants: [],
        count: 0,
      });
    }

    const roleIds = roles.map(r => r._id);

    // Get all applications for all company roles
    const applications = await Application.find({ role: { $in: roleIds }, company: companyId })
      .populate('student', 'email')
      .populate('role', 'title department')
      .sort({ appliedDate: -1 }) as unknown as PopulatedApplication[];

    // Get unique students (in case a student applied to multiple roles)
    const studentIds = [...new Set(applications.map(app => app.student._id.toString()))];
    const studentProfiles = await StudentProfile.find({ user: { $in: studentIds } });

    // Get unique student map with their best match score
    const studentMap = new Map<string, any>();

    for (const app of applications) {
      const studentId = app.student._id.toString();
      const profile = studentProfiles.find(p => p.user.toString() === studentId);
      
      // Get student's completed events
      const studentName = profile?.basicInfo 
        ? `${profile.basicInfo.firstName || ''} ${profile.basicInfo.lastName || ''}`.trim()
        : app.student.email;
      
      const completedAccumulations = await Accumulation.find({
        'participantList': {
          $elemMatch: { name: studentName, status: 'Completed' }
        }
      }).lean();

      const completedEventIds = completedAccumulations.map(acc => acc._id.toString());

      // Find the role this student applied to
      const appliedRole = roles.find(r => r._id.toString() === app.role._id.toString());
      
      if (!appliedRole) continue;

      // Run Careero evaluation for this role
      const careeroResult = await evaluateCandidate(
        profile as any,
        completedEventIds,
        appliedRole as any
      );

      // Calculate engagement level
      let engagement = 'Low';
      const activityScore = (profile?.totalPoints || 0) / 100;
      if (activityScore > 15) engagement = 'High';
      else if (activityScore > 8) engagement = 'Medium';

      // Get primary skill
      const primarySkill = profile?.skillTags?.length 
        ? profile.skillTags[0].tag 
        : 'No skills listed';

      const applicantData = {
        applicationId: app._id,
        student: {
          _id: studentId,
          email: app.student.email,
          name: studentName || app.student.email.split('@')[0],
          basicInfo: profile?.basicInfo,
          skillTags: profile?.skillTags,
          totalPoints: profile?.totalPoints,
          primarySkill,
        },
        role: {
          _id: appliedRole._id,
          title: appliedRole.title,
          department: appliedRole.department,
        },
        status: app.status,
        notes: app.notes,
        appliedDate: app.appliedDate,
        careero: careeroResult,
        potential: careeroResult.matchScore,
        engagement,
        activities: Math.floor((profile?.totalPoints || 0) / 50),
      };

      // Keep the student with the highest potential score
      if (!studentMap.has(studentId) || studentMap.get(studentId).potential < applicantData.potential) {
        studentMap.set(studentId, applicantData);
      }
    }

    const applicants = Array.from(studentMap.values());

    // Sort by potential (match score) from highest to lowest
    applicants.sort((a, b) => b.potential - a.potential);

    res.json({
      applicants,
      count: applicants.length,
    });
  } catch (error) {
    next(error);
  }
};
