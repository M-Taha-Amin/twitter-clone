import { Router } from 'express';
import { getMe, login, logout, signup } from '../controllers/auth.controller.js';
import { jwtVerify } from '../middlewares/jwtVerify.js';

const router = Router();

router.get('/me', jwtVerify, getMe)
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router;
