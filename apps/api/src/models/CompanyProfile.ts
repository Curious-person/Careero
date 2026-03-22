import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for Target Student Preference
 * Defines what kind of students the company is looking for
 */
export interface ITargetStudent {
  _id?: mongoose.Types.ObjectId;  // Optional _id for subdocuments
  field: string;          // Field of study (e.g., "Computer Science")
  level: string;          // Education level (e.g., "Bachelor's", "Master's")
  skills: string[];       // Required/preferred skills
}

/**
 * Interface for Company Profile
 * Contains all company information displayed in settings
 */
export interface ICompanyProfile extends Document {
  // User reference (company account)
  user: mongoose.Types.ObjectId;
  
  // Basic Information
  name: string;           // Company name
  industry: string;       // Industry sector
  size: string;           // Company size range (e.g., "50-200 employees")
  founded: string;        // Founded year
  description: string;    // Company description
  logo?: string;          // Company logo URL (base64 or CDN URL)
  
  // Contact Information
  website?: string;       // Company website URL
  email: string;          // Contact email
  phone?: string;         // Contact phone number
  address?: string;       // Physical address
  
  // Target Student Preferences
  targetStudents: ITargetStudent[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Target Student Schema
 * Embedded schema for target student preferences
 */
const TargetStudentSchema = new Schema<ITargetStudent>({
  field: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  level: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'High School',
      'Vocational',
      "Bachelor's",
      "Master's",
      'PhD',
      'Any',
    ],
  },
  skills: {
    type: [String],
    validate: {
      validator: (v: string[]) => v.length >= 0 && v.length <= 20,
      message: 'Maximum 20 skills allowed',
    },
  },
}, { _id: true });

/**
 * Company Profile Schema
 * Main schema for company profile data
 */
const CompanyProfileSchema = new Schema<ICompanyProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One profile per company user
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    size: {
      type: String,
      required: true,
      trim: true,
      enum: [
        '1-10 employees',
        '10-50 employees',
        '50-200 employees',
        '200-500 employees',
        '500-1000 employees',
        '1000+ employees',
      ],
    },
    founded: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}$/, 'Please enter a valid year (e.g., 2015)'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    logo: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL (e.g., https://www.example.com)'],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    targetStudents: {
      type: [TargetStudentSchema],
      validate: {
        validator: (v: ITargetStudent[]) => v.length >= 0 && v.length <= 10,
        message: 'Maximum 10 target student preferences allowed',
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Index for efficient queries
CompanyProfileSchema.index({ user: 1 });
CompanyProfileSchema.index({ industry: 1 });
CompanyProfileSchema.index({ 'targetStudents.field': 1 });

// Virtual for company profile completeness (not stored in DB)
CompanyProfileSchema.virtual('completenessScore').get(function (this: ICompanyProfile) {
  let score = 0;
  const maxScore = 100;

  // Basic info (40 points)
  if (this.name) score += 10;
  if (this.industry) score += 10;
  if (this.size) score += 10;
  if (this.founded) score += 10;

  // Contact info (30 points)
  if (this.email) score += 10;
  if (this.phone) score += 10;
  if (this.website) score += 10;

  // Profile content (30 points)
  if (this.description && this.description.length >= 100) score += 15;
  if (this.logo) score += 10;
  if (this.targetStudents && this.targetStudents.length > 0) score += 5;

  return Math.round((score / maxScore) * 100);
});

// Ensure virtuals are included in JSON responses
CompanyProfileSchema.set('toJSON', { virtuals: true });
CompanyProfileSchema.set('toObject', { virtuals: true });

export const CompanyProfile = mongoose.model<ICompanyProfile>('CompanyProfile', CompanyProfileSchema);
