import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login — public
router.post('/login', login);

// GET /api/auth/me — requires a valid JWT
router.get('/me', verifyToken, me);

export default router;
