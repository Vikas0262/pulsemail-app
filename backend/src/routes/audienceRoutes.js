import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createAudience, getAudiences, getAudienceMembers, } from '../controllers/audienceController.js';
const router = Router();
router.post('/', authMiddleware, createAudience);
router.get('/', authMiddleware, getAudiences);
router.get('/:id/members', authMiddleware, getAudienceMembers);
export default router;
//# sourceMappingURL=audienceRoutes.js.map