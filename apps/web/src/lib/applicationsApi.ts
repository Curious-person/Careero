import { apiClient } from './apiClient';

export type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';

export interface Application {
  _id: string;
  student: {
    _id: string;
    email: string;
    basicInfo?: {
      firstName?: string;
      lastName?: string;
      course?: string;
      yearLevel?: string;
    };
    skillTags?: { tag: string; confidence: number }[];
    totalPoints?: number;
  };
  role: {
    _id: string;
    title: string;
    department: string;
  };
  status: ApplicationStatus;
  notes?: string;
  appliedDate: string;
  reviewedAt?: string;
}

export interface ApplicationsResponse {
  applications: Application[];
  count: number;
}

export interface ApplicationResponse {
  application: Application;
}

export interface MessageResponse {
  message: string;
  application?: Application;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  interview: number;
  accepted: number;
  rejected: number;
}

export interface StatsResponse {
  stats: ApplicationStats;
}

export interface Applicant {
  _id: string;
  email: string;
  basicInfo?: {
    firstName?: string;
    lastName?: string;
    course?: string;
    yearLevel?: string;
  };
  skillTags?: { tag: string; confidence: number }[];
  totalPoints?: number;
  applicationCount: number;
  latestApplication: {
    _id: string;
    role: {
      _id: string;
      title: string;
      department: string;
    };
    status: ApplicationStatus;
    appliedDate: string;
    notes?: string;
  };
  applications: Array<{
    _id: string;
    role: {
      _id: string;
      title: string;
      department: string;
    };
    status: ApplicationStatus;
    appliedDate: string;
    notes?: string;
  }>;
}

export interface ApplicantsResponse {
  applicants: Applicant[];
  stats: ApplicationStats;
  count: number;
}

/**
 * Get all applicant users for the company with stats
 */
export const getCompanyApplicants = async (status?: ApplicationStatus, role?: string): Promise<ApplicantsResponse> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (role) params.append('role', role);

  const response = await apiClient.get<ApplicantsResponse>(`/applicants?${params.toString()}`);
  return response.data;
};

/**
 * Get all applications for the company
 */
export const getCompanyApplications = async (status?: ApplicationStatus, role?: string): Promise<ApplicationsResponse> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (role) params.append('role', role);

  const response = await apiClient.get<ApplicationsResponse>(`/applications?${params.toString()}`);
  return response.data;
};

/**
 * Get a single application by ID
 */
export const getApplicationById = async (id: string): Promise<ApplicationResponse> => {
  const response = await apiClient.get<ApplicationResponse>(`/applications/${id}`);
  return response.data;
};

/**
 * Save/update notes for an application
 */
export const saveApplicationNotes = async (id: string, notes: string): Promise<MessageResponse> => {
  const response = await apiClient.patch<MessageResponse>(`/applications/${id}/notes`, { notes });
  return response.data;
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (id: string, status: ApplicationStatus): Promise<MessageResponse> => {
  const response = await apiClient.patch<MessageResponse>(`/applications/${id}/status`, { status });
  return response.data;
};

/**
 * Get application statistics
 */
export const getApplicationStats = async (): Promise<StatsResponse> => {
  const response = await apiClient.get<StatsResponse>('/applications/stats');
  return response.data;
};
