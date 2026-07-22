import { Response } from 'express';
import prisma from '../db/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { campaignQueue } from '../queues/campaignQueue.js';
import { buildFilterWhere } from '../utils/filterUtils.js';

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const { name, subject, body } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'name, subject and body are required' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        accountId,
        name,
        subject,
        body,
        status: 'draft',
      },
    });

    res.status(201).json({ campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const campaigns = await prisma.campaign.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const campaignId = Number(req.params.id);

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, accountId },
      include: { recipients: true },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
};

export const setRecipientsFromAudience = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const campaignId = Number(req.params.id);
    const { audienceId, tag } = req.body;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, accountId },
    });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    let contacts;

    if (audienceId) {
      const audience = await prisma.audience.findFirst({
        where: { id: Number(audienceId), accountId },
      });
      if (!audience) {
        return res.status(404).json({ error: 'Audience not found' });
      }
      const filterRule = audience.filterRule as Record<string, unknown>;
      const where = buildFilterWhere(accountId, filterRule);
      contacts = await prisma.contact.findMany({ where });
    } else if (tag) {
      contacts = await prisma.contact.findMany({
        where: { accountId, tags: { has: tag } },
      });
    } else {
      return res.status(400).json({ error: 'audienceId or tag is required' });
    }

    // Remove any existing recipients for this campaign first (in case this is being re-run)
    await prisma.campaignRecipient.deleteMany({ where: { campaignId } });

    const recipients = await prisma.campaignRecipient.createMany({
      data: contacts
        .filter((c) => c.email)
        .map((c) => ({
          campaignId,
          contactId: c.id,
          email: c.email as string,
          status: 'pending',
        })),
    });

    res.json({ message: `${recipients.count} recipients added`, count: recipients.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set recipients' });
  }
};

export const setRecipientsFromList = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const campaignId = Number(req.params.id);
    const { entries } = req.body; // array of strings: emails or phones, pasted by user

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'entries array is required' });
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, accountId },
    });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const matched: { entry: string; contactId: number; name: string | null; email: string }[] = [];
    const unmatched: string[] = [];

    for (const raw of entries) {
      const entry = raw.trim();
      if (!entry) continue;

      const contact = await prisma.contact.findFirst({
        where: {
          accountId,
          OR: [{ email: entry.toLowerCase() }, { phone: entry }],
        },
      });

      if (contact && contact.email) {
        matched.push({ entry, contactId: contact.id, name: contact.name, email: contact.email });
      } else {
        unmatched.push(entry);
      }
    }

    await prisma.campaignRecipient.deleteMany({ where: { campaignId } });

    await prisma.campaignRecipient.createMany({
      data: matched.map((m) => ({
        campaignId,
        contactId: m.contactId,
        email: m.email,
        status: 'pending',
      })),
    });

    res.json({
      message: `${matched.length} matched, ${unmatched.length} unmatched`,
      matched,
      unmatched,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resolve recipients' });
  }
};

export const sendCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const campaignId = Number(req.params.id);
    const { scheduledAt } = req.body;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, accountId },
      include: { recipients: true },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.recipients.length === 0) {
      return res.status(400).json({ error: 'Campaign has no recipients. Add recipients first.' });
    }

    if (scheduledAt) {
      const scheduledTime = new Date(scheduledAt);
      const delay = scheduledTime.getTime() - Date.now();

      if (delay <= 0) {
        return res.status(400).json({ error: 'scheduledAt must be a future date/time' });
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'scheduled', scheduledAt: scheduledTime },
      });

      await campaignQueue.add(
        'send-campaign',
        { campaignId },
        { delay }
      );

      return res.json({ message: `Campaign scheduled for ${scheduledTime.toISOString()}` });
    } else {
      await campaignQueue.add('send-campaign', { campaignId });
      return res.json({ message: 'Campaign queued for immediate sending' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
};


export const getCampaignAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const campaignId = Number(req.params.id);

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, accountId },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId },
    });

    const totalRecipients = recipients.length;
    const sent = recipients.filter((r) => r.status === 'sent').length;
    const delivered = recipients.filter((r) => r.status === 'delivered').length;
    const opened = recipients.filter((r) => r.status === 'opened').length;
    const failed = recipients.filter((r) => r.status === 'failed').length;
    const pending = recipients.filter((r) => r.status === 'pending').length;

    res.json({
      campaignId,
      campaignName: campaign.name,
      status: campaign.status,
      totalRecipients,
      pending,
      sent,
      delivered,
      opened,
      failed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};