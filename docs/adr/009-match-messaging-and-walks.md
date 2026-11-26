# ADR 009 — Match messaging and walks

## Decision

Each existing dog match is its own conversation. The two owners have access through their Better Auth sessions. Before the first message it appears in New matches, then in Discussions.

PostgreSQL stores text messages and walk proposals in one history. The recipient can accept a pending proposal or replace it with a new date. Replacing a proposal and saving the new one happen in one transaction.

HTTP reads and writes remain authenticated. Neon Functions delivers refresh notifications over WebSocket using a short-lived ticket issued by the API. Each active isolate checks the revision of the matches of its connected users every three seconds. Clients reload the authorized history when it changes and periodically catch up over HTTP. This supports reconnects and keeps refresh notifications independent of which isolate accepted the write.

## Consequences

The same two owners can have more than one conversation if multiple pairs of their dogs match. Version 1 supports text and walk proposals. The UI can refresh on a local HTTP server without a WebSocket runtime.
