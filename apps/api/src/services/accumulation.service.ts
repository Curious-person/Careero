import { Accumulation, IParticipantGrade, AccumSource } from '../models/Accumulation';

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
export const getAccumulationsByCreator = async (createdBy: 'school' | 'company') => {
  return Accumulation.find({ createdBy }).lean();
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
  source: 'school' | 'company';
  createdBy: 'school' | 'company';
  field?: string;
  courses: string[];
  deadline: string;
  duration: string;
  points: number;
  description: string;
  skillTags?: string[];
  resourceLink?: string;
  objectives?: string[];
  inCharge?: { name: string; role: string; email: string }[];
  challenges?: { title: string; description: string }[];
  modules?: { title: string; description: string }[];
  agenda?: { time: string; activity: string }[];
  tasks?: { title: string; description: string }[];
}) => {
  const title = data.title?.trim() ?? ''
  const description = data.description?.trim() ?? ''
  const skillTags = (data.skillTags ?? []).map(tag => {
    const normalized = tag.trim().toLowerCase().replace(/^#+/, '')
    return `#${normalized}`
  }).filter(Boolean)

  if (!title) throw new Error('Title is required')
  if (title.length > 100) throw new Error('Title must be at most 100 characters')
  if (!description) throw new Error('Description is required')
  if (description.length > 1000) throw new Error('Description must be at most 1000 characters')
  if (!data.courses?.length) throw new Error('At least one course is required')
  if (!data.deadline) throw new Error('Deadline is required')
  if (!data.duration?.trim()) throw new Error('Duration is required')
  if (!data.points || Number(data.points) <= 0) throw new Error('Points must be a positive value')

  if (data.type === 'Challenge') {
    if (!data.challenges?.length) throw new Error('At least one challenge is required')
    if (data.challenges.some(item => !item.title?.trim() || !item.description?.trim())) throw new Error('Each challenge requires a title and description')
  }
  if (data.type === 'Course') {
    if (!data.modules?.length) throw new Error('At least one module is required')
    if (data.modules.some(item => !item.title?.trim() || !item.description?.trim())) throw new Error('Each module requires a title and description')
  }
  if (data.type === 'Event') {
    if (!data.agenda?.length) throw new Error('At least one agenda item is required')
    if (data.agenda.some(item => !item.time?.trim() || !item.activity?.trim())) throw new Error('Each agenda item requires time and activity')
  }
  if (data.type === 'Task') {
    if (!data.tasks?.length) throw new Error('At least one task is required')
    if (data.tasks.some(item => !item.title?.trim() || !item.description?.trim())) throw new Error('Each task requires a title and description')
  }

  const firstTag = skillTags[0]
  const field = data.field || (firstTag ? TAG_TO_FIELD[firstTag] ?? firstTag : 'General')

  return Accumulation.create({
    ...data,
    title,
    description,
    skillTags,
    field,
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
  
  // Verify ownership
  if (accum.source !== source) {
    throw new Error(`Only ${source} accumulations can be ended by ${source}`);
  }
  
  if (accum.status === 'Ended') throw new Error('Accumulation already ended');
  accum.status = 'Ended';
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
  if (accum.status !== 'Ended') throw new Error('Grading is only allowed after the accumulation has ended');

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
  
  // Verify ownership
  if (accum.source !== source) {
    throw new Error(`Only ${source} accumulations can be deleted by ${source}`);
  }
  
  return accum;
};
