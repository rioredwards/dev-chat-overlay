# QUALITY.md

This file defines mandatory quality gates for all code changes.

## Change Policy

- One intent per change set (feature OR refactor OR infra), unless explicitly approved.
- If 2 fix attempts fail on the same issue, stop and run a root-cause analysis before more edits.
- Prefer structural fixes over patch churn.

## Required Validation Before "Done"

1. `npm run build`
2. `npm test`
3. Runtime smoke check on the live demo path:
   - app loads
   - chat launcher is visible/reachable
   - chat can connect/send

If any check fails, do not claim completion.

## Frontend Guardrails

- Avoid giant inline CSS strings in TS/TSX.
- Prefer maintainable styling patterns:
  - Tailwind OR
  - CSS modules OR
  - component-scoped stylesheet files.
- Keep layout rules centralized (not scattered across multiple ad hoc style blocks).

## Visual Acceptance Gate

At minimum verify these viewports after UI changes:

- Mobile: 390x844
- Desktop: 1440x900

And confirm:

- background covers full viewport edge-to-edge
- main content container follows `UI_CONTRACT.md`
- chat launcher position/reachability follows `UI_CONTRACT.md`

## Stability / Recovery Rules

- Chat must remain reachable even when page UI fails.
- Reconnection state must be visible to users.
- Never ship a change that can strand users without chat access.

## Merge Note Format

Every completion update should include:

- Scope changed
- Commands run
- Pass/fail per gate
- Residual risk
