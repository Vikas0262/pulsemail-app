import { Worker } from 'bullmq';
import connection from '../db/redis.js';
import prisma from '../db/prisma.js';
import { sendCampaignEmail } from '../services/emailService.js';

const worker = new Worker(
  'campaign-sending',
  async (job) => {
    const { campaignId } = job.data;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { recipients: true },
    });

    if (!campaign) {
      console.error(`Campaign ${campaignId} not found`);
      return;
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'sending' },
    });

    for (const recipient of campaign.recipients) {
      try {
        const result = await sendCampaignEmail(recipient.email, campaign.subject, campaign.body);

        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'sent',
            providerMessageId: result.data?.id || null,
          },
        });
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error);
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: 'failed' },
        });
      }
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'sent' },
    });
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Campaign job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Campaign job ${job?.id} failed:`, err);
});

export default worker;