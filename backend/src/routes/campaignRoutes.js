import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createCampaign, getCampaigns, getCampaignById, setRecipientsFromAudience, setRecipientsFromList, } from '../controllers/campaignController.js';
import { sendCampaign } from '../controllers/campaignController.js';
import { getCampaignAnalytics } from '../controllers/campaignController.js';
const router = Router();
router.post('/', authMiddleware, createCampaign);
router.get('/', authMiddleware, getCampaigns);
router.get('/:id', authMiddleware, getCampaignById);
router.post('/:id/recipients/audience', authMiddleware, setRecipientsFromAudience);
router.post('/:id/recipients/list', authMiddleware, setRecipientsFromList);
router.get('/:id/analytics', authMiddleware, getCampaignAnalytics);
router.post('/:id/send', authMiddleware, sendCampaign);
export default router;
//# sourceMappingURL=campaignRoutes.js.map