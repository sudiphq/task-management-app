import { Router } from "express";
import { eq } from "drizzle-orm";

import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/encryption";
import { db } from "../db";
import { users } from "../db/schema";
import config from "../config";
import { registerSchema, loginSchema } from "../utils/validations";

const router = Router();

router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0]?.message,
    });
  }

  const { name, email, password } = result.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const hashedPassword = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning();

  const accessToken = signAccessToken({ userId: String(newUser.id) });
  const refreshToken = signRefreshToken({ userId: String(newUser.id) });

  res.cookie("access_token", accessToken, {
    ...config.COOKIE_OPTIONS,
    maxAge: config.ACCESS_TOKEN_EXPIRES_IN,
  });

  res.cookie("refresh_token", refreshToken, {
    ...config.COOKIE_OPTIONS,
    maxAge: config.REFRESH_TOKEN_EXPIRES_IN,
  });

  const { password: _, ...userWithoutPassword } = newUser;

  return res.status(201).json({
    message: "Registration successful",
    user: userWithoutPassword,
  });
});

router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0]?.message,
    });
  }

  const { email, password } = result.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const accessToken = signAccessToken({ userId: String(user.id) });
  const refreshToken = signRefreshToken({ userId: String(user.id) });

  res.cookie("access_token", accessToken, {
    ...config.COOKIE_OPTIONS,
    maxAge: config.ACCESS_TOKEN_EXPIRES_IN,
  });

  res.cookie("refresh_token", refreshToken, {
    ...config.COOKIE_OPTIONS,
    maxAge: config.REFRESH_TOKEN_EXPIRES_IN,
  });

  const { password: _, ...userWithoutPassword } = user;

  return res.json({
    message: "Login successful",
    user: userWithoutPassword,
  });
});

router.post("/logout", (_, res) => {
  res.clearCookie("access_token", config.COOKIE_OPTIONS);
  res.clearCookie("refresh_token", config.COOKIE_OPTIONS);

  return res.json({ message: "Logged out successfully" });
});

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token not found" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const accessToken = signAccessToken({ userId: payload.userId });
    const newRefreshToken = signRefreshToken({ userId: payload.userId });

    res.cookie("access_token", accessToken, {
      ...config.COOKIE_OPTIONS,
      maxAge: config.ACCESS_TOKEN_EXPIRES_IN,
    });

    res.cookie("refresh_token", newRefreshToken, {
      ...config.COOKIE_OPTIONS,
      maxAge: config.REFRESH_TOKEN_EXPIRES_IN,
    });

    return res.json({ message: "Token refreshed successfully" });
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

export default router;
