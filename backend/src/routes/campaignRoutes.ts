import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  setRecipientsFromAudience,
  setRecipientsFromList,
} from '../controllers/campaignController.js';

const router = Router();

router.post('/', authMiddleware, createCampaign);
router.get('/', authMiddleware, getCampaigns);
router.get('/:id', authMiddleware, getCampaignById);
router.post('/:id/recipients/audience', authMiddleware, setRecipientsFromAudience);
router.post('/:id/recipients/list', authMiddleware, setRecipientsFromList);

export default router;