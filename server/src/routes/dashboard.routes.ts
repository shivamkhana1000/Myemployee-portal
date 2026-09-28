import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { managerDashboardHandler, employeeDashboardHandler } from '../controllers/dashboard.controller';

const router = Router();

router.use(verifyToken);

// Manager only
router.get('/manager',  requireRole('manager'),  managerDashboardHandler);
// Any authenticated user
router.get('/employee', employeeDashboardHandler);

export default router;
