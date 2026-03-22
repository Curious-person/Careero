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

export interface DerivedSkill {
  tag: string;
  confidence: number;
}

/**
 * Maps incoming subject objects to flat skill tags if the student scored <= 2.0
 * Additionally extracts high-confidence AI labels parsed from local Xenova classification instances.
 */
export const deriveSkillTags = (records: IAcademicRecord[], certs: any[] = []): DerivedSkill[] => {
  const tagMap = new Map<string, number>();

  // Helper to add or update maximum confidence
  const recordConfidence = (tag: string, conf: number) => {
    const existing = tagMap.get(tag) || 0;
    // Synergy bonus: if we already have some confidence from another source, boost it by 10%
    let newConf = existing > 0 ? Math.min(Math.max(existing, conf) + 0.1, 0.99) : conf;
    tagMap.set(tag, newConf);
  };
  
  // 1. Academic Hardcoding
  records.forEach(record => {
    if (record.grade <= 2.0) {
      // Grade 1.0 (perfect) -> 0.95 confidence
      // Grade 2.0 (passing threshold) -> 0.75 confidence
      // Math: 0.95 - (grade - 1.0) * 0.20
      const confidence = Math.max(0.75, 0.95 - (record.grade - 1.0) * 0.2);
      
      const associatedTags = SKILL_TAG_MAP[record.subject] || [];
      associatedTags.forEach(tag => recordConfidence(tag, confidence));
    }
  });

  // 2. AI Label Extraction (Xenova Zero-Shot)
  certs.forEach(cert => {
    if (cert.classification && cert.classification.labels && cert.classification.scores) {
      const { labels, scores } = cert.classification;
      for (let i = 0; i < labels.length; i++) {
        // Only accept if the transformer pipeline is somewhat confident the file proves this skill
        if (scores[i] > 0.35) {
          recordConfidence(labels[i], scores[i]);
        }
      }
    }
  });

  return Array.from(tagMap.entries()).map(([tag, confidence]) => ({ tag, confidence }));
};

// Convert 1.0-3.0 scale to 100-60 Score mapped linearly (Score = 120 - 20 * Grade)
const convertGradeToScore = (grade: number): number => {
  if (grade > 3.0) return 0; // Failed
  return 120 - (20 * grade);
};

/**
 * Advanced Evaluation Engine mapping Academic Weights (30%), Certifications (20%), 
 * Accumulations (20%), Achievements (10%), Hard Skills (15%), and Soft Skills (5%).
 * Scales to 1000+ points to align with Industry Role Standards.
 */
export const calculatePoints = (records: IAcademicRecord[], certs: ICertification[] = []) => {
  // --- 1. ACADEMIC POINTS (Max 300) ---
  let totalValid = 0;
  let count = 0;
  records.forEach(record => {
    const score = convertGradeToScore(record.grade);
    if (score > 0) {
      totalValid += score;
      count++;
    }
  });
  const academicRaw = count > 0 ? (totalValid / count) : 0;
  const weightedAcademic = Math.round(academicRaw * 3); // 30% of 1000

  // --- 2. CERTIFICATION POINTS (Max 200) ---
  const certRaw = Math.min(certs.length * 20, 100);
  const weightedCert = Math.round(certRaw * 2); // 20% of 1000

  // --- 3. SKILL POINTS (Hard & Soft) ---
  const skillTags = deriveSkillTags(records, certs);
  const isSoftSkill = (tag: string) => ['leadership', 'agile', 'scrum', 'communication', 'teamwork', 'adaptability'].includes(tag.toLowerCase());
  
  const hardSkills = skillTags.filter(t => !isSoftSkill(t.tag));
  const softSkills = skillTags.filter(t => isSoftSkill(t.tag));

  // Role Points System Logic: 50 pts per skill + complexity multiplier
  const BASE_SKILL_VALUE = 50;
  
  // Hard Skills Calculation
  const hsCount = hardSkills.length;
  const hsMultiplier = 1.0 + (0.1 * Math.max(0, hsCount - 1));
  const hardSkillsScore = Math.round(BASE_SKILL_VALUE * hsCount * Math.min(hsMultiplier, 1.9));
  
  // Soft Skills Calculation
  const ssCount = softSkills.length;
  const ssMultiplier = 1.0 + (0.1 * Math.max(0, ssCount - 1));
  const softSkillsScore = Math.round(BASE_SKILL_VALUE * ssCount * Math.min(ssMultiplier, 1.9));

  // --- 4. ACCUMULATIONS & ACHIEVEMENTS (Placeholders) ---
  const weightedAccumulations = 0; // Handled by controller during completion
  const weightedAchievement = 0;

  const total = weightedAcademic + weightedCert + hardSkillsScore + softSkillsScore + weightedAccumulations + weightedAchievement;

  return {
    total,
    breakdown: {
      academic: weightedAcademic,
      cert: weightedCert,
      accumulations: weightedAccumulations,
      achievement: weightedAchievement,
      hardSkills: hardSkillsScore,
      softSkills: softSkillsScore,
      rawAcademic: Math.round(academicRaw),
      rawCert: Math.round(certRaw),
      rawAccumulations: 0,
      rawAchievement: 0,
      rawHardSkills: hsCount, // Now count-based
      rawSoftSkills: ssCount   // Now count-based
    }
  };
};

