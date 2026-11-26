# ADR 007 — Match the dogs selected by two owners

## Context

The discovery tab loads real dog profiles from PostgreSQL. An owner may have multiple dogs. The onboarding draft is currently local, so a signed-in account can browse and react before it has a stored dog profile.

## Decision

A swipe records the authenticated account and the dog it selected. Discovery shows dogs belonging to other accounts, excluding dogs already rated in the current pass. Results are ordered consistently without distance or ranking signals.

If Alice likes Bruno's first dog and Bruno likes Alice's second dog, those two selected dogs form a match. Each match row stores the two dog IDs in a canonical order. Swipes and match creation run in the same transaction. Locking the two accounts in the database's order lets simultaneous likes see each other.

Restarting discovery makes the account's past choices inactive. The historical swipes and matches remain stored. Inactive likes stop forming new matches until they are given again.

## Consequences

- Existing swipes are attributed to the owner of their source dog. If several of that owner's dogs rated the same target, the most recent decision is active.
- An account with no dog in PostgreSQL can browse and rate other dogs. It can receive a reciprocal like once it has a dog profile in the database.
- Discovery and match creation share the existing Hono API and Drizzle schema. Ranking and geographic filters can be added to the discovery query when their rules are defined.
