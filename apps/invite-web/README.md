# invite-web (email allowlist gateway)

Minimal Next.js + Auth.js app to gate DevChat access by allowlisted email and mint relay JWT tokens.

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. **Important:** replace `re_xxxxxxxxx` with your real Resend API key.
3. Install deps in this app folder.
4. Run Prisma migration + generate client.
5. Seed `AllowedUser` rows for invited emails.
6. Start app (`npm run dev`) on port 3010.

## Resend test email (Hello World)

This project includes a test endpoint using your Resend API key:

- `POST /api/test-email`
- Uses:
  - `AUTH_FROM` (set to `devchat@example.com` by default)
  - `TEST_EMAIL_TO` (default `you@example.com`)

Example curl:

```bash
curl -X POST http://localhost:3010/api/test-email
```

## Flow

- User signs in via magic link (Resend provider).
- `signIn` callback checks `AllowedUser.enabled`.
- Signed-in users can call `/api/devchat-token`.
- Endpoint mints short-lived HS256 JWT for relay.
- If `DEVCHAT_APP_URL` is set, authenticated users are auto-redirected into your DevChat app with a short-lived token.

## Relay

Start relay with matching JWT config:

```bash
dev-chat-relay --project . --jwt-secret "$DEVCHAT_JWT_SECRET" --jwt-audience devchat-relay
```
