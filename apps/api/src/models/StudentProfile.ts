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
  skillTags: string[];
  certifications: ICertification[];
  totalPoints: number;
  pointsBreakdown: {
    academic: number;
    cert: number;
    achievement: number;
  };
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
    skillTags: [{ type: String }],
    certifications: [CertificationSchema],
    totalPoints: { type: Number, default: 0 },
    pointsBreakdown: {
      academic: { type: Number, default: 0 },
      cert: { type: Number, default: 0 },
      achievement: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['PENDING_ONBOARDING', 'UNDER_EVALUATION', 'VERIFIED', 'REJECTED'],
      default: 'PENDING_ONBOARDING',
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
