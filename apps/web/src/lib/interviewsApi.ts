import { apiClient } from './apiClient';

export type InterviewStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
export type MeetingType = 'video' | 'phone' | 'in-person';

export interface Interview {
  _id: string;
  company: string;
  applicant: string & { email?: string; name?: string; school?: string; major?: string };
  role: string & { title?: string; department?: string };
  date: string;
  time: string;
  duration: number;
  meetingType: MeetingType;
  meetingLink?: string;
  status: InterviewStatus;
  invitationSent: boolean;
  invitationSentAt?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleInterviewInput {
  applicantId: string;
  roleId: string;
  date: string;
  time: string;
  duration?: number;
  meetingType: MeetingType;
  meetingLink?: string;
  notes?: string;
}

export interface InterviewsResponse {
  interviews: Interview[];
  count: number;
}

export interface InterviewResponse {
  interview: Interview;
}

export interface InterviewActiveResponse {
  isActive: boolean;
  isToday: boolean;
  interviewTime: string;
  endTime: string;
  currentTime: string;
}

/**
 * Schedule a new interview
 */
export const scheduleInterview = async (data: ScheduleInterviewInput): Promise<InterviewResponse> => {
  const response = await apiClient.post<InterviewResponse>('/interviews/schedule', data);
  return response.data;
};

/**
 * Get all company interviews
 */
export const getCompanyInterviews = async (status?: InterviewStatus, date?: string): Promise<InterviewsResponse> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (date) params.append('date', date);
  
  const response = await apiClient.get<InterviewsResponse>(`/interviews?${params.toString()}`);
  return response.data;
};

/**
 * Get a specific interview by ID
 */
export const getInterviewById = async (id: string): Promise<InterviewResponse> => {
  const response = await apiClient.get<InterviewResponse>(`/interviews/${id}`);
  return response.data;
};

/**
 * Check if interview is active (date/time matches current time)
 */
export const checkInterviewActive = async (id: string): Promise<InterviewActiveResponse> => {
  const response = await apiClient.get<InterviewActiveResponse>(`/interviews/${id}/is-active`);
  return response.data;
};

/**
 * Confirm an interview
 */
export const confirmInterview = async (id: string): Promise<InterviewResponse> => {
  const response = await apiClient.patch<InterviewResponse>(`/interviews/${id}/confirm`);
  return response.data;
};

/**
 * Cancel an interview
 */
export const cancelInterview = async (id: string, reason?: string): Promise<InterviewResponse> => {
  const response = await apiClient.patch<InterviewResponse>(`/interviews/${id}/cancel`, { reason });
  return response.data;
};

/**
 * Reschedule an interview
 */
export const rescheduleInterview = async (
  id: string,
  data: { date?: string; time?: string; meetingLink?: string }
): Promise<InterviewResponse> => {
  const response = await apiClient.patch<InterviewResponse>(`/interviews/${id}/reschedule`, data);
  return response.data;
};

/**
 * Complete an interview with feedback
 */
export const completeInterview = async (
  id: string,
  data: { feedback?: string; rating?: number }
): Promise<InterviewResponse> => {
  const response = await apiClient.patch<InterviewResponse>(`/interviews/${id}/complete`, data);
  return response.data;
};
