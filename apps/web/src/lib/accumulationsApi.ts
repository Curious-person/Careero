import { apiClient } from './apiClient';

export type AccumSource = 'school' | 'company';
export type AccumStatus = 'Active' | 'Closing Soon' | 'Ended';
export type AccumType = 'Task' | 'Challenge' | 'Course' | 'Event';

// Type-specific sub-document types
export interface Challenge {
  title: string;
  description: string;
}

export interface Module {
  title: string;
  description: string;
}

export interface AgendaItem {
  time: string;
  activity: string;
}

export interface Task {
  title: string;
  description: string;
}

export interface Participant {
  name: string;
  course: string;
  status: 'In Progress' | 'Completed';
}

export interface ParticipantGrade {
  participantName: string;
  grade: string;
  skillRatings: Record<string, number>;
  feedback: string;
}

export interface InCharge {
  name: string;
  role: string;
  email: string;
}

export interface Accumulation {
  _id: string;
  title: string;
  type: AccumType;
  source: AccumSource;
  createdBy: 'school' | 'company';
  field: string;
  courses: string[];
  deadline: string;
  duration: string;
  points: number;
  status: AccumStatus;
  participants: number;
  description: string;
  skillTags: string[];
  resourceLink?: string;
  objectives: string[];
  inCharge: InCharge[];
  participantList: Participant[];
  grades: ParticipantGrade[];
  // type-specific
  challenges?: { title: string; description: string }[];
  modules?: { title: string; description: string }[];
  agenda?: { time: string; activity: string }[];
  tasks?: { title: string; description: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccumulationInput {
  title: string;
  type: AccumType;
  courses: string[];
  deadline: string;
  duration: string;
  points: number;
  description: string;
  skillTags?: string[];
  resourceLink?: string;
  objectives?: string[];
  inCharge?: { name: string; role: string; email: string }[];
  challenges?: { title: string; description: string }[];
  modules?: { title: string; description: string }[];
  agenda?: { time: string; activity: string }[];
  tasks?: { title: string; description: string }[];
}

// Extended type for form usage with all fields initialized
export interface CreateAccumulationFormData extends CreateAccumulationInput {
  skillTags: string[];
  objectives: string[];
  inCharge: { name: string; role: string; email: string }[];
}

export interface AccumulationsResponse {
  message: string;
  data: Accumulation[];
}

export interface AccumulationResponse {
  message: string;
  data: Accumulation;
}

export interface MessageResponse {
  message: string;
}

// ===========================
// SHARED OPERATIONS
// ===========================

/**
 * Get all accumulations (optionally filtered by source)
 * Accessible by: school, company
 */
export const getAccumulations = async (source?: AccumSource): Promise<AccumulationsResponse> => {
  const params = source ? `?source=${source}` : '';
  const response = await apiClient.get<AccumulationsResponse>(`/accumulations${params}`);
  return response.data;
};

/**
 * Get a single accumulation by ID
 * Accessible by: school, company
 */
export const getAccumulationById = async (id: string): Promise<AccumulationResponse> => {
  const response = await apiClient.get<AccumulationResponse>(`/accumulations/${id}`);
  return response.data;
};

// ===========================
// SCHOOL OPERATIONS
// ===========================

/**
 * Get all accumulations created by school
 * Accessible by: school only
 */
export const getMySchoolAccumulations = async (): Promise<AccumulationsResponse> => {
  const response = await apiClient.get<AccumulationsResponse>('/accumulations/school/my');
  return response.data;
};

/**
 * Create a new school accumulation
 * Accessible by: school only
 */
export const createSchoolAccumulation = async (data: CreateAccumulationInput): Promise<AccumulationResponse> => {
  const response = await apiClient.post<AccumulationResponse>('/accumulations/school', data);
  return response.data;
};

/**
 * End a school accumulation
 * Accessible by: school only
 */
export const endSchoolAccumulation = async (id: string): Promise<AccumulationResponse> => {
  const response = await apiClient.patch<AccumulationResponse>(`/accumulations/school/${id}/end`);
  return response.data;
};

/**
 * Grade a participant in a school accumulation
 * Accessible by: school only
 */
export const gradeSchoolParticipant = async (
  id: string,
  participantName: string,
  gradeData: { grade: string; skillRatings: Record<string, number>; feedback: string }
): Promise<AccumulationResponse> => {
  const response = await apiClient.post<AccumulationResponse>(`/accumulations/school/${id}/grade`, {
    participantName,
    ...gradeData,
  });
  return response.data;
};

/**
 * Delete a school accumulation
 * Accessible by: school only
 */
export const deleteSchoolAccumulation = async (id: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/accumulations/school/${id}`);
  return response.data;
};

// ===========================
// COMPANY OPERATIONS
// ===========================

/**
 * Get all company accumulations (for dropdowns/selection)
 * Accessible by: company only
 */
export const getCompanyAccumulations = async (): Promise<AccumulationsResponse> => {
  const response = await apiClient.get<AccumulationsResponse>('/accumulations/company');
  return response.data;
};

/**
 * Get all accumulations created by company
 * Accessible by: company only
 */
export const getMyCompanyAccumulations = async (): Promise<AccumulationsResponse> => {
  const response = await apiClient.get<AccumulationsResponse>('/accumulations/company/my');
  return response.data;
};

/**
 * Create a new company accumulation
 * Accessible by: company only
 */
export const createCompanyAccumulation = async (data: CreateAccumulationInput): Promise<AccumulationResponse> => {
  const response = await apiClient.post<AccumulationResponse>('/accumulations/company', data);
  return response.data;
};

/**
 * End a company accumulation
 * Accessible by: company only
 */
export const endCompanyAccumulation = async (id: string): Promise<AccumulationResponse> => {
  const response = await apiClient.patch<AccumulationResponse>(`/accumulations/company/${id}/end`);
  return response.data;
};

/**
 * Grade a participant in a company accumulation
 * Accessible by: company only
 */
export const gradeCompanyParticipant = async (
  id: string,
  participantName: string,
  gradeData: { grade: string; skillRatings: Record<string, number>; feedback: string }
): Promise<AccumulationResponse> => {
  const response = await apiClient.post<AccumulationResponse>(`/accumulations/company/${id}/grade`, {
    participantName,
    ...gradeData,
  });
  return response.data;
};

/**
 * Delete a company accumulation
 * Accessible by: company only
 */
export const deleteCompanyAccumulation = async (id: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/accumulations/company/${id}`);
  return response.data;
};
