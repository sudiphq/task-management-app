import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";

const SALT_ROUNDS = 10;
const { JWT_ACCESS_SECRET, REFRESH_TOKEN_EXPIRES_IN, ACCESS_TOKEN_EXPIRES_IN, JWT_REFRESH_SECRET } = config;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export type JwtPayload = {
  userId: string;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}
