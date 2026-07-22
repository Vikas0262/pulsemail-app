import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
import { Request, Response } from "express";

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, accountId: user.accountId },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res
      .status(200)
      .json({
        token,
        user: { id: user.id, email: user.email, accountId: user.accountId },
      });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
export default login;
