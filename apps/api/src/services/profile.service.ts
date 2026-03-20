import { IAcademicRecord, ICertification } from '../models/StudentProfile';

/**
 * Mapping of generic subject strings to specific industry level tags (Rule-Based)
 */
const SKILL_TAG_MAP: Record<string, string[]> = {
  'Network Administration': ['networking', 'cybersec', 'infrastructure'],
  'Software Engineering': ['software-dev', 'agile', 'oop'],
  'Web Development': ['web dev', 'frontend', 'backend', 'fullstack'],
  'Data Structures & Algorithms': ['algorithms', 'problem-solving', 'c++'],
  'Database Management Systems': ['sql', 'database-design', 'data-modeling'],
  'Cybersecurity Fundamentals': ['cybersec', 'security', 'penetration-testing'],
  'Cloud Computing': ['cloud', 'aws', 'devops'],
  'Business Analytics': ['data-analysis', 'excel', 'power-bi', 'business-intel'],
  'Project Management': ['agile', 'scrum', 'leadership'],
  'Financial Accounting': ['accounting', 'finance', 'bookkeeping'],
};

const COURSE_CURRICULUM: Record<string, { subjects: string[] }> = {
  'BSIT': {
    subjects: ['Network Administration', 'Web Development', 'Database Management Systems', 'Cybersecurity Fundamentals', 'Cloud Computing']
  },
  'BSCS': {
    subjects: ['Software Engineering', 'Data Structures & Algorithms', 'Web Development', 'Database Management Systems', 'Cybersecurity Fundamentals']
  },
  'BSBA': {
    subjects: ['Business Analytics', 'Project Management', 'Financial Accounting', 'Database Management Systems']
  }
};

/**
 * Generates realistic randomized academic grades based on a 1.0 to 5.0 system
 */
export const generateMockAcademicData = (courseKey: string): IAcademicRecord[] => {
  const normalizedCourse = courseKey.toUpperCase();
  const curriculum = COURSE_CURRICULUM[normalizedCourse] || COURSE_CURRICULUM['BSIT'];
  
  // Valid passing grades in the 1.0-3.0 scale
  const possibleGrades = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];

  return curriculum.subjects.map(subject => {
    // Heavily weight it towards passing grades for testing
    const grade = possibleGrades[Math.floor(Math.random() * possibleGrades.length)];
    return {
      subject,
      grade,
      units: 3
    };
  });
};

/**
 * Maps incoming subject objects to flat skill tags if the student scored <= 2.0
 */
export const deriveSkillTags = (records: IAcademicRecord[]): string[] => {
  const tags = new Set<string>();
  
  records.forEach(record => {
    if (record.grade <= 2.0) {
      const associatedTags = SKILL_TAG_MAP[record.subject] || [];
      associatedTags.forEach(tag => tags.add(tag));
    }
  });

  return Array.from(tags);
};

// Convert 1.0-3.0 scale to 100-60 Score mapped linearly (Score = 120 - 20 * Grade)
const convertGradeToScore = (grade: number): number => {
  if (grade > 3.0) return 0; // Failed
  return 120 - (20 * grade);
};

/**
 * Advanced Evaluation Engine mapping Academic Weights (40%), Certifications (30%), and Achievements (20%)
 */
export const calculatePoints = (records: IAcademicRecord[], certs: ICertification[] = []) => {
  // --- 1. ACADEMIC POINTS (40%) ---
  let academicScore = 0;
  if (records.length > 0) {
    const totalAcademicScore = records.reduce((sum, record) => sum + convertGradeToScore(record.grade), 0);
    academicScore = totalAcademicScore / records.length;
  }

  // --- 2. CERTIFICATION & ACHIEVEMENT POINTS ---
  let certScore = 0;
  let achievementScore = 0;

  certs.forEach(cert => {
    const text = cert.ocrText.toLowerCase();

    // Check if it's an achievement or a certification based on keywords
    if (text.includes("champion") || text.includes("1st place") || text.includes("participant")) {
      // Achievement Logic
      if (text.includes("champion")) achievementScore += 100;
      else if (text.includes("1st place")) achievementScore += 90;
      else if (text.includes("participant")) achievementScore += 40;
    } else {
      // Certification Logic
      // Base = 50, Confidence = 0.9, Level = 1.2
      // In reality these come from the zero-shot classifier output!
      // Here we parse pre-populated values if available on the cert object, or use fallbacks
      const basePoints = 50;
      const confidence = 0.9;
      const level = 1.2;
      certScore += (basePoints * confidence * level);
    }
  });

  // Cap them if necessary
  certScore = Math.min(certScore, 100); 
  achievementScore = Math.min(achievementScore, 100);

  // --- FINAL WEIGHTED CALCULATION ---
  // (Academic * 0.4) + (Cert * 0.3) + (Achievement * 0.2)
  const weightedAcademic = academicScore * 0.4;
  const weightedCert = certScore * 0.3;
  const weightedAchievement = achievementScore * 0.2;
  // + Bonus (10%) (omitted or flat if desired)
  
  return {
    total: Math.round(weightedAcademic + weightedCert + weightedAchievement),
    breakdown: {
      academic: Math.round(weightedAcademic),
      cert: Math.round(weightedCert),
      achievement: Math.round(weightedAchievement)
    }
  };
};
