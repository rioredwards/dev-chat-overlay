# AGENTS.md (dev-chat-overlay)

**Class:** `production`
Follow these project rules before implementing changes.

## Required Reads

1. `UI_CONTRACT.md`
2. `QUALITY.md`

## Execution Rules

- If UI task has repeated failures, stop and do root-cause analysis before more edits.
- Do not perform iterative patch churn on the same symptom.
- Prefer maintainable frontend patterns; avoid monolithic inline style blobs.

## Quality Tax Trigger Phrase

If Rio says **"run quality tax pass"**, switch to refactor-only mode:

- no new features
- focus on maintainability, anti-pattern removal, structure, and cleanup
- enforce `QUALITY.md` + `UI_CONTRACT.md`
- produce a short report of what was improved and why

## Close-the-Loop (Mandatory)

Before claiming completion:

1. Run `npm run build`
2. Run `npm test`
3. Run runtime smoke check for demo chat reachability
4. Confirm UI contract checks on desktop + mobile

Report exact commands and pass/fail results.
