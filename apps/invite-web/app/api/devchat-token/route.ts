import { SignJWT } from "jose";
import { auth } from "../../../auth";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return Response.json({ error: "unauthorized" }, { status: 401 });

  const secret = process.env.DEVCHAT_JWT_SECRET;
  if (!secret) return Response.json({ error: "missing DEVCHAT_JWT_SECRET" }, { status: 500 });

  const aud = process.env.DEVCHAT_JWT_AUDIENCE || "devchat-relay";
  const key = new TextEncoder().encode(secret);

  const token = await new SignJWT({ role: "tester" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(email)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  return Response.json({ token, audience: aud, expiresIn: 3600 });
}
