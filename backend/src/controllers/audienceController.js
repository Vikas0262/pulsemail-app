import prisma from '../db/prisma.js';
import { buildFilterWhere } from '../utils/filterUtils.js';
export const createAudience = async (req, res) => {
    try {
        const accountId = req.accountId;
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create audience' });
    }
};
export const getAudiences = async (req, res) => {
    try {
        const accountId = req.accountId;
        const audiences = await prisma.audience.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
        });
        // For each audience, compute how many contacts currently match its filter
        const audiencesWithCount = await Promise.all(audiences.map(async (audience) => {
            const where = buildFilterWhere(accountId, audience.filterRule);
            const count = await prisma.contact.count({ where });
            return { ...audience, memberCount: count };
        }));
        res.json({ audiences: audiencesWithCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch audiences' });
    }
};
export const getAudienceMembers = async (req, res) => {
    try {
        const accountId = req.accountId;
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch audience members' });
    }
};
//# sourceMappingURL=audienceController.js.map