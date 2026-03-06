import type { IncomingMessage } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";

const TAILSCALE_CIDR = /^100\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

export function validateOrigin(req: IncomingMessage, allowedOrigins?: string[]): boolean {
  const origin = req.headers.origin ?? "";
  const remoteIp = req.socket.remoteAddress ?? "";

  // Always allow localhost
  if (
    origin === "" ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    remoteIp === "127.0.0.1" ||
    remoteIp === "::1"
  ) {
    return true;
  }

  // Allow Tailscale IPs (100.x.x.x CGNAT range)
  if (TAILSCALE_CIDR.test(remoteIp)) return true;

  // Check user-supplied allowlist
  if (allowedOrigins?.some((o) => origin.includes(o))) return true;

  return false;
}

export function validateSecret(provided: string, expected: string): boolean {
  if (!expected || !provided) return false;
  // Constant-time comparison to avoid timing attacks
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface RelayTokenClaims {
  sub: string;
  role?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function verifyHs256Jwt(token: string, secret: string): RelayTokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;

  let header: { alg?: string; typ?: string };
  let payload: RelayTokenClaims;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    return null;
  }

  if (header.alg !== "HS256") return null;

  const signed = `${headerB64}.${payloadB64}`;
  const expected = createHmac("sha256", secret).update(signed).digest();
  const got = Buffer.from(sigB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (got.length !== expected.length) return null;
  if (!timingSafeEqual(got, expected)) return null;

  return payload;
}

export function verifyRelayToken(
  token: string,
  secret: string,
  audience?: string,
): RelayTokenClaims | null {
  if (!token || !secret) return null;
  const claims = verifyHs256Jwt(token, secret);
  if (!claims) return null;

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp && claims.exp < now) return null;

  if (audience) {
    const aud = claims.aud;
    const ok = Array.isArray(aud) ? aud.includes(audience) : aud === audience;
    if (!ok) return null;
  }

  if (!claims.sub) return null;
  return claims;
}

export function assertDevMode(): void {
  if (process.env.NODE_ENV === "production") {
    console.error("[dev-chat-relay] Refusing to start in production mode.");
    process.exit(1);
  }
}
