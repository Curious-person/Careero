import type { Applicant, ApplicationStatus } from './applicationsApi';
import type { Interview } from './interviewsApi';

// Realistic student applicant data for Philippines university setting
export const mockApplicants: Applicant[] = [
  {
    _id: 'stu001',
    email: 'maria.santos@student.upd.edu.ph',
    basicInfo: {
      firstName: 'Maria',
      lastName: 'Santos',
      course: 'Bachelor of Science in Computer Science',
      yearLevel: '3',
    },
    skillTags: [
      { tag: 'JavaScript', confidence: 0.9 },
      { tag: 'React', confidence: 0.85 },
      { tag: 'Node.js', confidence: 0.75 },
      { tag: 'Python', confidence: 0.7 },
      { tag: 'MongoDB', confidence: 0.65 },
    ],
    totalPoints: 450,
    applicationCount: 2,
    latestApplication: {
      _id: 'app001',
      role: { _id: 'role001', title: 'Frontend Developer Intern', department: 'Engineering' },
      status: 'interview',
      appliedDate: '2026-03-10',
      notes: 'Strong candidate with excellent React skills. Showed great problem-solving abilities during initial screening.',
    },
    applications: [
      {
        _id: 'app001',
        role: { _id: 'role001', title: 'Frontend Developer Intern', department: 'Engineering' },
        status: 'interview',
        appliedDate: '2026-03-10',
        notes: 'Strong candidate with excellent React skills. Showed great problem-solving abilities during initial screening.',
      },
      {
        _id: 'app002',
        role: { _id: 'role002', title: 'Full Stack Developer Intern', department: 'Engineering' },
        status: 'pending',
        appliedDate: '2026-03-15',
      },
    ],
  },
  {
    _id: 'stu002',
    email: 'juan.dela.cruz@student.ateneo.edu',
    basicInfo: {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      course: 'Bachelor of Science in Information Technology',
      yearLevel: '4',
    },
    skillTags: [
      { tag: 'Java', confidence: 0.95 },
      { tag: 'Spring Boot', confidence: 0.8 },
      { tag: 'PostgreSQL', confidence: 0.75 },
      { tag: 'Docker', confidence: 0.6 },
      { tag: 'AWS', confidence: 0.55 },
    ],
    totalPoints: 520,
    applicationCount: 1,
    latestApplication: {
      _id: 'app003',
      role: { _id: 'role003', title: 'Backend Developer Intern', department: 'Engineering' },
      status: 'reviewing',
      appliedDate: '2026-03-08',
      notes: 'Impressive backend projects. Currently reviewing code samples.',
    },
    applications: [
      {
        _id: 'app003',
        role: { _id: 'role003', title: 'Backend Developer Intern', department: 'Engineering' },
        status: 'reviewing',
        appliedDate: '2026-03-08',
        notes: 'Impressive backend projects. Currently reviewing code samples.',
      },
    ],
  },
  {
    _id: 'stu003',
    email: 'ana.reyes@student.ust.edu.ph',
    basicInfo: {
      firstName: 'Ana',
      lastName: 'Reyes',
      course: 'Bachelor of Science in Computer Engineering',
      yearLevel: '3',
    },
    skillTags: [
      { tag: 'Python', confidence: 0.9 },
      { tag: 'TensorFlow', confidence: 0.7 },
      { tag: 'Machine Learning', confidence: 0.75 },
      { tag: 'Data Analysis', confidence: 0.8 },
      { tag: 'SQL', confidence: 0.85 },
    ],
    totalPoints: 380,
    applicationCount: 1,
    latestApplication: {
      _id: 'app004',
      role: { _id: 'role004', title: 'Data Science Intern', department: 'Analytics' },
      status: 'accepted',
      appliedDate: '2026-03-05',
      notes: 'Excellent analytical skills. Accepted for the data science program.',
    },
    applications: [
      {
        _id: 'app004',
        role: { _id: 'role004', title: 'Data Science Intern', department: 'Analytics' },
        status: 'accepted',
        appliedDate: '2026-03-05',
        notes: 'Excellent analytical skills. Accepted for the data science program.',
      },
    ],
  },
  {
    _id: 'stu004',
    email: 'miguel.torres@student.dlsu.edu.ph',
    basicInfo: {
      firstName: 'Miguel',
      lastName: 'Torres',
      course: 'Bachelor of Science in Computer Science',
      yearLevel: '2',
    },
    skillTags: [
      { tag: 'C++', confidence: 0.8 },
      { tag: 'Python', confidence: 0.7 },
      { tag: 'Unity', confidence: 0.85 },
      { tag: 'Game Development', confidence: 0.9 },
      { tag: '3D Modeling', confidence: 0.6 },
    ],
    totalPoints: 290,
    applicationCount: 1,
    latestApplication: {
      _id: 'app005',
      role: { _id: 'role005', title: 'Game Developer Intern', department: 'Creative' },
      status: 'pending',
      appliedDate: '2026-03-18',
    },
    applications: [
      {
        _id: 'app005',
        role: { _id: 'role005', title: 'Game Developer Intern', department: 'Creative' },
        status: 'pending',
        appliedDate: '2026-03-18',
      },
    ],
  },
  {
    _id: 'stu005',
    email: 'sofia.garcia@student.upd.edu.ph',
    basicInfo: {
      firstName: 'Sofia',
      lastName: 'Garcia',
      course: 'Bachelor of Arts in Multimedia Arts',
      yearLevel: '4',
    },
    skillTags: [
      { tag: 'Figma', confidence: 0.95 },
      { tag: 'Adobe XD', confidence: 0.9 },
      { tag: 'UI/UX Design', confidence: 0.9 },
      { tag: 'Prototyping', confidence: 0.85 },
      { tag: 'User Research', confidence: 0.75 },
    ],
    totalPoints: 480,
    applicationCount: 1,
    latestApplication: {
      _id: 'app006',
      role: { _id: 'role006', title: 'UX/UI Design Intern', department: 'Design' },
      status: 'interview',
      appliedDate: '2026-03-12',
      notes: 'Outstanding portfolio. Scheduled for design challenge interview.',
    },
    applications: [
      {
        _id: 'app006',
        role: { _id: 'role006', title: 'UX/UI Design Intern', department: 'Design' },
        status: 'interview',
        appliedDate: '2026-03-12',
        notes: 'Outstanding portfolio. Scheduled for design challenge interview.',
      },
    ],
  },
  {
    _id: 'stu006',
    email: 'luis.mendoza@student.admu.edu.ph',
    basicInfo: {
      firstName: 'Luis',
      lastName: 'Mendoza',
      course: 'Bachelor of Science in Management Engineering',
      yearLevel: '4',
    },
    skillTags: [
      { tag: 'Project Management', confidence: 0.85 },
      { tag: 'Agile', confidence: 0.75 },
      { tag: 'Business Analysis', confidence: 0.8 },
      { tag: 'SQL', confidence: 0.7 },
      { tag: 'Excel', confidence: 0.9 },
    ],
    totalPoints: 410,
    applicationCount: 1,
    latestApplication: {
      _id: 'app007',
      role: { _id: 'role007', title: 'Product Management Intern', department: 'Product' },
      status: 'reviewing',
      appliedDate: '2026-03-14',
      notes: 'Strong business acumen. Reviewing case study submission.',
    },
    applications: [
      {
        _id: 'app007',
        role: { _id: 'role007', title: 'Product Management Intern', department: 'Product' },
        status: 'reviewing',
        appliedDate: '2026-03-14',
        notes: 'Strong business acumen. Reviewing case study submission.',
      },
    ],
  },
  {
    _id: 'stu007',
    email: 'patricia.cruz@student.ue.edu.ph',
    basicInfo: {
      firstName: 'Patricia',
      lastName: 'Cruz',
      course: 'Bachelor of Science in Information Technology',
      yearLevel: '3',
    },
    skillTags: [
      { tag: 'React Native', confidence: 0.8 },
      { tag: 'Flutter', confidence: 0.75 },
      { tag: 'Firebase', confidence: 0.7 },
      { tag: 'Mobile Development', confidence: 0.85 },
      { tag: 'TypeScript', confidence: 0.75 },
    ],
    totalPoints: 350,
    applicationCount: 1,
    latestApplication: {
      _id: 'app008',
      role: { _id: 'role008', title: 'Mobile Developer Intern', department: 'Engineering' },
      status: 'rejected',
      appliedDate: '2026-03-01',
      notes: 'Good skills but looking for candidates with more native development experience.',
    },
    applications: [
      {
        _id: 'app008',
        role: { _id: 'role008', title: 'Mobile Developer Intern', department: 'Engineering' },
        status: 'rejected',
        appliedDate: '2026-03-01',
        notes: 'Good skills but looking for candidates with more native development experience.',
      },
    ],
  },
  {
    _id: 'stu008',
    email: 'ramon.flores@student.featiu.edu.ph',
    basicInfo: {
      firstName: 'Ramon',
      lastName: 'Flores',
      course: 'Bachelor of Science in Computer Science',
      yearLevel: '4',
    },
    skillTags: [
      { tag: 'DevOps', confidence: 0.75 },
      { tag: 'Kubernetes', confidence: 0.65 },
      { tag: 'CI/CD', confidence: 0.7 },
      { tag: 'Linux', confidence: 0.8 },
      { tag: 'Terraform', confidence: 0.6 },
    ],
    totalPoints: 390,
    applicationCount: 1,
    latestApplication: {
      _id: 'app009',
      role: { _id: 'role009', title: 'DevOps Intern', department: 'Infrastructure' },
      status: 'accepted',
      appliedDate: '2026-03-06',
      notes: 'Great infrastructure knowledge. Accepted for the DevOps track.',
    },
    applications: [
      {
        _id: 'app009',
        role: { _id: 'role009', title: 'DevOps Intern', department: 'Infrastructure' },
        status: 'accepted',
        appliedDate: '2026-03-06',
        notes: 'Great infrastructure knowledge. Accepted for the DevOps track.',
      },
    ],
  },
  {
    _id: 'stu009',
    email: 'elena.villanueva@student.mlsu.edu.ph',
    basicInfo: {
      firstName: 'Elena',
      lastName: 'Villanueva',
      course: 'Bachelor of Science in Applied Mathematics',
      yearLevel: '3',
    },
    skillTags: [
      { tag: 'Python', confidence: 0.9 },
      { tag: 'R', confidence: 0.85 },
      { tag: 'Statistics', confidence: 0.95 },
      { tag: 'Data Visualization', confidence: 0.8 },
      { tag: 'Tableau', confidence: 0.75 },
    ],
    totalPoints: 420,
    applicationCount: 1,
    latestApplication: {
      _id: 'app010',
      role: { _id: 'role004', title: 'Data Science Intern', department: 'Analytics' },
      status: 'pending',
      appliedDate: '2026-03-19',
    },
    applications: [
      {
        _id: 'app010',
        role: { _id: 'role004', title: 'Data Science Intern', department: 'Analytics' },
        status: 'pending',
        appliedDate: '2026-03-19',
      },
    ],
  },
  {
    _id: 'stu010',
    email: 'carlos.ramos@student.benilde.edu.ph',
    basicInfo: {
      firstName: 'Carlos',
      lastName: 'Ramos',
      course: 'Bachelor of Science in Multimedia Arts',
      yearLevel: '4',
    },
    skillTags: [
      { tag: 'After Effects', confidence: 0.9 },
      { tag: 'Premiere Pro', confidence: 0.85 },
      { tag: 'Motion Graphics', confidence: 0.9 },
      { tag: 'Video Editing', confidence: 0.95 },
      { tag: 'Cinema 4D', confidence: 0.7 },
    ],
    totalPoints: 460,
    applicationCount: 1,
    latestApplication: {
      _id: 'app011',
      role: { _id: 'role010', title: 'Motion Graphics Intern', department: 'Creative' },
      status: 'interview',
      appliedDate: '2026-03-11',
      notes: 'Creative portfolio with strong motion graphics work. Interview scheduled.',
    },
    applications: [
      {
        _id: 'app011',
        role: { _id: 'role010', title: 'Motion Graphics Intern', department: 'Creative' },
        status: 'interview',
        appliedDate: '2026-03-11',
        notes: 'Creative portfolio with strong motion graphics work. Interview scheduled.',
      },
    ],
  },
  {
    _id: 'stu011',
    email: 'theresa.bautista@student.smu.edu.ph',
    basicInfo: {
      firstName: 'Theresa',
      lastName: 'Bautista',
      course: 'Bachelor of Science in Computer Science',
      yearLevel: '2',
    },
    skillTags: [
      { tag: 'HTML/CSS', confidence: 0.9 },
      { tag: 'JavaScript', confidence: 0.8 },
      { tag: 'Vue.js', confidence: 0.7 },
      { tag: 'Tailwind CSS', confidence: 0.75 },
      { tag: 'Git', confidence: 0.65 },
    ],
    totalPoints: 280,
    applicationCount: 1,
    latestApplication: {
      _id: 'app012',
      role: { _id: 'role001', title: 'Frontend Developer Intern', department: 'Engineering' },
      status: 'pending',
      appliedDate: '2026-03-20',
    },
    applications: [
      {
        _id: 'app012',
        role: { _id: 'role001', title: 'Frontend Developer Intern', department: 'Engineering' },
        status: 'pending',
        appliedDate: '2026-03-20',
      },
    ],
  },
  {
    _id: 'stu012',
    email: 'andres.salazar@student.pup.edu.ph',
    basicInfo: {
      firstName: 'Andres',
      lastName: 'Salazar',
      course: 'Bachelor of Science in Information Technology',
      yearLevel: '4',
    },
    skillTags: [
      { tag: 'Solidity', confidence: 0.7 },
      { tag: 'Web3', confidence: 0.65 },
      { tag: 'Smart Contracts', confidence: 0.7 },
      { tag: 'JavaScript', confidence: 0.85 },
      { tag: 'Node.js', confidence: 0.8 },
    ],
    totalPoints: 340,
    applicationCount: 1,
    latestApplication: {
      _id: 'app013',
      role: { _id: 'role011', title: 'Blockchain Developer Intern', department: 'Engineering' },
      status: 'reviewing',
      appliedDate: '2026-03-09',
      notes: 'Interesting blockchain projects. Reviewing smart contract submissions.',
    },
    applications: [
      {
        _id: 'app013',
        role: { _id: 'role011', title: 'Blockchain Developer Intern', department: 'Engineering' },
        status: 'reviewing',
        appliedDate: '2026-03-09',
        notes: 'Interesting blockchain projects. Reviewing smart contract submissions.',
      },
    ],
  },
];

