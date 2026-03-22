import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import * as roleController from '../../controllers/role.controller';

const router = Router();

// All role routes require authentication
router.use(authenticateToken);

// GET /api/v1/roles/stats - Get role statistics
router.get('/stats', roleController.getRoleStats);

// GET /api/v1/roles - Get all roles for the company
router.get('/', roleController.getRoles);

// GET /api/v1/roles/student/matches - Get student internship offers matched by Careero
router.get('/student/matches', roleController.getStudentMatches);

// GET /api/v1/roles/:id - Get a specific role by ID
router.get('/:id', roleController.getRoleById);

// POST /api/v1/roles/:id/apply - Apply for a role
router.post('/:id/apply', roleController.applyForRole);

// POST /api/v1/roles - Create a new role
router.post('/', roleController.createRole);

// PUT /api/v1/roles/:id - Update a role
router.put('/:id', roleController.updateRole);

// DELETE /api/v1/roles/:id - Delete a role
router.delete('/:id', roleController.deleteRole);

export default router;
