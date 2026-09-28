import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import * as solutionController from '../controllers/solution.controller';

const router = Router();

router.use(verifyToken);
router.get('/search', solutionController.searchSolutions);

export default router;