export const mockInterviews: Interview[] = [
  {
    _id: 'int001',
    company: 'comp001',
    applicant: 'stu001' as any,
    role: 'role001' as any,
    date: '2026-03-25',
    time: '14:00',
    duration: 60,
    meetingType: 'video',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'confirmed',
    invitationSent: true,
    invitationSentAt: '2026-03-20T10:00:00Z',
    reminderSent: false,
    notes: 'Technical interview with coding challenge',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    _id: 'int002',
    company: 'comp001',
    applicant: 'stu005' as any,
    role: 'role006' as any,
    date: '2026-03-26',
    time: '10:00',
    duration: 90,
    meetingType: 'video',
    meetingLink: 'https://meet.google.com/xyz-uvwx-mno',
    status: 'pending',
    invitationSent: true,
    invitationSentAt: '2026-03-21T09:00:00Z',
    reminderSent: false,
    notes: 'Design challenge interview - prepare Figma presentation',
    createdAt: '2026-03-21T09:00:00Z',
    updatedAt: '2026-03-21T09:00:00Z',
  },
  {
    _id: 'int003',
    company: 'comp001',
    applicant: 'stu010' as any,
    role: 'role010' as any,
    date: '2026-03-24',
    time: '15:30',
    duration: 60,
    meetingType: 'video',
    meetingLink: 'https://meet.google.com/pqr-stuv-wxy',
    status: 'confirmed',
    invitationSent: true,
    invitationSentAt: '2026-03-19T14:00:00Z',
    reminderSent: false,
    notes: 'Portfolio review and motion graphics discussion',
    createdAt: '2026-03-19T14:00:00Z',
    updatedAt: '2026-03-19T14:00:00Z',
  },
];

