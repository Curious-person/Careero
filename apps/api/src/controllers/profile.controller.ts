import { Request, Response, NextFunction } from 'express';
import { generateMockAcademicData, deriveSkillTags, calculatePoints } from '../services/profile.service';
import { generateSmartRoadmap } from '../services/roadmap.service';
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
    const { imageBase64, studentName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Missing imageBase64 payload' });
    }

    if (!imageBase64.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid file format. Only images (PNG, JPG, etc) are supported for OCR scanning.' });
    }

    // ── Guard: Decode Base64 ──────────────────
    if (!process.env.JWT_SECRET) {
      console.warn("Missing JWT_SECRET, using dev secret.");
    }

    // Strip the data URI prefix efficiently and safely regardless of explicit mime type
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // ── Step 1: Local High-Speed Tesseract OCR ────────────────────────────────
    let ocrText = '';
    try {
      // Execute local OCR detection immediately
      const { data } = await Tesseract.recognize(imageBuffer, 'eng');
      ocrText = data.text.trim() || 'No text detected';
    } catch (ocrErr: any) {
      const errMsg = ocrErr?.message || ocrErr?.toString() || 'Unknown fatal image read error';
      console.error('[Tesseract] OCR processing failed:', errMsg);
      return res.status(422).json({
        message: 'Tesseract failed to read this image. The file might be corrupted, or formatting is unsupported.',
        error: errMsg,
      });
    }

    // ── Step 2: Strict Lexical Identity & Credential Heuristic Guards ─────────
    if (ocrText.length < 15) {
      return res.status(400).json({
        message: 'Validation Failed: No readable text detected. Please ensure this is a high-quality scan.',
        error: 'INVALID_DOCUMENT_LENGTH'
      });
    }

    const normalizedOcr = ocrText.toLowerCase();

    // Guard 2A: Identity Verification Match
    if (studentName) {
      const names = studentName.split(' ').filter(Boolean);
      // Name usually contains first and last. They both must exist somewhere closely on the certificate.
      const hasIdentity = names.every((n: string) => normalizedOcr.includes(n));
      if (!hasIdentity) {
        return res.status(400).json({
          message: `Forgery/Mismatch Detected: Could not verify your legal identity ("${studentName}") embedded within this document.`,
          error: 'IDENTITY_MISMATCH'
        });
      }
    }

    // Guard 2B: Contextual Vocabulary Match
    const certKeywords = ['certificate', 'certify', 'certification', 'completed', 'awarded', 'diploma', 'degree', 'participation', 'credential', 'badge', 'coursera', 'udemy', 'issued', 'academy'];
    const hasKeyword = certKeywords.some(kw => normalizedOcr.includes(kw));

    if (!hasKeyword) {
      return res.status(400).json({
        message: 'Fraud Guard: This document lacks standard certification language (e.g. "Certificate", "Awarded", "Issuer"). Screenshots and portfolios are strictly forbidden.',
        error: 'MISSING_CREDENTIAL_KEYWORDS'
      });
    }

    // ── Step 2: AI Document Validation Guard ────────────────────────────────
    if (ocrText.length < 15) {
      return res.status(400).json({
        message: 'No readable text detected. Please ensure this is a valid certification document.',
        error: 'INVALID_DOCUMENT_LENGTH'
      });
    }

    // ── Step 3: Zero-Shot Classification via local @xenova/transformers ───────
    let classification: any = null;

    try {
      const runClassifier = await getClassifier();

      // Preliminary Legitimacy Check
      const validityLabels = ['valid certification record', 'random text or drawing'];
      const validityResult = await runClassifier(ocrText, validityLabels);

      if (validityResult.labels[0] !== 'valid certification record' || validityResult.scores[0] < 0.5) {
        return res.status(400).json({
          message: 'AI Validation Failed: This document does not appear to be a legitimate certification.',
          error: 'INVALID_DOCUMENT_CLASS'
        });
      }

      // Feature Classification
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
    const skillTags = deriveSkillTags(academicRecords, certifications || []);
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
    // If a student's profile is missing detailed breakdowns or the new unweighted raw payloads,
    // we powerfully recalculate the exact breakdown dynamically and inject it.
    if (!profile.pointsBreakdown || typeof profile.pointsBreakdown.hardSkills === 'undefined') {
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

    // Generate the dynamic roadmap on the fly using their array of { tag, confidence }
    const careerRoadmap = generateSmartRoadmap(profile.skillTags);

    return res.json({
      message: 'Profile retrieved successfully',
      data: {
        ...profile,
        careerRoadmap,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. GET /api/v1/profile/students
 *    Returns all student profiles (for school dashboard), with user email populated.
 */
export const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profiles = await StudentProfile.find().populate('user', 'email').lean();
    return res.json({ data: profiles });
  } catch (error) {
    next(error);
  }
};

/**
 * 5b. GET /api/v1/profile/:id
 *     Returns a single student profile by ID (school action).
 */
export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findById(req.params.id).populate('user', 'email').lean();
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const careerRoadmap = generateSmartRoadmap(profile.skillTags as any);
    return res.json({ data: { ...profile, careerRoadmap } });
  } catch (error) {
    next(error);
  }
};

/**
 * 5c. PATCH /api/v1/profile/:id/verify
 *     Sets a student profile status to VERIFIED (school action).
 */
export const verifyStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findByIdAndUpdate(
      req.params.id,
      { status: 'VERIFIED' },
      { new: true }
    ).lean();
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.json({ message: 'Student verified', data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * 5c. DELETE /api/v1/profile/:id
 *     Removes a student profile (school action).
 */
export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await StudentProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.json({ message: 'Student profile deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * 5d. POST /api/v1/profile/admin/create
 *     School creates a student profile directly (bypasses student self-onboarding).
 *     Body: { email, firstName, lastName, course, yearLevel, studentId }
 */
export const adminCreateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { User } = await import('../models/User');
    const { email, firstName, lastName, middleName, course, yearLevel, studentId, section, term } = req.body;
    if (!email || !firstName || !lastName || !course) {
      return res.status(400).json({ message: 'email, firstName, lastName, and course are required' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, role: 'student', isVerified: false });
    }

    const existing = await StudentProfile.findOne({ user: user._id });
    if (existing) return res.status(409).json({ message: 'Profile already exists for this email' });

    const profile = await StudentProfile.create({
      user: user._id,
      basicInfo: {
        firstName,
        lastName,
        middleName: middleName || '',
        course,
        yearLevel: yearLevel || '1st Year',
        studentId: studentId || '',
        section: section || '',
        term: term || '',
      },
      academicRecords: [],
      skillTags: [],
      certifications: [],
      totalPoints: 0,
      status: 'PENDING_ONBOARDING',
    });

    return res.status(201).json({ message: 'Student profile created', data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. POST /api/v1/profile/certifications/add
 *    Appends a new verified certification to the profile and mathematically recalculates the skill tags, points, and roadmap.
 */
export const addCertification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const { certification } = req.body;
    if (!certification) return res.status(400).json({ message: 'Certification payload required' });

    const profile = await StudentProfile.findOne({ user: decoded.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Append certification
    profile.certifications.push(certification);

    // Re-run standard engines
    profile.skillTags = deriveSkillTags(profile.academicRecords, profile.certifications) as any;
    const calculatedPoints = calculatePoints(profile.academicRecords, profile.certifications);
    
    profile.totalPoints = calculatedPoints.total;
    profile.pointsBreakdown = calculatedPoints.breakdown;

    await profile.save();
    
    // Regenerate roadmap attached to the response payload to hot-reload the UI seamlessly
    const careerRoadmap = generateSmartRoadmap(profile.skillTags as any);

    return res.status(200).json({
      message: 'Certification added successfully! Your points and roadmap have been updated.',
      data: {
        ...profile.toJSON(),
        careerRoadmap
      }
    });

  } catch (error) {
    next(error);
  }
};