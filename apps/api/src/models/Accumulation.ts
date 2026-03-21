import mongoose, { Schema, Document } from 'mongoose';

export type AccumSource = 'school' | 'company';
export type AccumStatus = 'Active' | 'Closing Soon' | 'Ended';
export type AccumType = 'Task' | 'Challenge' | 'Course' | 'Event';

export interface IParticipant {
  name: string;
  course: string;
  status: 'In Progress' | 'Completed';
}

export interface IParticipantGrade {
  participantName: string;
  grade: string;
  skillRatings: Record<string, number>;
  feedback: string;
}

export interface IInCharge {
  name: string;
  role: string;
  email: string;
}

export interface IAccumulation extends Document {
  title: string;
  type: AccumType;
  source: AccumSource;
  createdBy: string;
  field: string;
  courses: string[];
  deadline: string;
  duration: string;
  points: number;
  status: AccumStatus;
  participants: number;
  description: string;
  skillTags: string[];
  resourceLink?: string;
  objectives: string[];
  inCharge: IInCharge[];
  participantList: IParticipant[];
  grades: IParticipantGrade[];
  // type-specific
  challenges?: { title: string; description: string }[];
  modules?: { title: string; description: string }[];
  agenda?: { time: string; activity: string }[];
  tasks?: { title: string; description: string }[];
}

const ParticipantSchema = new Schema<IParticipant>({
  name: { type: String, required: true },
  course: { type: String, required: true },
  status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
});

const ParticipantGradeSchema = new Schema<IParticipantGrade>({
  participantName: { type: String, required: true },
  grade: { type: String, default: '' },
  skillRatings: { type: Map, of: Number, default: {} },
  feedback: { type: String, default: '' },
});

const InChargeSchema = new Schema<IInCharge>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
});

const AccumulationSchema = new Schema<IAccumulation>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['Task', 'Challenge', 'Course', 'Event'], required: true },
    source: { type: String, enum: ['school', 'company'], required: true },
    createdBy: { type: String, required: true },
    field: { type: String, default: '' },
    courses: [{ type: String }],
    deadline: { type: String, required: true },
    duration: { type: String, required: true },
    points: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Closing Soon', 'Ended'], default: 'Active' },
    participants: { type: Number, default: 0 },
    description: { type: String, default: '' },
    skillTags: [{ type: String }],
    resourceLink: { type: String },
    objectives: [{ type: String }],
    inCharge: [InChargeSchema],
    participantList: [ParticipantSchema],
    grades: [ParticipantGradeSchema],
    challenges: [{ title: String, description: String }],
    modules: [{ title: String, description: String }],
    agenda: [{ time: String, activity: String }],
    tasks: [{ title: String, description: String }],
  },
  { timestamps: true, collection: 'accumulations' }
);

export const Accumulation = mongoose.model<IAccumulation>('Accumulation', AccumulationSchema);
