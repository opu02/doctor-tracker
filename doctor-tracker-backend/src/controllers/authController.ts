import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User, UserDoc } from "../models/User";
import { loginSchema } from "../validators/auth";
import { AppError } from "../utils/AppError";
import { AUTH_COOKIE, cookieOptions, signToken, tokenMaxAgeMs } from "../utils/token";

// Compared against when the email does not exist, so response time does not reveal valid emails
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

function toPublicUser(user: Pick<UserDoc, "name" | "email" | "role"> & { id: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken(user.id, user.role);
  res.cookie(AUTH_COOKIE, token, cookieOptions(tokenMaxAgeMs(token)));
  res.json({ data: { user: toPublicUser(user) } });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
  res.json({ data: { message: "Logged out" } });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError(401, "User no longer exists");
  res.json({ data: { user: toPublicUser(user) } });
}
