# ADR 006 — Migrate backend hosting to Neon Functions

**Status:** Proposed

**Date:** 2026-11-25

## Context

Pawpote runs a Hono API on Cloudflare Workers and stores application and Better Auth data in Neon Postgres. Hosting the API next to its database gives each environment a function and a database connection scoped to the same Neon branch. The migration should preserve accounts and the existing Expo authentication flow.

## Decision

Deploy Pawpote's Hono API as the `pawpote` Neon Function. Hono already exports a Fetch handler that Neon can invoke directly. The function declaration lives in `server/neon.ts`.

Use Neon's injected, pooled `DATABASE_URL` and a module-level `pg` pool with `attachDatabasePool`, following Neon’s guidance for its long-lived Node.js runtime. Drizzle uses the Node Postgres adapter. Drizzle Kit can use the direct connection for migrations.

Keep Pawpote's self-hosted Better Auth instance, the Expo plugin, and the existing tables and migrations. Keep the same signing secret per environment. Better Auth uses the function's canonical HTTPS URL unless a custom base URL is configured. Web CORS and Better Auth share a list of exact web origins. Expo builds continue to use the `pawpote://` scheme. Expo Go support is enabled explicitly in development.

Object storage and messaging are outside the scope of this decision.

## Consequences

- The API and its PostgreSQL connection follow the chosen Neon branch. The credentials and branch must be verified before enabling traffic.
- Keep the shared `development` branch without automatic expiration so its data and function URL remain available. Use branch expiration for temporary test and preview branches.
- The function requires a supported Neon region and is subject to runtime and usage limits.
- Each deployment carries its own auth configuration. A change of API host can require users to sign in again because cookies are scoped to the host.
- Local development uses `neon dev` on loopback. The Hono Node adapter serves the same handler over the LAN for device testing.
- Deploy to `development` and verify account creation, sign-in, session, sign-out and Expo navigation before scheduling the production cutover. Use the recorded invocation URL as Expo's `EXPO_PUBLIC_API_URL`.

## References

- [Neon Functions quickstart and database pool guidance](https://neon.com/docs/compute/functions/get-started)
- [Neon Functions environment variables](https://neon.com/docs/compute/functions/environment-variables)
- [Better Auth Expo integration](https://better-auth.com/docs/integrations/expo)
