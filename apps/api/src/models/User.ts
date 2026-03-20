import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  COMPANY = 'company',
  SCHOOL = 'school',
}

export interface IUser extends Document {
  email: string;
  password?: string;
  studentId?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // Avoid returning passwords by default
    role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
