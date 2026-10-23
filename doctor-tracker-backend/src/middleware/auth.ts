import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { AUTH_COOKIE, verifyToken } from "../utils/token";
import { User } from "../models/User";

/** Requires a valid session (httpOnly cookie, or Bearer token for API clients like Postman). */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token: string | undefined =
    req.cookies?.[AUTH_COOKIE] ?? (header?.startsWith("Bearer ") ? header.slice(7) : undefined);

  if (!token) throw new AppError(401, "Authentication required");

  let payload: { sub: string; role: string };
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired session. Please log in again.");
  }

  // Re-check the user on every request so deleted users lose access immediately
  const user = await User.findById(payload.sub).select("role").lean();
  if (!user) throw new AppError(401, "User no longer exists");

  req.user = { id: String(user._id), role: user.role };
  next();
});

/** Authorization: allow only the listed roles. Use after `protect`. */
export const restrictTo =
  (...roles: Array<"admin">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action"));
    }
    next();
  };
