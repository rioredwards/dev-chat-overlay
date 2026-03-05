import type { IncomingMessage } from "node:http";

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

export function assertDevMode(): void {
  if (process.env.NODE_ENV === "production") {
    console.error("[dev-chat-relay] Refusing to start in production mode.");
    process.exit(1);
  }
}
