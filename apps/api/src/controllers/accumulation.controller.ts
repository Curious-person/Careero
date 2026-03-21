import { Request, Response, NextFunction } from 'express';
import * as accumulationService from '../services/accumulation.service';

export const getAccumulations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source } = req.query;
    const data = await accumulationService.getAllAccumulations(source as string | undefined);
    res.json({ message: 'Accumulations retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

export const getAccumulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accum = await accumulationService.getAccumulationById(req.params.id);
    if (!accum) return res.status(404).json({ message: 'Accumulation not found' });
    res.json({ message: 'Accumulation retrieved successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

export const createAccumulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accum = await accumulationService.createAccumulation(req.body);
    res.status(201).json({ message: 'Accumulation created successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

export const endAccumulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accum = await accumulationService.endAccumulation(req.params.id);
    res.json({ message: 'Accumulation ended successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

export const gradeParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { participantName, grade, skillRatings, feedback } = req.body;
    const accum = await accumulationService.gradeParticipant(req.params.id, participantName, {
      grade,
      skillRatings,
      feedback,
    });
    res.json({ message: 'Participant graded successfully', data: accum });
  } catch (error) {
    next(error);
  }
};

export const deleteAccumulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await accumulationService.deleteAccumulation(req.params.id);
    res.json({ message: 'Accumulation deleted successfully' });
  } catch (error) {
    next(error);
  }
};
