import { Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { Role } from '../models/Role';
import { StudentProfile } from '../models/StudentProfile';
import { Accumulation } from '../models/Accumulation';
import { evaluateCandidate } from '../services/careero.service';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface PopulatedApplication {
  _id: Types.ObjectId;
  student: {
    _id: Types.ObjectId;
    email: string;
  };
  role: {
    _id: Types.ObjectId;
    title: string;
    department: string;
    skills: string[];
    accumulationIds: string[];
    points: number;
    minimumReadinessScore: number;
  };
  company: Types.ObjectId;
  status: string;
  appliedDate: Date;
}

interface ApplicantWithScore {
  id: string;
  name: string;
  email: string;
  topSkill: string;
  potential: number;
  activities: number;
  engagement: 'High' | 'Medium' | 'Low';
  matchBreakdown: {
    skillMatch: number;
    pointsMatch: number;
    eventsMatch: number;
    readinessMatch: number;
  };
}

/**
 * Get company dashboard statistics
 * GET /api/v1/dashboard/company/stats
 */
export const getCompanyDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    // Get all applications for the company
    const applications = await Application.find({ company: companyId })
      .populate('student', 'email')
      .populate('role', 'title department skills accumulationIds points minimumReadinessScore')
      .lean()
      .exec() as unknown as PopulatedApplication[];

    // Get unique students
    const uniqueStudentIds = Array.from(new Set(applications.map(app => app.student._id.toString())));

    // Get student profiles
    const studentProfiles = await StudentProfile.find({ user: { $in: uniqueStudentIds } });

    // Get completed events for each student
    const studentCompletedEvents = new Map<string, string[]>();
    for (const profile of studentProfiles) {
      const studentName = `${profile.basicInfo?.firstName || ''} ${profile.basicInfo?.lastName || ''}`.trim();

      const completedAccumulations = await Accumulation.find({
        'participantList': {
          $elemMatch: { name: studentName, status: 'Completed' }
        }
      }).lean();

      studentCompletedEvents.set(profile.user.toString(), completedAccumulations.map(acc => acc._id.toString()));
    }

    // Calculate stats
    const totalStudents = uniqueStudentIds.length;

    let totalPotentialScore = 0;
    let highEngagement = 0;
    let readyToHire = 0;

    // Get all open roles for matching
    const openRoles = await Role.find({ company: companyId, status: 'Open' });

    for (const profile of studentProfiles) {
      const studentId = profile.user.toString();
      const completedEvents = studentCompletedEvents.get(studentId) || [];

      // Find best match score across all company roles
      let bestMatchScore = 0;

      for (const role of openRoles) {
        const evaluation = await evaluateCandidate(profile, completedEvents, role);
        if (evaluation.matchScore > bestMatchScore) {
          bestMatchScore = evaluation.matchScore;
        }
      }

      // If no open roles, use a baseline calculation
      if (openRoles.length === 0) {
        bestMatchScore = Math.min(100, Math.round((profile.totalPoints / 500) * 80 + ((profile.skillTags?.length || 0) * 2)));
      }

      totalPotentialScore += bestMatchScore;

      // Count high engagement (activities >= 15 OR skillTags >= 5)
      const activityCount = (profile.skillTags?.length || 0) + (profile.certifications?.length || 0);
      if (activityCount >= 15 || profile.skillTags.length >= 5) {
        highEngagement++;
      }

      // Count ready to hire (match score >= 80%)
      if (bestMatchScore >= 80) {
        readyToHire++;
      }
    }

    const avgPotentialScore = totalStudents > 0 ? Math.round(totalPotentialScore / totalStudents) : 0;

    res.json({
      stats: {
        totalStudents,
        avgPotentialScore,
        highEngagement,
        readyToHire,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top applicants ranked by Careero match score
 * GET /api/v1/dashboard/company/top-applicants
 */
export const getCompanyTopApplicants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    // Get all applications for the company
    const applications = await Application.find({ company: companyId })
      .populate('student', 'email')
      .populate('role', 'title department skills accumulationIds points minimumReadinessScore')
      .sort({ appliedDate: -1 })
      .lean()
      .exec() as unknown as PopulatedApplication[];

    // Get unique students
    const uniqueStudentMap = new Map<string, {
      studentId: string;
      email: string;
      applications: PopulatedApplication[];
    }>();

    for (const app of applications) {
      const studentId = app.student._id.toString();
      if (!uniqueStudentMap.has(studentId)) {
        uniqueStudentMap.set(studentId, {
          studentId,
          email: app.student.email,
          applications: [],
        });
      }
      uniqueStudentMap.get(studentId)!.applications.push(app);
    }

    // Get student profiles
    const studentProfiles = await StudentProfile.find({
      user: { $in: Array.from(uniqueStudentMap.keys()) }
    });

    // Get completed events for each student
    const studentCompletedEvents = new Map<string, string[]>();
    for (const profile of studentProfiles) {
      const studentName = `${profile.basicInfo?.firstName || ''} ${profile.basicInfo?.lastName || ''}`.trim();

      const completedAccumulations = await Accumulation.find({
        'participantList': {
          $elemMatch: { name: studentName, status: 'Completed' }
        }
      }).lean();

      studentCompletedEvents.set(profile.user.toString(), completedAccumulations.map(acc => acc._id.toString()));
    }

    // Get all open roles for matching
    const openRoles = await Role.find({ company: companyId, status: 'Open' });

    // Calculate match scores for each student
    const applicantsWithScores: ApplicantWithScore[] = [];

    for (const profile of studentProfiles) {
      const studentId = profile.user.toString();
      const studentData = uniqueStudentMap.get(studentId);
      if (!studentData) continue;

      const completedEvents = studentCompletedEvents.get(studentId) || [];

      // Find best match score across all company roles
      let bestMatchScore = 0;
      let bestBreakdown = {
        skillMatch: 0,
        pointsMatch: 0,
        eventsMatch: 0,
        readinessMatch: 0,
      };

      for (const role of openRoles) {
        const evaluation = await evaluateCandidate(profile, completedEvents, role);
        if (evaluation.matchScore > bestMatchScore) {
          bestMatchScore = evaluation.matchScore;
          bestBreakdown = evaluation.breakdown;
        }
      }

      // If no open roles, use a baseline calculation
      if (openRoles.length === 0) {
        bestMatchScore = Math.min(100, Math.round((profile.totalPoints / 500) * 80 + ((profile.skillTags?.length || 0) * 2)));
        bestBreakdown = {
          skillMatch: Math.min(100, (profile.skillTags?.length || 0) * 10),
          pointsMatch: Math.min(100, Math.round((profile.totalPoints / 500) * 100)),
          eventsMatch: 50,
          readinessMatch: Math.min(100, Math.round((profile.totalPoints / 1000) * 80 + ((profile.skillTags?.length || 0) * 2))),
        };
      }

      // Determine top skill
      const topSkill = profile.skillTags?.length > 0
        ? profile.skillTags[0].tag
        : profile.basicInfo?.course || 'N/A';

      // Calculate activity count
      const activityCount = (profile.skillTags?.length || 0) + (profile.certifications?.length || 0) + studentData.applications.length;

      // Determine engagement level
      let engagement: 'High' | 'Medium' | 'Low' = 'Low';
      if (activityCount >= 15 || profile.skillTags.length >= 5) {
        engagement = 'High';
      } else if (activityCount >= 8 || profile.skillTags.length >= 3) {
        engagement = 'Medium';
      }

      applicantsWithScores.push({
        id: studentId,
        name: `${profile.basicInfo?.firstName || ''} ${profile.basicInfo?.lastName || ''}`.trim() || studentData.email.split('@')[0],
        email: studentData.email,
        topSkill,
        potential: bestMatchScore,
        activities: activityCount,
        engagement,
        matchBreakdown: bestBreakdown,
      });
    }

    // Sort by potential score (highest to lowest)
    applicantsWithScores.sort((a, b) => b.potential - a.potential);

    res.json({
      applicants: applicantsWithScores,
      count: applicantsWithScores.length,
    });
  } catch (error) {
    next(error);
  }
};