// Helper function to calculate stats from applicants
export const calculateApplicantStats = (applicants: Applicant[]) => {
  const stats = {
    total: 0,
    pending: 0,
    reviewing: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  };

  applicants.forEach((applicant) => {
    applicant.applications.forEach((app) => {
      stats.total++;
      stats[app.status]++;
    });
  });

  return stats;
};

// Mock API operations
export const mockApi = {
  getApplicants: async (status?: ApplicationStatus, role?: string): Promise<{ applicants: Applicant[]; stats: any; count: number }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = mockApplicants;

    if (status) {
      filtered = filtered.filter((applicant) =>
        applicant.applications.some((app) => app.status === status)
      );
    }

    if (role) {
      filtered = filtered.filter((applicant) =>
        applicant.applications.some((app) => app.role._id === role)
      );
    }

    const stats = calculateApplicantStats(filtered);

    return {
      applicants: filtered,
      stats,
      count: filtered.length,
    };
  },

  saveNotes: async (applicationId: string, notes: string): Promise<{ message: string }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Find and update the application in mock data
    for (const applicant of mockApplicants) {
      const appIndex = applicant.applications.findIndex((app) => app._id === applicationId);
      if (appIndex !== -1) {
        applicant.applications[appIndex].notes = notes;
        if (applicant.latestApplication._id === applicationId) {
          applicant.latestApplication.notes = notes;
        }
        break;
      }
    }

    return { message: 'Notes saved successfully' };
  },

  updateStatus: async (applicationId: string, status: ApplicationStatus): Promise<{ message: string; application?: any }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Find and update the application in mock data
    for (const applicant of mockApplicants) {
      const appIndex = applicant.applications.findIndex((app) => app._id === applicationId);
      if (appIndex !== -1) {
        applicant.applications[appIndex].status = status;
        if (applicant.latestApplication._id === applicationId) {
          applicant.latestApplication.status = status;
        }
        return { message: 'Status updated successfully', application: applicant.applications[appIndex] };
      }
    }

    throw new Error('Application not found');
  },

  scheduleInterview: async (data: {
    applicantId: string;
    roleId: string;
    date: string;
    time: string;
    duration?: number;
    meetingType: 'video' | 'phone' | 'in-person';
    meetingLink?: string;
    notes?: string;
  }): Promise<{ interview: Interview }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newInterview: Interview = {
      _id: `int${Date.now()}`,
      company: 'comp001',
      applicant: data.applicantId as any,
      role: data.roleId as any,
      date: data.date,
      time: data.time,
      duration: data.duration || 60,
      meetingType: data.meetingType,
      meetingLink: data.meetingLink || 'https://meet.google.com/new-meeting',
      status: 'pending',
      invitationSent: true,
      invitationSentAt: new Date().toISOString(),
      reminderSent: false,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockInterviews.push(newInterview);

    return { interview: newInterview };
  },

  checkInterviewActive: async (interviewId: string): Promise<{
    isActive: boolean;
    isToday: boolean;
    interviewTime: string;
    endTime: string;
    currentTime: string;
  }> => {
    const interview = mockInterviews.find((i) => i._id === interviewId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    const now = new Date();
    const interviewDate = new Date(`${interview.date}T${interview.time}`);
    const endTime = new Date(interviewDate.getTime() + interview.duration * 60000);

    const isToday = interviewDate.toDateString() === now.toDateString();
    const isActive = isToday && now >= interviewDate && now <= endTime;

    return {
      isActive,
      isToday,
      interviewTime: interviewDate.toISOString(),
      endTime: endTime.toISOString(),
      currentTime: now.toISOString(),
    };
  },
};
