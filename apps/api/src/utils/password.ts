import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getResetTokenExpiry(): Date {
  // Token expires in 1 hour
  return new Date(Date.now() + 60 * 60 * 1000);
}
