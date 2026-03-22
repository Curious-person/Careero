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
