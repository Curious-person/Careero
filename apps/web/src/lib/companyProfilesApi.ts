import { apiClient } from './apiClient';

export interface TargetStudent {
  _id?: string;
  field: string;
  level: string;
  skills: string[];
}

export interface CompanyProfile {
  _id: string;
  name: string;
  industry: string;
  size: string;
  founded: string;
  description: string;
  logo?: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  targetStudents: TargetStudent[];
  createdBySchool?: boolean;
}

export interface CreateCompanyData {
  name: string;
  industry: string;
  size: string;
  founded: string;
  description: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  targetStudents?: Omit<TargetStudent, '_id'>[];
  userEmail: string;
  userPassword: string;
}

export async function getAllCompanyProfiles(): Promise<CompanyProfile[]> {
  const res = await apiClient.get('/company/profiles');
  return res.data.profiles;
}

export async function createCompanyProfile(data: CreateCompanyData): Promise<CompanyProfile> {
  const res = await apiClient.post('/company/profiles', data);
  return res.data.profile;
}
