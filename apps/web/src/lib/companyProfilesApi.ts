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

export interface CompanyRole {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  openings: number;
  applicants: number;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: string;
  skills: string[];
  status: string;
  points: number;
}

export interface CompanyAccumulation {
  _id: string;
  title: string;
  type: string;
  status: string;
  points: number;
  skillTags: string[];
  deadline: string;
  description: string;
}

export interface CompanyProfileDetails {
  roles: CompanyRole[];
  accumulations: CompanyAccumulation[];
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

export async function getCompanyProfileDetails(id: string): Promise<CompanyProfileDetails> {
  const res = await apiClient.get(`/company/profiles/${id}/details`);
  return res.data;
}
