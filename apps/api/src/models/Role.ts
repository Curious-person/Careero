import mongoose, { Schema, Document, Model } from 'mongoose';

export enum RoleType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  INTERNSHIP = 'Internship',
  CONTRACT = 'Contract',
}

export enum RoleStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  PAUSED = 'Paused',
}

export enum SalaryPeriod {
  MONTH = 'month',
  HOUR = 'hour',
  YEAR = 'year',
}

export interface IRole extends Document {
  company: mongoose.Types.ObjectId;
  title: string;
  department: string;
  location: string;
  type: RoleType;
  openings: number;
  applicants: number;
  accepted: number;
  status: RoleStatus;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: SalaryPeriod;
  description: string;
  skills: string[];
  accumulationIds: string[];
  points: number; // Calculated points based on skills and accumulations
  postedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    type: {
      type: String,
      enum: Object.values(RoleType),
      required: true,
    },
    openings: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    applicants: {
      type: Number,
      default: 0,
      min: 0,
    },
    accepted: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(RoleStatus),
      default: RoleStatus.OPEN,
    },
    salaryMin: {
      type: Number,
      required: true,
      min: 1,
    },
    salaryMax: {
      type: Number,
      required: true,
      min: 1,
    },
    salaryPeriod: {
      type: String,
      enum: Object.values(SalaryPeriod),
      default: SalaryPeriod.MONTH,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 1000,
    },
    skills: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 10,
        message: 'Skills must have between 1 and 10 items',
      },
    },
    accumulationIds: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: 'At least one accumulation ID is required',
      },
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient company-based queries
RoleSchema.index({ company: 1, status: 1 });

// Static method type definition
interface IRoleModel extends Model<IRole> {
  calculatePoints: (skills: string[], accumulationIds: string[]) => Promise<{
    totalPoints: number;
    breakdown: {
      skillPoints: number;
      accumulationPoints: number;
      skillCount: number;
      complexityMultiplier: number;
      totalAccumulationPoints: number;
      accumulationCount: number;
    };
  }>;
}

/**
 * Calculate role points based on skills and accumulations
 * Formula:
 *   Total Points = (Skill Points) + (Accumulation Points)
 *   
 *   Skill Points = Base Skill Value × Number of Skills × Complexity Multiplier
 *   - Base Skill Value: 50 points per skill
 *   - Complexity Multiplier: 1.0 + (0.1 × (skills.length - 1))
 *     (More skills = higher complexity = bonus multiplier)
 *   
 *   Accumulation Points = Sum of all linked accumulation points × 0.5
 *   - Accumulations contribute 50% of their point value to the role
 *   - This prevents accumulation points from dominating the calculation
 * 
 * Example:
 *   Role with 5 skills and accumulations worth 200 points:
 *   Skill Points = 50 × 5 × (1.0 + 0.1 × 4) = 50 × 5 × 1.4 = 350
 *   Accumulation Points = 200 × 0.5 = 100
 *   Total Points = 350 + 100 = 450
 */
RoleSchema.statics.calculatePoints = async function(skills: string[], accumulationIds: string[]) {
  // Skill points calculation
  const BASE_SKILL_VALUE = 50;
  const skillCount = skills.length;
  const complexityMultiplier = 1.0 + (0.1 * (skillCount - 1));
  const skillPoints = Math.round(BASE_SKILL_VALUE * skillCount * complexityMultiplier);

  // Accumulation points calculation
  const accumulations = await this.db.model('Accumulation').find({
    _id: { $in: accumulationIds }
  });
  
  const totalAccumulationPoints = accumulations.reduce((sum, acc) => sum + (acc.points || 0), 0);
  const ACCUMULATION_WEIGHT = 0.5;
  const accumulationPoints = Math.round(totalAccumulationPoints * ACCUMULATION_WEIGHT);

  // Total points
  const totalPoints = skillPoints + accumulationPoints;

  return {
    totalPoints,
    breakdown: {
      skillPoints,
      accumulationPoints,
      skillCount,
      complexityMultiplier,
      totalAccumulationPoints,
      accumulationCount: accumulations.length,
    },
  };
};

// Virtual for salary range display (not stored in DB)
RoleSchema.virtual('salaryRange').get(function (this: IRole) {
  const formatSalary = (amount: number) => {
    return '₱' + amount.toLocaleString('en-PH');
  };
  return `${formatSalary(this.salaryMin)}-${formatSalary(this.salaryMax)}/${this.salaryPeriod}`;
});

// Ensure virtuals are included in JSON responses
RoleSchema.set('toJSON', { virtuals: true });
RoleSchema.set('toObject', { virtuals: true });

export const Role = mongoose.model<IRole, IRoleModel>('Role', RoleSchema);
