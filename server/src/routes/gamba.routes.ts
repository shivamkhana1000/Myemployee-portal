import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import * as gambaController from '../controllers/gamba.controller';

const router = Router();

router.use(verifyToken);

router.post('/', gambaController.createGamba);
router.get('/', gambaController.listGamba);
router.get('/:id', gambaController.getGamba);
router.patch('/:id', gambaController.updateGamba);

export default router;
