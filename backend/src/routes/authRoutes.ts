import { Router } from 'express';
import signup from '../controllers/signupController.js';
import login from '../controllers/loginController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

export default router;