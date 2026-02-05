import "dotenv/config";
import { CookieOptions } from "express";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
});

type Env = z.infer<typeof envSchema>;

export type Config = Env & {
  ACCESS_TOKEN_EXPIRES_IN: number;
  REFRESH_TOKEN_EXPIRES_IN: number;
  COOKIE_OPTIONS: CookieOptions;
};

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("ENV validation failed");
    console.error("ERROR: ", result.error);
    throw new Error("Invalid environment variables");
  }

  return result.data;
};

const getConfig = (): Config => {
  const env = parseEnv();

  return {
    ...env,
    ACCESS_TOKEN_EXPIRES_IN: 15 * 60 * 1000, // 15 minutes
    REFRESH_TOKEN_EXPIRES_IN: 7 * 24 * 60 * 60 * 1000, // 7 days
    COOKIE_OPTIONS: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      ...(env.NODE_ENV === "production"
        ? { domain: ".sudipbiswas.dev" }
        : undefined),
    },
  };
};

export default getConfig();
