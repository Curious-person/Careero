import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

const OtpSchema: Schema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// TTL Index to automatically delete expired OTPs from the database
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
