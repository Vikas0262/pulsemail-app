import { Response } from 'express';
import { parse } from 'csv-parse/sync';
import prisma from '../db/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const STANDARD_FIELDS = new Set(['name', 'email', 'phone', 'city', 'tags']);

export const importContacts = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const rows: Record<string, string>[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let added = 0;
    let skipped = 0;

    for (const row of rows) {
      const email = row.email?.toLowerCase().trim() || undefined;
      const phone = row.phone?.trim() || undefined;

      if (!email && !phone) {
        skipped++;
        continue;
      }

      const existing = await prisma.contact.findFirst({
        where: {
          accountId,
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const tags = row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      const customFields: Record<string, string> = {};

      for (const [key, value] of Object.entries(row)) {
        if (!STANDARD_FIELDS.has(key) && value?.trim()) {
          customFields[key] = value.trim();
        }
      }

      await prisma.contact.create({
        data: {
          accountId,
          name: row.name?.trim() || null,
          email: email || null,
          phone: phone || null,
          city: row.city?.trim() || null,
          tags,
          customFields,
        },
      });

      added++;
    }

    res.status(200).json({
      message: `${added} added, ${skipped} skipped as duplicates`,
      added,
      skipped,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import contacts' });
  }
};
