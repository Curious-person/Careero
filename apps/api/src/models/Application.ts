import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  student: mongoose.Types.ObjectId;
  role: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  notes?: string;
  appliedDate: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'interview', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for efficient company-based queries
ApplicationSchema.index({ company: 1, status: 1 });
ApplicationSchema.index({ student: 1, role: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
