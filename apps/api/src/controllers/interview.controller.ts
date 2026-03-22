import { Request, Response, NextFunction } from 'express';
import { Interview, IInterview, MeetingType } from '../models/Interview';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { sendInterviewInvitation } from '../services/email.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface ScheduleInterviewInput {
  applicantId: string;
  roleId: string;
  date: string;  // ISO date string
  time: string;  // e.g., "09:00 AM"
  duration?: number;
  meetingType: MeetingType;
  meetingLink?: string;
  notes?: string;
}

/**
 * Schedule a new interview
 * POST /api/v1/interviews/schedule
 */
export const scheduleInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const {
      applicantId,
      roleId,
      date,
      time,
      duration = 60,
      meetingType,
      meetingLink,
      notes,
    }: ScheduleInterviewInput = req.body;

    // Validate required fields
    if (!applicantId || !roleId || !date || !time || !meetingType) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['applicantId', 'roleId', 'date', 'time', 'meetingType'],
      });
    }

    // Verify role exists and belongs to company
    const role = await Role.findOne({ _id: roleId, company: companyId });
    if (!role) {
      return res.status(404).json({ message: 'Role not found or does not belong to your company' });
    }

    // Verify applicant exists
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // Check for scheduling conflicts
    const interviewDateTime = new Date(`${date}T${convertTimeTo24Hour(time)}`);
    const existingInterview = await Interview.findOne({
      company: companyId,
      date: {
        $gte: new Date(new Date(interviewDateTime).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(interviewDateTime).setHours(24, 0, 0, 0)),
      },
      time: time,
      status: { $nin: ['cancelled'] },
    });

    if (existingInterview) {
      return res.status(409).json({
        message: 'Time slot already booked for another interview',
      });
    }

    // Generate meeting link for video calls if not provided
    let finalMeetingLink = meetingLink;
    if (meetingType === 'video' && !finalMeetingLink) {
      // Generate a simple meeting link (in production, integrate with Zoom/Google Meet)
      finalMeetingLink = `https://meet.careero.com/${companyId}-${Date.now()}`;
    }

    // Create interview
    const interview = await Interview.create({
      company: companyId,
      applicant: applicantId,
      role: roleId,
      date: new Date(date),
      time,
      duration,
      meetingType,
      meetingLink: finalMeetingLink,
      status: 'pending',
      invitationSent: false,
      reminderSent: false,
      notes,
    });

    // Send invitation email
    try {
      await sendInterviewInvitation({
        to: applicant.email,
        applicantName: applicant.email.split('@')[0], // Use email prefix as name
        companyName: role.company.toString(), // Should be company name in production
        roleName: role.title,
        date,
        time,
        duration,
        meetingType,
        meetingLink: finalMeetingLink,
      });

      // Update invitation status
      interview.invitationSent = true;
      interview.invitationSentAt = new Date();
      await interview.save();
    } catch (emailError) {
      console.error('Failed to send interview invitation email:', emailError);
      // Don't fail the request, just log the error
    }

    // Populate and return
    const populatedInterview = await Interview.findById(interview._id)
      .populate('applicant', 'email name')
      .populate('role', 'title department');

    res.status(201).json({
      message: 'Interview scheduled successfully',
      interview: populatedInterview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all interviews for the company
 * GET /api/v1/interviews
 */
export const getCompanyInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { status, date } = req.query;

    const query: any = { company: companyId };

    if (status && ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'].includes(status as string)) {
      query.status = status;
    }

    if (date) {
      const targetDate = new Date(date as string);
      query.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(24, 0, 0, 0)),
      };
    }

    const interviews = await Interview.find(query)
      .populate('applicant', 'email name school major')
      .populate('role', 'title department')
      .sort({ date: 1, time: 1 });

    res.json({
      interviews,
      count: interviews.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific interview by ID
 * GET /api/v1/interviews/:id
 */
export const getInterviewById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id, company: companyId })
      .populate('applicant', 'email name school major')
      .populate('role', 'title department');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm an interview
 * PATCH /api/v1/interviews/:id/confirm
 */
export const confirmInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id, company: companyId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status === 'confirmed') {
      return res.status(400).json({ message: 'Interview is already confirmed' });
    }

    interview.status = 'confirmed';
    await interview.save();

    // TODO: Send confirmation email

    res.json({
      message: 'Interview confirmed successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an interview
 * PATCH /api/v1/interviews/:id/cancel
 */
export const cancelInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const interview = await Interview.findOne({ _id: id, company: companyId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'cancelled';
    interview.notes = reason ? `${interview.notes || ''}\n\nCancellation Reason: ${reason}` : interview.notes;
    await interview.save();

    // TODO: Send cancellation email

    res.json({
      message: 'Interview cancelled successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule an interview
 * PATCH /api/v1/interviews/:id/reschedule
 */
export const rescheduleInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;
    const { date, time, meetingLink } = req.body;

    const interview = await Interview.findOne({ _id: id, company: companyId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (date) interview.date = new Date(date);
    if (time) interview.time = time;
    if (meetingLink) interview.meetingLink = meetingLink;

    interview.status = 'rescheduled';
    interview.invitationSent = false; // Need to send new invitation
    await interview.save();

    // TODO: Send reschedule notification email

    res.json({
      message: 'Interview rescheduled successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete an interview and add feedback
 * PATCH /api/v1/interviews/:id/complete
 */
export const completeInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;
    const { feedback, rating } = req.body;

    const interview = await Interview.findOne({ _id: id, company: companyId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'completed';
    if (feedback) interview.feedback = feedback;
    if (rating) interview.rating = rating;
    await interview.save();

    res.json({
      message: 'Interview completed successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if interview is active (date/time matches today)
 * GET /api/v1/interviews/:id/is-active
 */
export const checkInterviewActive = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) {
      return res.status(401).json({ message: 'Unauthorized: Company ID required' });
    }

    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id, company: companyId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const now = new Date();
    const interviewDate = new Date(interview.date);
    const isToday =
      now.getDate() === interviewDate.getDate() &&
      now.getMonth() === interviewDate.getMonth() &&
      now.getFullYear() === interviewDate.getFullYear();

    // Parse time (e.g., "09:00 AM")
    const [timeStr, period] = interview.time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const interviewStartTime = new Date(interviewDate);
    interviewStartTime.setHours(hours, minutes, 0, 0);

    const interviewEndTime = new Date(interviewStartTime);
    interviewEndTime.setMinutes(interviewStartTime.getMinutes() + interview.duration);

    const isActive = isToday && now >= interviewStartTime && now <= interviewEndTime;

    res.json({
      isActive,
      isToday,
      interviewTime: interviewStartTime.toISOString(),
      endTime: interviewEndTime.toISOString(),
      currentTime: now.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to convert 12-hour time to 24-hour format
function convertTimeTo24Hour(time12h: string): string {
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
