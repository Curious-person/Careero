import { Request, Response, NextFunction } from 'express';
import { generateMockAcademicData, deriveSkillTags, calculatePoints } from '../services/profile.service';
import { StudentProfile } from '../models/StudentProfile';
import Tesseract from 'tesseract.js';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

// ─── Local AI \u0026 OCR Engine Configuration ──────────────────────────────
// This completely bypasses the Hugging Face API, preventing quota/permission limits.
//
// 1. Tesseract.js: Extracts text natively within the Node.js thread.
// 2. @xenova/transformers: Runs ONNX models locally via WebAssembly/CPU.

let _classifierCache: any = null;

const getClassifier = async () => {
  if (!_classifierCache) {
    // Dynamic import prevents heavy ONNX pipelines from blocking Express startup
    const { pipeline } = await import('@xenova/transformers');
    // Defaults to `Xenova/distilbert-base-uncased-mnli` (~268MB), running fully locally!
    _classifierCache = await pipeline('zero-shot-classification');
    console.log('[AI] Zero-shot MNLI pipeline booted locally.');
  }
  return _classifierCache;
};
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. GET /api/v1/profile/mock-academic?course=BSIT
 *    Generates mock academic data for preview before onboarding submission.
 */
export const getMockAcademicData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const course = req.query.course as string;
    if (!course) {
      return res
        .status(400)
        .json({ message: 'Course query parameter is required (e.g., BSIT)' });
    }

    const records = generateMockAcademicData(course);
    const tags = deriveSkillTags(records);
    const pointsData = calculatePoints(records, []);

    return res.json({
      message: 'Mock academic data generated',
      data: { records, tags, estimatedPoints: pointsData.total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. POST /api/v1/profile/ocr-upload
 *    Sends a base64 certificate image to HuggingFace for OCR + classification.
 *    Body: { imageBase64: 'data:image/jpeg;base64,...' }
 */
export const processOcrUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Missing imageBase64 payload' });
    }

    // ── Guard: Decode Base64 ──────────────────
    if (!process.env.JWT_SECRET) {
      console.warn("Missing JWT_SECRET, using dev secret.");
    }

    // Strip the data URI prefix — handles jpeg, png, webp, gif, bmp
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/i, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // ── Step 1: Local High-Speed Tesseract OCR ────────────────────────────────
    let ocrText = '';
    try {
      // Execute local OCR detection immediately
      const { data } = await Tesseract.recognize(imageBuffer, 'eng');
      ocrText = data.text.trim() || 'No text detected';
    } catch (ocrErr: any) {
      console.error('[Tesseract] OCR processing failed:', ocrErr.message);
      return res.status(502).json({
        message: 'Local Tesseract Vision processing failed',
        error: ocrErr.message,
      });
    }

    // ── Step 2: Zero-Shot Classification via local @xenova/transformers ───────
    let classification: any = null;

    try {
      const runClassifier = await getClassifier();
      const labels = [
        'programming',
        'networking',
        'cybersecurity',
        'business',
        'achievement',
        'competition',
      ];
      
      const result = await runClassifier(ocrText, labels);
      
      // Map the local Xenova signature onto the expected classification payload output
      classification = {
        labels: result.labels,
        scores: result.scores
      };
      
    } catch (classErr: any) {
      console.warn(
        '[Transformers] Local ONNX classification failed (non-fatal):',
        classErr.message
      );
    }

    return res.json({
      message: 'OCR & AI Labeling Complete',
      ocrText,
      classification, // null if classifier was unavailable
    });
  } catch (error: any) {
    console.error('[OCR] Unexpected error:', error.message);
    next(error);
  }
};

/**
 * 3. POST /api/v1/profile/onboard
 *    Finalizes onboarding. Derives tags and points on the backend (never trust client).
 */
export const submitOnboarding = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const userId = decoded.id;

    const { basicInfo, academicRecords, certifications } = req.body;

    // Always re-derive on the backend — never trust calculated values from client
    const skillTags = deriveSkillTags(academicRecords);
    const calculatedPoints = calculatePoints(academicRecords, certifications || []);

    const profile = await StudentProfile.create({
      user: userId,
      basicInfo,
      academicRecords,
      skillTags,
      certifications,
      totalPoints: calculatedPoints.total,
      pointsBreakdown: calculatedPoints.breakdown,
      status: 'UNDER_EVALUATION',
    });

    return res.status(201).json({
      message: 'Onboarding completed. Profile is under evaluation by your school.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. GET /api/v1/profile/me
 *    Returns the authenticated user's profile.
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const profile = await StudentProfile.findOne({ user: decoded.id }).lean();

    if (!profile) {
      return res
        .status(404)
        .json({ message: 'Profile not found. Onboarding required.' });
    }

    // ── Self-Healing Data Migration ──
    // If a student's profile was created before the "pointsBreakdown" feature,
    // we recalculate the exact breakdown dynamically and inject it.
    if (!profile.pointsBreakdown || (profile.pointsBreakdown.academic === 0 && profile.pointsBreakdown.cert === 0 && profile.totalPoints > 0)) {
      const calculatedPoints = calculatePoints(profile.academicRecords, profile.certifications || []);
      profile.pointsBreakdown = calculatedPoints.breakdown;
      profile.totalPoints = calculatedPoints.total; // Synchronize just in case
      
      // Since the profile was fetched with .lean(), it's a plain object with no .save() method.
      // We must use updateOne directly.
      await StudentProfile.updateOne(
        { _id: profile._id },
        { $set: { pointsBreakdown: calculatedPoints.breakdown, totalPoints: calculatedPoints.total } }
      );
    }

    return res.json({
      message: 'Profile retrieved successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};