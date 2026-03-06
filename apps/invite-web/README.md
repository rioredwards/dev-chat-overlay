# invite-web (email allowlist gateway)

Minimal Next.js + Auth.js app to gate DevChat access by allowlisted email and mint relay JWT tokens.

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Install deps in this app folder.
3. Run Prisma migration + generate client.
4. Seed `AllowedUser` rows for invited emails.
5. Start app (`npm run dev`) on port 3010.

## Flow

- User signs in via magic link (Resend provider).
- `signIn` callback checks `AllowedUser.enabled`.
- Signed-in users can call `/api/devchat-token`.
- Endpoint mints short-lived HS256 JWT for relay.
- Client app passes this token to `DevChatOverlay` as `token`.

## Relay

Start relay with matching JWT config:

```bash
dev-chat-relay --project . --jwt-secret "$DEVCHAT_JWT_SECRET" --jwt-audience devchat-relay
```
