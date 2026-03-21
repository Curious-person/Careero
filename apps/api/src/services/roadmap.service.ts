import { DerivedSkill } from './profile.service';

// 1. Define Industry Standard Roles and their required skill clusters
const CAREER_LADDERS = [
  {
    role: 'Cybersecurity Analyst',
    requiredSkills: ['cybersec', 'networking', 'infrastructure', 'security', 'penetration-testing'],
  },
  {
    role: 'Full-Stack Software Engineer',
    requiredSkills: ['software-dev', 'web dev', 'frontend', 'backend', 'fullstack', 'database-design'],
  },
  {
    role: 'Cloud DevOps Engineer',
    requiredSkills: ['cloud', 'aws', 'devops', 'networking', 'agile'],
  },
  {
    role: 'Data Analyst / Scientist',
    requiredSkills: ['data-analysis', 'sql', 'python', 'business-intel', 'problem-solving', 'excel'],
  },
  {
    role: 'Business Strategy Consultant',
    requiredSkills: ['problem-solving', 'communication', 'leadership', 'business-intel', 'agile'],
  }
];

export const generateSmartRoadmap = (studentSkills: DerivedSkill[]) => {
  let bestMatch = { role: 'Undecided', matchScore: 0, missingSkills: [] as string[], masteredSkills: [] as string[] };

  // 2. Evaluate the student against every career ladder
  CAREER_LADDERS.forEach(career => {
    let rawScore = 0;
    const mastered: string[] = [];
    const missing: string[] = [];

    career.requiredSkills.forEach(reqSkill => {
      // Find if student has this skill and get the explicit confidence score
      // Note: we loosely match exact strings or substring if the tags are messy
      const skill = studentSkills.find(s => 
        (s.tag || '').toLowerCase().includes(reqSkill.toLowerCase()) || 
        reqSkill.toLowerCase().includes((s.tag || '').toLowerCase())
      );
      
      if (skill && skill.confidence) {
        // They have the skill (Add their confidence percentage to the total)
        rawScore += skill.confidence;
        
        // If confidence is > 70%, they "Mastered" it, else they need to improve it
        if (skill.confidence > 0.7) mastered.push(skill.tag);
        else missing.push(`Improve: ${skill.tag}`);
      } else {
        // They completely lack this critical skill
        missing.push(`Learn: ${reqSkill}`);
      }
    });

    // Calculate Final Percentage Match
    const maxPossibleScore = career.requiredSkills.length * 1.0; // 100% per skill
    // Minimum match score guaranteed to be at least 5% just from core base education logic?
    // Let's rely purely on raw mathematics
    const matchScore = Math.min(Math.round((rawScore / maxPossibleScore) * 100), 100);

    // Track the highest matching career path
    if (matchScore > bestMatch.matchScore) {
      bestMatch = { role: career.role, matchScore, missingSkills: missing, masteredSkills: mastered };
    }
  });

  // Default fallback if brand new student with exactly zero matching tags across all matrices
  if (bestMatch.matchScore === 0) {
     return {
       targetRole: 'General Technologist',
       matchPercentage: 0,
       roadmap: [
         { step: 1, title: "Build Your Foundation", description: "Establish baseline tags by completing your standard academic semesters." },
         { step: 2, title: "Explore Tech Horizons", description: "Take introductory courses spanning basic coding, logic, and networking." },
         { step: 3, title: "Start Taking Certifications", description: "Upload initial IT fundamentals certificates to begin forming your specialized Career Matrix." }
       ]
     };
  }

  // 3. Output the 3-Step Roadmap based on the mathematical gaps!
  return {
    targetRole: bestMatch.role,
    matchPercentage: bestMatch.matchScore,
    roadmap: [
      {
        step: 1,
        title: "Solidify Your Base",
        description: `You have a strong foundation in: ${bestMatch.masteredSkills.join(', ') || 'general core computing'}. Keep maintaining it!`,
      },
      {
        step: 2,
        title: "Bridge the Skill Gap",
        description: `To elevate toward a ${bestMatch.role}, urgently tackle these: ${bestMatch.missingSkills.slice(0, 3).join(', ')}.`,
      },
      {
        step: 3,
        title: "Targeted External Validation",
        description: `We recommend finding Certifications or taking Accumulation Challenges specifically targeting: ${bestMatch.missingSkills[0]?.replace('Learn: ', '').replace('Improve: ', '') || 'leadership'} to boost AI confidence.`,
      }
    ]
  };
};
