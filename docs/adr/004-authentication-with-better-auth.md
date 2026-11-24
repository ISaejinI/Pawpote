
# ADR 004: Authentication with Better Auth

## Status

Accepted

## Context

Pawpote requires user authentication to protect personal
profiles, dog information, and future interactions.

Users must be able to create an account, sign in, sign out,
and remain authenticated between application launches.

The authentication system must work with the existing
architecture:

- React Native and Expo Router for the client.
- Hono on Cloudflare Workers for the API.
- Neon PostgreSQL and Drizzle ORM for persistence.

## Decision

We will use Better Auth for user authentication and
session management.

### Backend

Better Auth is integrated into the Hono API through
the `/api/auth/*` endpoints.

The Drizzle adapter connects Better Auth to Neon
PostgreSQL using the authentication tables defined
in `auth-schema.ts`.

Credentials and authentication secrets are managed
through Cloudflare environment bindings.

Email and password authentication is enabled.

### Mobile client

The Expo application uses `@better-auth/expo` and
the Better Auth client.

Session data is securely persisted on native devices
using Expo SecureStore.

The API URL is configured through the
`EXPO_PUBLIC_API_URL` environment variable.

### Navigation

Expo Router protected routes restrict access based
on the authentication session.

Unauthenticated users can access sign-in and sign-up
screens.

Authenticated users can access the application's
main tabs.

### Security

- Passwords are managed and hashed by Better Auth.
- Authentication secrets remain on the server.
- CORS and trusted origins restrict browser access.
- Sessions can be invalidated through sign-out.
- Production API connections will use HTTPS.

## Consequences

### Positive

- Centralized authentication and session management.
- Persistent sessions on native devices.
- Protected application navigation.
- Reuse of existing PostgreSQL infrastructure.
- Possibility of adding social authentication later.

### Negative

- Authentication depends on the availability of the API.
- Native and web clients require different session storage.
- OAuth providers require additional configuration.
- Local development requires careful origin and URL settings.

## Testing

The following scenarios were tested:

- User registration through the API.
- Email and password sign-in.
- Session retrieval.
- Sign-out and session invalidation.
- Authentication through the Expo application.
- Protected navigation.
- Session persistence across application launches.
- TypeScript validation.

## Future Work

- Google and Apple authentication.
- Email verification and password recovery.
- User and dog profile onboarding.
- Production deployment configuration.
