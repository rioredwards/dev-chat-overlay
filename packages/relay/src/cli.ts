import { startRelay } from "./server.js";
import type { RelayConfig } from "./types.js";

function parseArgs(argv: string[]): RelayConfig {
  const args = argv.slice(2);
  let port = 18790;
  let secret = process.env.DEVCHAT_SECRET ?? "";
  let projectDir = process.cwd();
  let openclawUrl = "ws://127.0.0.1:18789";

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
      case "--project":
        projectDir = args[++i];
        break;
      case "--openclaw-url":
        openclawUrl = args[++i];
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

  return { port, secret, projectDir, openclawUrl };
}

function printHelp() {
  console.log(`
dev-chat-relay — WebSocket relay between dev chat widget and OpenClaw

Usage:
  dev-chat-relay [options]

Options:
  --port, -p <n>         Relay port (default: 18790)
  --secret, -s <str>     Auth secret (or set DEVCHAT_SECRET env var)
  --project <path>       Project directory (default: cwd)
  --openclaw-url <url>   OpenClaw WebSocket URL (default: ws://127.0.0.1:18789)
  --help, -h             Show this help
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
