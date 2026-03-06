import { startRelay } from "./server.js";
import type { RelayConfig } from "./types.js";

function parseArgs(argv: string[]): RelayConfig {
  const args = argv.slice(2);
  let port = 18790;
  let secret = process.env.DEVCHAT_SECRET ?? "";
  let jwtSecret = process.env.DEVCHAT_JWT_SECRET ?? "";
  let jwtAudience = process.env.DEVCHAT_JWT_AUDIENCE ?? "devchat-relay";
  let projectDir = process.cwd();
  let openclawUrl = process.env.OPENCLAW_URL ?? "http://127.0.0.1:18789";
  let openclawToken = process.env.OPENCLAW_TOKEN ?? "";

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--port":
      case "-p":
        port = parseInt(args[++i], 10);
        break;
      case "--secret":
      case "-s":
        secret = args[++i];
        break;
      case "--jwt-secret":
        jwtSecret = args[++i];
        break;
      case "--jwt-audience":
        jwtAudience = args[++i];
        break;
      case "--project":
        projectDir = args[++i];
        break;
      case "--openclaw-url":
        openclawUrl = args[++i];
        break;
      case "--openclaw-token":
      case "-t":
        openclawToken = args[++i];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }

  if (!secret) {
    console.error("[relay] No secret provided. Set DEVCHAT_SECRET env var or pass --secret <value>");
    process.exit(1);
  }

  if (!openclawToken) {
    console.error("[relay] No OpenClaw token provided. Set OPENCLAW_TOKEN env var or pass --openclaw-token <value>");
    process.exit(1);
  }

  return {
    port,
    secret,
    jwtSecret: jwtSecret || undefined,
    jwtAudience: jwtAudience || undefined,
    projectDir,
    openclawUrl,
    openclawToken,
  };
}

function printHelp() {
  console.log(`
dev-chat-relay — WebSocket relay between dev chat widget and OpenClaw

Usage:
  dev-chat-relay [options]

Options:
  --port, -p <n>              Relay port (default: 18790)
  --secret, -s <str>          Auth secret (or set DEVCHAT_SECRET env var)
  --jwt-secret <str>          Optional HS256 JWT secret for invite-only auth
  --jwt-audience <str>        JWT audience (default: devchat-relay)
  --project <path>            Project directory (default: cwd)
  --openclaw-url <url>        OpenClaw HTTP base URL (default: http://127.0.0.1:18789)
  --openclaw-token, -t <str>  Gateway token (or set OPENCLAW_TOKEN env var)
  --help, -h                  Show this help
`);
}

const config = parseArgs(process.argv);
const relay = startRelay(config);

process.on("SIGINT", () => {
  console.log("\n[relay] Shutting down...");
  relay.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  relay.close();
  process.exit(0);
});
