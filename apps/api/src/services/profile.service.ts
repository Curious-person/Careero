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
 * Additionally extracts high-confidence AI labels parsed from local Xenova classification instances.
 */
export const deriveSkillTags = (records: IAcademicRecord[], certs: any[] = []): string[] => {
  const tags = new Set<string>();
  
  // 1. Academic Hardcoding
  records.forEach(record => {
    if (record.grade <= 2.0) {
      const associatedTags = SKILL_TAG_MAP[record.subject] || [];
      associatedTags.forEach(tag => tags.add(tag));
    }
  });

  // 2. AI Label Extraction (Xenova Zero-Shot)
  certs.forEach(cert => {
    if (cert.classification && cert.classification.labels && cert.classification.scores) {
      const { labels, scores } = cert.classification;
      for (let i = 0; i < labels.length; i++) {
        // Only accept if the transformer pipeline is somewhat confident the file proves this skill
        if (scores[i] > 0.35) {
          tags.add(labels[i]);
        }
      }
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
  // --- 1. ACADEMIC POINTS ---
  let totalValid = 0;
  let count = 0;
  records.forEach(record => {
    const score = convertGradeToScore(record.grade);
    if (score > 0) { // Only count passing grades
      totalValid += score;
      count++;
    }
  });

  // Calculate raw scores correctly out of 100
  // Note: convertGradeToScore already returns up to 100, so taking the average directly gives the correct score out of 100
  const academicScore = count > 0 ? (totalValid / count) : 0;
  
  // --- 2. CERTIFICATION & ACHIEVEMENT POINTS ---
  const certScore = Math.min(certs.length * 20, 100);
  const achievementScore = 0; // Fixed zero for now since model doesn't track Extracurricular metrics robustly yet

  // Dynamically compile derived skills from academic overlaps and AI Xenova strings
  const skillTags = deriveSkillTags(records, certs);
  const isSoftSkill = (tag: string) => ['leadership', 'agile', 'scrum', 'communication', 'teamwork', 'adaptability'].includes(tag.toLowerCase());
  const hardSkillsCount = skillTags.filter(t => !isSoftSkill(t)).length;
  const softSkillsCount = skillTags.filter(t => isSoftSkill(t)).length;

  const hardSkillsRaw = Math.min(hardSkillsCount * 15, 100);
  const softSkillsRaw = Math.min(softSkillsCount * 25, 100);

  // New Fractional Weightings: Max sum equals 100 points
  // Academics: 30%
  // Certifications: 20%
  // Accumulations: 10% (Locked)
  // Achievements: 10%
  // Hard Skills: 20%
  // Soft Skills: 10%
  const weightedAcademic = academicScore * 0.3;
  const weightedCert = certScore * 0.2;
  const weightedAccumulations = 0;
  const weightedAchievement = achievementScore * 0.1;
  const weightedHardSkills = hardSkillsRaw * 0.2;
  const weightedSoftSkills = softSkillsRaw * 0.1;

  const bAcademic = Math.round(weightedAcademic);
  const bCert = Math.round(weightedCert);
  const bAccum = Math.round(weightedAccumulations);
  const bAchieve = Math.round(weightedAchievement);
  const bHard = Math.round(weightedHardSkills);
  const bSoft = Math.round(weightedSoftSkills);

  return {
    total: bAcademic + bCert + bAccum + bAchieve + bHard + bSoft,
    breakdown: {
      academic: bAcademic,
      cert: bCert,
      accumulations: bAccum,
      achievement: bAchieve,
      hardSkills: bHard,
      softSkills: bSoft,
      rawAcademic: Math.round(academicScore),
      rawCert: Math.round(certScore),
      rawAccumulations: 0,
      rawAchievement: Math.round(achievementScore),
      rawHardSkills: Math.round(hardSkillsRaw),
      rawSoftSkills: Math.round(softSkillsRaw)
    }
  };
};

