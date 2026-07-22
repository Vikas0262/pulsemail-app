import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  accountId?: number;
  userId?: number;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as unknown as {
      userId: number;
      accountId: number;
    };

    req.accountId = decoded.accountId;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
