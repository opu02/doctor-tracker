import jwt, { SignOptions } from "jsonwebtoken";
import { CookieOptions } from "express";
import { env } from "../config/env";

export const AUTH_COOKIE = "dt_token";

export function signToken(userId: string, role: string): string {
  return jwt.sign({ role }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): { sub: string; role: string } {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string" || !decoded.sub) {
    throw new Error("Malformed token");
  }
  return { sub: decoded.sub, role: String((decoded as jwt.JwtPayload).role ?? "") };
}

/** Milliseconds until the token expires (used for the cookie maxAge). */
export function tokenMaxAgeMs(token: string): number {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  return decoded?.exp ? Math.max(decoded.exp * 1000 - Date.now(), 0) : 7 * 24 * 60 * 60 * 1000;
}

/**
 * httpOnly keeps the token away from JavaScript (XSS). sameSite=lax is enough because the
 * Next.js app proxies /api to this server, so the browser treats the cookie as first-party.
 */
export function cookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}
