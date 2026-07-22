import { Response } from 'express';
import prisma from '../db/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Converts a filter rule like { field: "city", value: "Mumbai" } into a Prisma where clause
function buildFilterWhere(accountId: number, filterRule: any) {
  const baseWhere: any = { accountId };

  if (!filterRule || !filterRule.field || filterRule.value === undefined) {
    return baseWhere; // no filter = matches all contacts in this account
  }

  const { field, value } = filterRule;

  // tags is an array field, needs a different Prisma operator than plain text fields
  if (field === 'tags') {
    return { ...baseWhere, tags: { has: value } };
  }

  // city, name, email, phone are direct columns
  if (['city', 'name', 'email', 'phone'].includes(field)) {
    return { ...baseWhere, [field]: value };
  }

  // anything else is assumed to be a custom field stored inside the JSONB column
  return {
    ...baseWhere,
    customFields: {
      path: [field],
      equals: value,
    },
  };
}

export const createAudience = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const { name, filterRule } = req.body;

    if (!name || !filterRule) {
      return res.status(400).json({ error: 'name and filterRule are required' });
    }

    const audience = await prisma.audience.create({
      data: {
        accountId,
        name,
        filterRule,
      },
    });

    res.status(201).json({ audience });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create audience' });
  }
};

export const getAudiences = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;

    const audiences = await prisma.audience.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });

    // For each audience, compute how many contacts currently match its filter
    const audiencesWithCount = await Promise.all(
      audiences.map(async (audience) => {
        const where = buildFilterWhere(accountId, audience.filterRule);
        const count = await prisma.contact.count({ where });
        return { ...audience, memberCount: count };
      })
    );

    res.json({ audiences: audiencesWithCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audiences' });
  }
};

export const getAudienceMembers = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const audienceId = Number(req.params.id);

    const audience = await prisma.audience.findFirst({
      where: { id: audienceId, accountId },
    });

    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    const where = buildFilterWhere(accountId, audience.filterRule);
    const contacts = await prisma.contact.findMany({ where });

    res.json({ audience, contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audience members' });
  }
};