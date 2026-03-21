import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicRecord {
  subject: string;
  grade: number;
  units: number;
}

export interface ICertification {
  fileName: string;
  fileData?: string; // Optional raw base64 or S3 URL
  ocrText: string;
  classification?: any; // Native AI Xenova object { labels: [], scores: [] }
  verified: boolean;
  awardedPoints: number;
}

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  basicInfo: {
    studentId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    section?: string;
    course: string;
    yearLevel: string;
    term: string;
  };
  academicRecords: IAcademicRecord[];
  skillTags: { tag: string; confidence: number }[];
  certifications: ICertification[];
  totalPoints: number;
  pointsBreakdown?: {
    academic: number;
    cert: number;
    accumulations: number;
    achievement: number;
    hardSkills: number;
    softSkills: number;
    
    rawAcademic?: number;
    rawCert?: number;
    rawAccumulations?: number;
    rawAchievement?: number;
    rawHardSkills?: number;
    rawSoftSkills?: number;
  };
  resumeMarkdown?: string;
  status: 'PENDING_ONBOARDING' | 'UNDER_EVALUATION' | 'VERIFIED' | 'REJECTED';
}

const AcademicRecordSchema = new Schema<IAcademicRecord>({
  subject: { type: String, required: true },
  grade: { type: Number, required: true },
  units: { type: Number, required: true, default: 3 },
});

const CertificationSchema = new Schema<ICertification>({
  fileName: { type: String, required: true },
  fileData: { type: String },
  ocrText: { type: String },
  classification: { type: Schema.Types.Mixed },
  verified: { type: Boolean, default: false },
  awardedPoints: { type: Number, default: 0 },
});

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    basicInfo: {
      studentId: { type: String },
      firstName: { type: String },
      lastName: { type: String },
      middleName: { type: String },
      section: { type: String },
      course: { type: String },
      yearLevel: { type: String },
      term: { type: String },
    },
    academicRecords: [AcademicRecordSchema],
    skillTags: [{
      tag: { type: String, required: true },
      confidence: { type: Number, required: true, min: 0, max: 1 }
    }],
    certifications: [CertificationSchema],
    totalPoints: { type: Number, default: 0 },
    pointsBreakdown: {
      academic: { type: Number, default: 0 },
      cert: { type: Number, default: 0 },
      accumulations: { type: Number, default: 0 },
      achievement: { type: Number, default: 0 },
      hardSkills: { type: Number, default: 0 },
      softSkills: { type: Number, default: 0 },

      rawAcademic: { type: Number, default: 0 },
      rawCert: { type: Number, default: 0 },
      rawAccumulations: { type: Number, default: 0 },
      rawAchievement: { type: Number, default: 0 },
      rawHardSkills: { type: Number, default: 0 },
      rawSoftSkills: { type: Number, default: 0 },
    },
    resumeMarkdown: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING_ONBOARDING', 'UNDER_EVALUATION', 'VERIFIED', 'REJECTED'],
      default: 'PENDING_ONBOARDING',
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
