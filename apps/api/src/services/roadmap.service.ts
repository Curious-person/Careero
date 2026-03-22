import { DerivedSkill } from './profile.service';
import { GoogleGenAI } from "@google/genai";

// --- New Skill Tree Structure ---
export interface RoadmapNode {
  title: string;
  skills: string[];
  description: string;
  status: 'Completed' | 'Current' | 'Locked';
}

export interface RoadmapPhase {
  name: string;
  nodes: RoadmapNode[];
}

export interface SmartRoadmap {
  targetRole: string;
  matchPercentage: number;
  phases: RoadmapPhase[];
}

// 1. Define Industry Standard Roles (Fallback Logic)
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

/**
 * The Rule-Based Fallback Engine
 * Used if Gemini is unavailable or for very new students.
 */
const generateFallbackRoadmap = (studentSkills: DerivedSkill[]): SmartRoadmap => {
  let bestMatch = { role: 'Undecided', matchScore: 0, missingSkills: [] as string[], masteredSkills: [] as string[] };

  CAREER_LADDERS.forEach(career => {
    let rawScore = 0;
    const mastered: string[] = [];
    const missing: string[] = [];

    career.requiredSkills.forEach(reqSkill => {
      const skill = studentSkills.find(s => 
        (s.tag || '').toLowerCase().includes(reqSkill.toLowerCase()) || 
        reqSkill.toLowerCase().includes((s.tag || '').toLowerCase())
      );
      
      if (skill && skill.confidence) {
        rawScore += skill.confidence;
        if (skill.confidence > 0.7) mastered.push(skill.tag);
        else missing.push(skill.tag);
      } else {
        missing.push(reqSkill);
      }
    });

    const matchScore = Math.min(Math.round((rawScore / career.requiredSkills.length) * 100), 100);
    if (matchScore > bestMatch.matchScore) {
      bestMatch = { role: career.role, matchScore, missingSkills: missing, masteredSkills: mastered };
    }
  });

  const role = bestMatch.matchScore > 0 ? bestMatch.role : 'Junior Technologist';
  
  return {
    targetRole: role,
    matchPercentage: bestMatch.matchScore,
    phases: [
      {
        name: 'Foundation',
        nodes: [
          { 
            title: 'Core Fundamentals', 
            skills: bestMatch.masteredSkills.slice(0, 3).length > 0 ? bestMatch.masteredSkills.slice(0, 3) : ['Logic', 'Ethics'],
            description: 'Strengthen your baseline capabilities.',
            status: 'Completed'
          }
        ]
      },
      {
        name: 'Specialization',
        nodes: [
          { 
            title: `${role} Basics`, 
            skills: bestMatch.missingSkills.slice(0, 2),
            description: `Core gaps to bridge for ${role}.`,
            status: 'Current'
          }
        ]
      },
      {
        name: 'Mastery',
        nodes: [
          { 
            title: 'Industry Ready', 
            skills: ['Advanced Implementation', 'System Design'],
            description: 'Final push to professional competency.',
            status: 'Locked'
          }
        ]
      }
    ]
  };
};

/**
 * The AI-Driven Smart Roadmap Engine
 * Pings Gemini to create a truly unique skill tree.
 */
export const generateSmartRoadmap = async (studentSkills: DerivedSkill[], totalPoints: number = 0): Promise<SmartRoadmap> => {
  if (!process.env.GEMINI_API_KEY || studentSkills.length === 0) {
    return generateFallbackRoadmap(studentSkills);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const skillList = studentSkills.map(s => `${s.tag} (${Math.round(s.confidence * 100)}%)`).join(', ');
    
    const prompt = `
      You are an expert Career Development AI. Generate a "Smart Career Roadmap" as a phased Skill Tree for a student with ${totalPoints} points and these skills: ${skillList}.
      
      Output ONLY a valid JSON object with this exact structure:
      {
        "targetRole": "Proposed job title",
        "matchPercentage": 0-100 based on skill relevance,
        "phases": [
          {
            "name": "Phase Name (e.g. Foundation)",
            "nodes": [
              {
                "title": "Node title",
                "skills": ["skill1", "skill2"],
                "description": "Short reasoning",
                "status": "Completed" | "Current" | "Locked" (Logic: Completed if student already has skills > 80% confidence, Current for next immediate steps, Locked for future specialization)
              }
            ]
          }
        ]
      }
      
      Rules:
      1. Create exactly 3 phases: "Foundation", "Specialization", "Mastery".
      2. Each phase should have 1-2 nodes.
      3. Make it feel like a progressive skill tree.
      4. Be realistic based on the provided skills.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const responseText = result.text || '';
    
    // Clean up markdown code blocks if AI included them
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (err: any) {
    console.error('[Roadmap AI Error Details]', {
      message: err.message,
      status: err.status,
      error_code: err.error_code,
      model: "gemini-3-flash-preview"
    });
    return generateFallbackRoadmap(studentSkills);
  }
};

