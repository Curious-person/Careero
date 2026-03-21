export type ActivityType = 'hackathon' | 'meetup' | 'workshop' | 'seminar' | 'conference' | 'other';

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  date: string;
  time: string;
  location: string;
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  year: number;
  enrolledAt: string;
  status: 'registered' | 'confirmed' | 'attended';
}

export interface ActivityFormData {
  title: string;
  description: string;
  type: ActivityType;
  date: string;
  time: string;
  location: string;
  maxStudents: number;
}
