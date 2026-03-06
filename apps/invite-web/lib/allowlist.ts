import { db } from "./db";

export async function isAllowlisted(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const row = await db.allowedUser.findUnique({ where: { email: normalized } });
  return !!row?.enabled;
}
