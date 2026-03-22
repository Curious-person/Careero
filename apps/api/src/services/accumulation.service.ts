import { Accumulation, IParticipantGrade, AccumSource } from '../models/Accumulation';
import { Types } from 'mongoose';

/**
 * Get all accumulations (optionally filtered by source)
 */
export const getAllAccumulations = async (source?: string) => {
  const filter = source ? { source } : {};
  return Accumulation.find(filter).lean();
};

/**
 * Get a single accumulation by ID
 */
export const getAccumulationById = async (id: string) => {
  return Accumulation.findById(id).lean();
};

/**
 * Get accumulations by creator type (school or company)
 */
export const getAccumulationsByCreator = async (createdBy: 'school' | 'company', companyProfileId?: Types.ObjectId) => {
  const query: any = { createdBy };
  if (createdBy === 'company' && companyProfileId) {
    query.company = companyProfileId;
  }
  return Accumulation.find(query).lean();
};

const TAG_TO_FIELD: Record<string, string> = {
  '#webdev': 'Web Development', '#cybersec': 'Cybersecurity', '#cloud': 'Cloud Computing',
  '#networking': 'Networking', '#softwaredev': 'Software Development', '#mobiledev': 'Mobile Development',
  '#uiux': 'UI/UX Design', '#dataanalytics': 'Data Analytics', '#projectmgmt': 'Project Management',
  '#business': 'Business', '#communication': 'Communication',
};

/**
 * Create a new accumulation
 * Note: source and createdBy must be provided in data parameter
 */
export const createAccumulation = async (data: {
  title: string;
  type: string;
  source: string; // 'school' or company name
  createdBy: 'school' | 'company';
  company?: Types.ObjectId; // Company profile reference (required if createdBy is 'company')
  field?: string;
  courses: string[];
  deadline: string;
  duration: string;
  description: string;
  skillTags?: string[];
  resourceLink: string;
  objectives?: string[];
  inCharge?: { name: string; role: string; email: string }[];
  modules?: { title: string; description: string }[];
  agenda?: { time: string; activity: string }[];
  tests?: { title: string; description: string }[];
}) => {
  const title = data.title?.trim() ?? ''
  const description = data.description?.trim() ?? ''
  const skillTags = (data.skillTags ?? []).map(tag => {
    const normalized = tag.trim().toLowerCase().replace(/^#+/, '')
    return `#${normalized}`
  }).filter(Boolean)

  // Validate URL format for resourceLink
  if (!data.resourceLink) throw new Error('Resource link is required')
  try {
    new URL(data.resourceLink)
  } catch {
    throw new Error('Resource link must be a valid URL')
  }

  if (!title) throw new Error('Title is required')
  if (title.length > 100) throw new Error('Title must be at most 100 characters')
  if (!description) throw new Error('Description is required')
  if (description.length > 1000) throw new Error('Description must be at most 1000 characters')
  if (!data.courses?.length) throw new Error('At least one course is required')
  if (!data.deadline) throw new Error('Deadline is required')
  if (!data.duration?.trim()) throw new Error('Duration is required')

  const firstTag = skillTags[0]
  const field = data.field || (firstTag ? TAG_TO_FIELD[firstTag] ?? firstTag : 'General')

  // Calculate points based on type (type multiplier applied once at creation)
  // Type multipliers: Event (2.0×) > Course (1.75×) > Task (1.0×)
  const TYPE_MULTIPLIERS: Record<string, number> = {
    'Event': 2.0,      // Highest: live, time-bound, high engagement
    'Course': 1.75,    // Second highest: structured learning path
    'Task': 1.0,       // Base: individual assignments
  };
  
  // Base points for all accumulations: 100
  // Points = Base × Type Multiplier
  const BASE_POINTS = 100;
  const typeMultiplier = TYPE_MULTIPLIERS[data.type] || 1.0;
  const calculatedPoints = Math.round(BASE_POINTS * typeMultiplier);

  return Accumulation.create({
    ...data,
    title,
    description,
    skillTags,
    field,
    resourceLink: data.resourceLink,
    points: calculatedPoints,
    status: 'Active',
    participants: 0,
    participantList: [],
    grades: [],
  })
};

/**
 * End an accumulation (school or company)
 * @param id - Accumulation ID
 * @param source - Source type to verify ownership ('school' or 'company')
 */
export const endAccumulation = async (id: string, source: 'school' | 'company') => {
  const accum = await Accumulation.findById(id);
  if (!accum) throw new Error('Accumulation not found');
  if (accum.createdBy !== source) throw new Error(`Only ${source} accumulations can be ended by ${source}`);
  if (accum.status === 'Completed') throw new Error('Accumulation already completed');
  if (accum.status === 'Cancelled') throw new Error('Accumulation is cancelled');
  accum.status = 'Completed';
  return accum.save();
};

export const cancelAccumulation = async (id: string, source: 'school' | 'company') => {
  const accum = await Accumulation.findById(id);
  if (!accum) throw new Error('Accumulation not found');
  if (accum.createdBy !== source) throw new Error(`Only ${source} accumulations can be cancelled by ${source}`);
  if (accum.status === 'Cancelled') throw new Error('Accumulation already cancelled');
  if (accum.status === 'Completed') throw new Error('Accumulation is already completed');
  accum.status = 'Cancelled';
  return accum.save();
};

/**
 * Grade a participant in an accumulation
 */
export const gradeParticipant = async (
  accumId: string,
  participantName: string,
  gradeData: Partial<IParticipantGrade>
) => {
  const accum = await Accumulation.findById(accumId);
  if (!accum) throw new Error('Accumulation not found');
  if (accum.status !== 'Completed') throw new Error('Grading is only allowed after the accumulation has ended');

  const existing = accum.grades.find(g => g.participantName === participantName);
  if (existing) {
    Object.assign(existing, gradeData);
  } else {
    accum.grades.push({ participantName, grade: '', skillRatings: {}, feedback: '', ...gradeData });
  }
  return accum.save();
};

/**
 * Delete an accumulation (school or company)
 * @param id - Accumulation ID
 * @param source - Source type to verify ownership ('school' or 'company')
 */
export const deleteAccumulation = async (id: string, source: 'school' | 'company') => {
  const accum = await Accumulation.findByIdAndDelete(id);
  if (!accum) throw new Error('Accumulation not found');

  // Verify ownership using createdBy field
  if (accum.createdBy !== source) {
    throw new Error(`Only ${source} accumulations can be deleted by ${source}`);
  }

  return accum;
};
