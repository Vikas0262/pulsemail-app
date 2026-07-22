import { Request, Response } from 'express';
import prisma from '../db/prisma.js';

export const handleResendWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;

    console.log('Webhook received:', event.type);

    const messageId = event.data?.email_id;
    if (!messageId) {
      return res.status(200).json({ received: true }); // acknowledge anyway
    }

    let newStatus: string | null = null;

    if (event.type === 'email.delivered') {
      newStatus = 'delivered';
    } else if (event.type === 'email.opened') {
      newStatus = 'opened';
    }

    if (newStatus) {
      await prisma.campaignRecipient.updateMany({
        where: { providerMessageId: messageId },
        data: { status: newStatus },
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    res.status(200).json({ received: true }); // still acknowledge to avoid retries
  }
};