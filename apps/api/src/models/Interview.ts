import mongoose, { Schema, Document } from 'mongoose';

export type InterviewStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
export type MeetingType = 'video' | 'phone' | 'in-person';

export interface IInterview extends Document {
  // References
  company: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  role: mongoose.Types.ObjectId;

  // Interview details
  date: Date;
  time: string;          // e.g., "09:00 AM"
  duration: number;      // in minutes (default 60)
  meetingType: MeetingType;
  meetingLink?: string;  // Video call link or address
  status: InterviewStatus;

  // Communication
  invitationSent: boolean;
  invitationSentAt?: Date;
  reminderSent: boolean;
  reminderSentAt?: Date;

  // Notes
  notes?: string;
  feedback?: string;
  rating?: number;       // 1-5

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
      min: 15,
      max: 180,
    },
    meetingType: {
      type: String,
      enum: ['video', 'phone', 'in-person'],
      required: true,
      default: 'video',
    },
    meetingLink: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
    },
    invitationSent: {
      type: Boolean,
      default: false,
    },
    invitationSentAt: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    feedback: {
      type: String,
      maxlength: 2000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
InterviewSchema.index({ company: 1, status: 1 });
InterviewSchema.index({ applicant: 1, status: 1 });
InterviewSchema.index({ date: 1, time: 1 });

// Virtual for checking if interview is today
InterviewSchema.virtual('isToday').get(function (this: IInterview) {
  const today = new Date();
  const interviewDate = new Date(this.date);
  return (
    today.getDate() === interviewDate.getDate() &&
    today.getMonth() === interviewDate.getMonth() &&
    today.getFullYear() === interviewDate.getFullYear()
  );
});

// Virtual for checking if interview is upcoming
InterviewSchema.virtual('isUpcoming').get(function (this: IInterview) {
  const now = new Date();
  const interviewDateTime = new Date(`${this.date} ${this.time}`);
  return interviewDateTime > now;
});

// Ensure virtuals are included in JSON responses
InterviewSchema.set('toJSON', { virtuals: true });
InterviewSchema.set('toObject', { virtuals: true });

export const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);
