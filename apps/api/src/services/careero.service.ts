import { IStudentProfile } from '../models/StudentProfile';
import { IRole } from '../models/Role';

// AI Model Cache for Sentence Similarity
let _similarityPipeline: any = null;

const getSimilarityPipeline = async () => {
  if (!_similarityPipeline) {
    const { pipeline } = await import('@xenova/transformers');
    // all-MiniLM-L6-v2 is the industry standard for lightweight, highly accurate sentence/word similarity
    _similarityPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[AI] Sentences Similarity Pipeline booted locally.');
  }
  return _similarityPipeline;
}

/**
 * Computes cosine similarity between two numeric vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface MatchResult {
  isEligible: boolean;
  matchScore: number;
  breakdown: {
    skillMatch: number;
    pointsMatch: number;
    eventsMatch: number;
    readinessMatch: number;
  };
  missingRequirements: string[];
  matchedSkills: string[];
  unmatchedSkills: string[];
}

/**
 * 🧠 Core Careero Matching Engine
 * Evaluates a student against an internship offer (Role).
 */
export const evaluateCandidate = async (
  student: IStudentProfile, 
  studentCompletedEvents: string[], // Extracted from Accumulations collection prior to call
  role: IRole
): Promise<MatchResult> => {
  const missingRequirements: string[] = [];
  
  // ── 1. Points Match (30%) ──
  // Compare student points to role's minimum required points
  const pointsRequired = role.points || 0;
  const studentPoints = student.totalPoints || 0;
  
  let pointsMatchScore = 0;
  let pointsEligible = true;
  if (pointsRequired > 0) {
    pointsMatchScore = Math.min(100, Math.round((studentPoints / pointsRequired) * 100));
    if (studentPoints < pointsRequired) {
      pointsEligible = false;
      missingRequirements.push(`Missing points (need ${pointsRequired}, have ${studentPoints})`);
    }
  } else {
    pointsMatchScore = 100; // No point requirement
  }

  // ── 2. Events Verification (20%) ──
  // Check if student completed all accumulationIds listed in the role
  const requiredEvents = role.accumulationIds || [];
  let eventsMatchScore = 100;
  let eventsEligible = true;
  
  if (requiredEvents.length > 0) {
    const matchedEvents = requiredEvents.filter(reqEvent => studentCompletedEvents.includes(reqEvent));
    eventsMatchScore = Math.round((matchedEvents.length / requiredEvents.length) * 100);
    
    if (matchedEvents.length < requiredEvents.length) {
      eventsEligible = false;
      missingRequirements.push(`Missing ${requiredEvents.length - matchedEvents.length} required events`);
    }
  }

  // ── 3. Readiness Score (10% Activity/Readiness placeholder) ──
  // A synthesized readiness score based on profile completion/points scale. Max 100.
  // In production, this can incorporate GitHub/Login activity.
  const studentReadinessScore = Math.min(100, Math.round((studentPoints / 1000) * 80 + ((student.skillTags?.length || 0) * 2)));
  const minimumReadinessScore = role.minimumReadinessScore || 0;
  
  let readinessMatchScore = 0;
  let readinessEligible = true;
  if (minimumReadinessScore > 0) {
    readinessMatchScore = Math.min(100, Math.round((studentReadinessScore / minimumReadinessScore) * 100));
    if (studentReadinessScore < minimumReadinessScore) {
      readinessEligible = false;
      missingRequirements.push(`Readiness Score too low (need ${minimumReadinessScore}, have ${studentReadinessScore})`);
    }
  } else {
    readinessMatchScore = studentReadinessScore >= 50 ? 100 : Math.round(studentReadinessScore * 2);
  }

  // ── 4. AI-Powered Skill Matching (40%) ──
  let overallSkillMatchScore = 0;
  const requiredSkills = role.skills || [];
  const studentSkills = student.skillTags || [];
  const matchedSkills: string[] = [];
  const unmatchedSkills: string[] = [];

  if (requiredSkills.length === 0) {
    overallSkillMatchScore = 100;
  } else if (studentSkills.length === 0) {
    overallSkillMatchScore = 0;
    missingRequirements.push(`Lacking all required skills`);
    unmatchedSkills.push(...requiredSkills);
  } else {
    try {
      // 1. Load Local NLP Model
      const extractor = await getSimilarityPipeline();
      
      // 2. Compute vectors for Required Skills
      const reqVectors = await extractor(requiredSkills, { pooling: 'mean', normalize: true });
      const reqVectorsArr = reqVectors.tolist();
      
      // 3. Compute vectors for Student Skills — strip # and normalize hyphens so
      //    '#agile' becomes 'agile' and '#project-management' becomes 'project management'
      //    for accurate semantic comparison against company-posted skills like 'Agile'.
      const studentSkillNames = studentSkills.map((s: any) => {
        const raw = typeof s === 'string' ? s : s.tag;
        return raw.replace(/^#+/, '').replace(/-/g, ' ').trim();
      });
      const studentVectors = await extractor(studentSkillNames, { pooling: 'mean', normalize: true });
      const stuVectorsArr = studentVectors.tolist();
      
      // 4. Determine best match per required skill
      let totalSkillMatchSum = 0;
      
      for (let i = 0; i < requiredSkills.length; i++) {
        let bestSim = 0;
        let bestMatchConfidence = 1;

        // Get tensor vector for required skill 'i'
        const reqVec = reqVectorsArr[i];
        
        for (let j = 0; j < studentSkills.length; j++) {
          const stuVec = stuVectorsArr[j];
          const sim = cosineSimilarity(reqVec, stuVec);
          
          if (sim > bestSim) {
            bestSim = sim;
            const stuObj = studentSkills[j] as any;
            bestMatchConfidence = stuObj.confidence || 0.8; // default to 80% if unverified
          }
        }
        
        // If similarity is > 0.75, we consider it a highly strong semantic match
        const effectiveScore = bestSim * bestMatchConfidence;
        totalSkillMatchSum += effectiveScore;

        // Track per-skill pass/fail (threshold: 0.45 effective score)
        if (effectiveScore >= 0.45) {
          matchedSkills.push(requiredSkills[i]);
        } else {
          unmatchedSkills.push(requiredSkills[i]);
        }
      }
      
      // Normalize to 100
      overallSkillMatchScore = Math.round((totalSkillMatchSum / requiredSkills.length) * 100);

    } catch (err: any) {
      console.warn('[Careero Engine] AI Similarity fallback triggered (NLP engine unavailable):', err.message);
      // Fallback: simple text includes overlap
      let matchCount = 0;
      const normalizedStudent = studentSkills.map((s: any) => typeof s === 'string' ? s.toLowerCase() : s.tag.toLowerCase());
      
      for (const req of requiredSkills) {
        const matched = normalizedStudent.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s));
        if (matched) {
          matchCount++;
          matchedSkills.push(req);
        } else {
          unmatchedSkills.push(req);
        }
      }
      overallSkillMatchScore = Math.round((matchCount / requiredSkills.length) * 100);
    }
  }

  // ── FINAL AGGREGATION ──
  // (40%) Skill + (30%) Points + (20%) Events + (10%) Readiness/Activity
  const matchScore = Math.round(
    (overallSkillMatchScore * 0.40) +
    (pointsMatchScore * 0.30) +
    (eventsMatchScore * 0.20) +
    (readinessMatchScore * 0.10)
  );

  const isEligible = pointsEligible && eventsEligible && readinessEligible && (overallSkillMatchScore >= 50);
  if (overallSkillMatchScore < 50 && isEligible) missingRequirements.push('Skills match is below 50% threshold');

  return {
    isEligible,
    matchScore,
    breakdown: {
      skillMatch: overallSkillMatchScore,
      pointsMatch: pointsMatchScore,
      eventsMatch: eventsMatchScore,
      readinessMatch: readinessMatchScore
    },
    missingRequirements,
    matchedSkills,
    unmatchedSkills,
  };
};
