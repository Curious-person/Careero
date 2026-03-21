import { Router } from 'express';
import * as accumulationController from '../../controllers/accumulation.controller';

const router = Router();

router.get('/', accumulationController.getAccumulations);
router.get('/:id', accumulationController.getAccumulation);
router.post('/', accumulationController.createAccumulation);
router.patch('/:id/end', accumulationController.endAccumulation);
router.post('/:id/grade', accumulationController.gradeParticipant);
router.delete('/:id', accumulationController.deleteAccumulation);

export default router;
