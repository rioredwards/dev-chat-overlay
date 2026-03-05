# Dev Chat Overlay SDK

A dev-only chat overlay you drop into any web app. Chat with OpenClaw from inside your running app — on your phone, remotely, via Tailscale — and watch AI edit your code live.

```
iPhone → Tailscale → Mac Mini → Dev Server (with chat widget)
                                     ↕ WebSocket
                                Relay Server (port 18790)
                                     ↕ WebSocket
                                OpenClaw Daemon (port 18789)
                                     ↕
                                AI Agents → file edits → hot reload → iPhone sees changes
```

## Packages

| Package | Description |
|---------|-------------|
| `@rio/dev-chat-widget` | React chat overlay component + vanilla JS `mountDevChat()` |
| `@rio/dev-chat-relay` | Standalone WebSocket relay between widget and OpenClaw |

## Quick Start

### 1. Install

```bash
npm install @rio/dev-chat-widget @rio/dev-chat-relay
```

### 2. Start the relay alongside your dev server

```bash
DEVCHAT_SECRET=my-secret npx dev-chat-relay --project .
```

Or add to your `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently 'next dev' 'dev-chat-relay --project .'",
    "relay": "dev-chat-relay --project ."
  }
}
```

### 3. Mount the widget

**React:**

```tsx
import { DevChatOverlay } from '@rio/dev-chat-widget';

// In your layout or root component — only renders in development
<DevChatOverlay
  url="ws://localhost:18790"
  secret={process.env.NEXT_PUBLIC_DEVCHAT_SECRET!}
/>
```

**Vanilla JS:**

```ts
if (process.env.NODE_ENV === 'development') {
  import('@rio/dev-chat-widget').then(({ mountDevChat }) =>
    mountDevChat({ url: 'ws://localhost:18790', secret: 'my-secret' })
  );
}
```

### 4. View on phone via Tailscale

```bash
# Expose your dev server over Tailscale
tailscale serve --bg 3000
```

Open the Tailscale URL on your phone. The chat overlay appears in-app.

## Relay CLI Options

```
dev-chat-relay [options]

--port, -p <n>         Relay port (default: 18790)
--secret, -s <str>     Auth secret (or set DEVCHAT_SECRET env var)
--project <path>       Project directory (default: cwd)
--openclaw-url <url>   OpenClaw WebSocket URL (default: ws://127.0.0.1:18789)
--help, -h             Show help
```

## WebSocket Protocol

All messages are JSON with a `type` field.

### Client → Relay

| Type | Fields | Purpose |
|------|--------|---------|
| `auth` | `secret` | Authenticate (must be first message) |
| `message` | `id`, `text`, `agent?` | Send a coding task |
| `cancel` | `taskId` | Cancel in-flight task |
| `confirm_response` | `taskId`, `approved` | Respond to confirmation gate |

### Relay → Client

| Type | Fields | Purpose |
|------|--------|---------|
| `authenticated` | `ok` | Auth result |
| `status` | `taskId`, `status` | Task lifecycle (queued/running/done/error) |
| `activity` | `taskId`, `text` | Live feed of what the agent is doing |
| `assistant` | `taskId`, `text`, `done` | Streamed response chunks |
| `files` | `taskId`, `changed` | List of modified files |
| `confirm` | `taskId`, `action`, `description` | Confirmation gate (destructive ops) |
| `error` | `taskId`, `message` | Error details |

## Security

- **Dev-only**: widget won't mount and relay won't start in production
- **Auth handshake**: first WS message must contain the correct secret
- **Origin check**: relay validates localhost or Tailscale IP range (100.x.x.x)
- **Confirmation gates**: destructive operations pause for user approval

## Development

```bash
# Install
npm install

# Build both packages
npm run build

# Run tests
npm test
```
