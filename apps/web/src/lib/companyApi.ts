import { apiClient } from './apiClient';
import { ICompanyDetails, ICompanyProfileInput, ITargetStudentInput, IApplicantsResponse, IApplicantStats } from '@/types/company';

export interface CompanyDetailsResponse {
  message: string;
  data: ICompanyDetails;
}

export interface CompanyProfileResponse {
  message: string;
  profile: ICompanyDetails['company'];
}

export interface MessageResponse {
  message: string;
}

export interface ProfileCompletenessResponse {
  message: string;
  completenessScore: number;
  profile: {
    name: string;
    industry: string;
    size: string;
    hasLogo: boolean;
    hasDescription: boolean;
    targetStudentsCount: number;
    hasContactInfo: boolean;
    hasWebsite: boolean;
  };
}

// ===========================
// COMPANY DETAILS
// ===========================

/**
 * Get company details including company profile and user info
 * GET /api/v1/company/details
 */
export const getCompanyDetails = async (): Promise<CompanyDetailsResponse> => {
  const response = await apiClient.get<CompanyDetailsResponse>('/company/details');
  return response.data;
};

// ===========================
// COMPANY PROFILE
// ===========================

/**
 * Get company profile for authenticated user
 * GET /api/v1/company/profile
 */
export const getCompanyProfile = async (): Promise<CompanyProfileResponse> => {
  const response = await apiClient.get<CompanyProfileResponse>('/company/profile');
  return response.data;
};

/**
 * Update company profile (partial update with changed fields only)
 * PATCH /api/v1/company/profile
 */
export const updateCompanyProfile = async (data: Partial<ICompanyProfileInput>): Promise<CompanyProfileResponse> => {
  const response = await apiClient.patch<CompanyProfileResponse>('/company/profile', data);
  return response.data;
};

/**
 * Create or update company profile
 * PUT /api/v1/company/profile
 */
export const upsertCompanyProfile = async (data: ICompanyProfileInput): Promise<CompanyProfileResponse> => {
  const response = await apiClient.put<CompanyProfileResponse>('/company/profile', data);
  return response.data;
};

/**
 * Update company logo only
 * PATCH /api/v1/company/profile/logo
 */
export const updateCompanyLogo = async (logo: string): Promise<CompanyProfileResponse> => {
  const response = await apiClient.patch<CompanyProfileResponse>('/company/profile/logo', { logo });
  return response.data;
};

/**
 * Add a target student preference
 * POST /api/v1/company/profile/target-students
 */
export const addTargetStudent = async (data: ITargetStudentInput): Promise<CompanyProfileResponse> => {
  const response = await apiClient.post<CompanyProfileResponse>('/company/profile/target-students', data);
  return response.data;
};

/**
 * Remove a target student preference
 * DELETE /api/v1/company/profile/target-students/:id
 */
export const removeTargetStudent = async (id: string): Promise<CompanyProfileResponse> => {
  const response = await apiClient.delete<CompanyProfileResponse>(`/company/profile/target-students/${id}`);
  return response.data;
};

/**
 * Get company profile completeness score
 * GET /api/v1/company/profile/completeness
 */
export const getProfileCompleteness = async (): Promise<ProfileCompletenessResponse> => {
  const response = await apiClient.get<ProfileCompletenessResponse>('/company/profile/completeness');
  return response.data;
};

// ===========================
// APPLICANTS
// ===========================

/**
 * Get all applicants across company roles with Careero match scores
 * GET /api/v1/applicants/all
 */
export const getAllApplicantsWithScores = async (): Promise<IApplicantsResponse> => {
  const response = await apiClient.get<IApplicantsResponse>('/applicants/all');
  return response.data;
};

/**
 * Get applicants for a specific role with Careero match scores
 * GET /api/v1/applications/roles/:roleId/applicants
 */
export const getRoleApplicantsWithScores = async (roleId: string): Promise<IApplicantsResponse> => {
  const response = await apiClient.get<IApplicantsResponse>(`/applications/roles/${roleId}/applicants`);
  return response.data;
};

/**
 * Get application statistics for the company
 * GET /api/v1/applications/stats
 */
export const getApplicationStats = async (): Promise<{ stats: IApplicantStats }> => {
  const response = await apiClient.get<{ stats: IApplicantStats }>('/applications/stats');
  return response.data;
};
