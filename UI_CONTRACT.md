# UI_CONTRACT.md

This file defines non-negotiable UI behavior for the demo app.

## Global Layout

- Background must be full-bleed (cover the full viewport).
- `html` and `body` must not introduce default spacing that insets the background.
- Main content uses a centered container with a max width on desktop.

## Container Rules

- Desktop: centered, constrained width (readable and balanced).
- Mobile: full-width feel with safe horizontal padding.
- No accidental hard cap that makes desktop look like a phone column.

## Chat Launcher / Panel Rules

- Chat launcher must always be visible and reachable.
- Mobile default position: bottom-right.
- If persisted position is invalid/off-screen, auto-reset to default.
- Users must always be able to reopen chat.

## Chat State Visibility

User-facing status must be clear and non-technical:

- Working
- Waiting for your approval
- Done
- Needs attention
- Reconnecting

Avoid internal code-centric details in primary UX.

## Failure Safety

- If page UI errors, preserve a recovery path to chat.
- If relay disconnects, show clear reconnect guidance.
- Do not hide or disable chat without fallback.

## Regression Checklist (UI)

For any UI change, verify on mobile + desktop:

1. Full-bleed background
2. Container width behavior is correct
3. Chat launcher location/reachability
4. Chat open/close works
5. Chat still usable after refresh
