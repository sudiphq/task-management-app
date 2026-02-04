import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/encryption";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = verifyAccessToken(accessToken);
    req.userId = Number(payload.userId);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};
