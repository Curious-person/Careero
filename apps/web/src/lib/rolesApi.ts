import { apiClient } from './apiClient';

export interface Role {
  _id: string;
  id?: string;
  company: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  openings: number;
  applicants: number;
  accepted: number;
  status: 'Open' | 'Closed' | 'Paused';
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: 'month' | 'hour' | 'year';
  description: string;
  skills: string[];
  accumulationIds: string[];
  points: number;
  postedDate: string;
  salaryRange?: string;
  createdAt: string;
  updatedAt: string;
  appliedStudents?: Array<{
    _id: string;
    email: string;
    name: string;
    basicInfo?: {
      firstName?: string;
      lastName?: string;
      course?: string;
      yearLevel?: string;
    };
    skillTags?: { tag: string; confidence: number }[];
    totalPoints?: number;
  }>;
}

export interface RoleStats {
  totalOpenings: number;
  totalApplicants: number;
  totalAccepted: number;
  openRoles: number;
  acceptanceRate: number;
}

export interface CreateRoleInput {
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  openings: number;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod?: 'month' | 'hour' | 'year';
  description: string;
  skills: string[];
  accumulationIds: string[];
}

export interface RolesResponse {
  roles: Role[];
  count: number;
}

export interface RolesWithApplicantsResponse {
  roles: Role[];
  count: number;
}

export interface RoleResponse {
  role: Role;
}

export interface StatsResponse {
  stats: RoleStats;
}

// Get all roles for the company
export const getRoles = async (search?: string, status?: string): Promise<RolesResponse> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await apiClient.get<RolesResponse>(`/roles?${params.toString()}`);
  return response.data;
};

// Get all company roles with applied students populated
export const getCompanyRolesWithApplicants = async (): Promise<RolesWithApplicantsResponse> => {
  const response = await apiClient.get<RolesWithApplicantsResponse>('/roles/company/applicants');
  return response.data;
};

// Get role statistics
export const getRoleStats = async (): Promise<StatsResponse> => {
  const response = await apiClient.get<StatsResponse>('/roles/stats');
  return response.data;
};

// Get a single role by ID
export const getRoleById = async (id: string): Promise<RoleResponse> => {
  const response = await apiClient.get<RoleResponse>(`/roles/${id}`);
  return response.data;
};

// Create a new role
export const createRole = async (data: CreateRoleInput): Promise<RoleResponse> => {
  const response = await apiClient.post<RoleResponse>('/roles', data);
  return response.data;
};

// Update a role
export const updateRole = async (id: string, data: Partial<CreateRoleInput>): Promise<RoleResponse> => {
  const response = await apiClient.put<RoleResponse>(`/roles/${id}`, data);
  return response.data;
};

// Delete a role
export const deleteRole = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/roles/${id}`);
  return response.data;
};

// Helper to format salary range
export const formatSalaryRange = (salaryMin: number, salaryMax: number, period: string): string => {
  const formatSalary = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH');
  };
  return `${formatSalary(salaryMin)}-${formatSalary(salaryMax)}/${period}`;
};

// Helper to transform API role to UI role (add id field for compatibility)
export const transformRole = (apiRole: Role): Role => {
  return {
    ...apiRole,
    id: apiRole._id || apiRole.id || '',
  };
};
