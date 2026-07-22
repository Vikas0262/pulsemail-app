import { Response } from "express";
import prisma from "../db/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const createContact = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const { name, email, phone, city, tags, customFields } = req.body;

    if (email) {
      const existing = await prisma.contact.findFirst({
        where: {
          accountId,
          OR: [{ email: email || undefined }, { phone: phone || undefined }],
        },
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: "Contact with this email or phone already exists" });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        accountId,
        name,
        email,
        phone,
        city,
        tags: tags || [],
        customFields: customFields || {},
      },
    });

    res.status(201).json({ contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create contact" });
  }
};

// Get all contacts for the logged-in account
const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const contacts = await prisma.contact.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

const updateContact = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const contactId = Number(req.params.id);
    const { name, email, phone, city, tags, customFields } = req.body;

    // Important: verify this contact belongs to THIS account before updating
    const existing = await prisma.contact.findFirst({
      where: { id: contactId, accountId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { name, email, phone, city, tags, customFields },
    });

    res.json({ contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update contact" });
  }
};


const deleteContact = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.accountId as number;
    const contactId = Number(req.params.id);

    const existing = await prisma.contact.findFirst({
      where: { id: contactId, accountId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Contact not found" });
    }

    await prisma.contact.delete({ where: { id: contactId } });
    res.json({ message: "Contact deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

export { createContact, getContacts, updateContact, deleteContact };