import { SignJWT } from "jose";

export async function mintRelayToken(email: string, role = "tester") {
  const secret = process.env.DEVCHAT_JWT_SECRET;
  if (!secret) throw new Error("missing DEVCHAT_JWT_SECRET");

  const aud = process.env.DEVCHAT_JWT_AUDIENCE || "devchat-relay";
  const key = new TextEncoder().encode(secret);

  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(email.toLowerCase())
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  return { token, audience: aud, expiresIn: 3600 };
}
