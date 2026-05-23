import { Router } from 'express';
import { signup } from '../controller/auth.controller';

const router = Router();

// POST /api/auth/signup
router.post('/signup', signup);


export default router;
