export interface ITargetStudent {
  _id?: string;
  field: string;
  level: string;
  skills: string[];
}

export interface ITargetStudentInput {
  field: string;
  level: string;
  skills?: string[];
}

export interface ICompany {
  _id: string;
  name: string;
  industry: string;
  size: string;
  founded: string;
  description: string;
  logo: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  targetStudents: ITargetStudent[];
}

export interface ICompanyUser {
  _id: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ICompanyDetails {
  company: ICompany;
  user: ICompanyUser;
}

export interface ICompanyProfileInput {
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
  targetStudents?: ITargetStudentInput[];
}

// ===========================
// APPLICANT TYPES
// ===========================

export interface ICareeroBreakdown {
  skillMatch: number;
  pointsMatch: number;
  eventsMatch: number;
  readinessMatch: number;
}

export interface ICareeroResult {
  isEligible: boolean;
  matchScore: number;
  breakdown: ICareeroBreakdown;
  missingRequirements: string[];
}

export interface IApplicantStudent {
  _id: string;
  email: string;
  name: string;
  basicInfo?: {
    studentId?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    section?: string;
    course: string;
    yearLevel: string;
    term: string;
  };
  skillTags?: { tag: string; confidence: number }[];
  totalPoints?: number;
  primarySkill: string;
}

export interface IApplicantRole {
  _id: string;
  title: string;
  department: string;
}

export interface IApplicant {
  applicationId?: string;
  _id?: string;
  student: IApplicantStudent;
  role: IApplicantRole;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  notes?: string;
  appliedDate: string;
  careero: ICareeroResult;
  potential: number;
  engagement: 'Low' | 'Medium' | 'High';
  activities: number;
}

export interface IApplicantsResponse {
  applicants: IApplicant[];
  count: number;
}

export interface IApplicantStats {
  total: number;
  pending: number;
  reviewing: number;
  interview: number;
  accepted: number;
  rejected: number;
}
