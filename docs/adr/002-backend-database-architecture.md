# ADR-002: Backend and Database Architecture

**Status:** Accepted  
**Date:** 2026-11-24

## Decision

We have decided to use **Hono with Cloudflare Workers** for our backend API, **Neon (PostgreSQL)** for our database, **Drizzle ORM** for database operations and migrations, and **Better Auth** for user authentication.

## Background

Pawpote requires a backend to manage users, dog profiles, likes, matches, and future messaging features.

We need a solution that is secure, scalable, easy to maintain, and compatible with our React Native application.

We also want to manage database changes through version-controlled migrations.

## Considerations

We evaluated several approaches:

- **Supabase:** Provides a complete backend solution with authentication and PostgreSQL, but offers less flexibility for our chosen custom backend architecture.
- **Firebase:** Provides authentication and database services, but its NoSQL database is less suited to our relational data model.
- **Neon + Drizzle:** Offers a PostgreSQL database with a type-safe ORM and version-controlled SQL migrations.
- **Hono + Cloudflare Workers:** Provides a lightweight API framework with serverless deployment and a free tier.

We chose **Neon, Drizzle, and Hono** for their flexibility, TypeScript integration, and clear separation between the mobile application, API, and database.

**Better Auth** was selected to manage authentication and user sessions.

## Consequences

- The mobile application communicates with the database through a secure API.
- PostgreSQL supports relationships between users, dogs, likes, and matches.
- Drizzle allows us to define database schemas in TypeScript and generate SQL migrations.
- Database changes can be tracked through Git.
- Cloudflare Workers provides serverless hosting for our API.
- Authentication and API security must be configured and maintained by the development team.
- Maintaining a separate backend adds complexity compared to an all-in-one solution.

## Ownership

The development team is responsible for maintaining the backend, database schema, migrations, authentication, and API security.

## Review

This decision will be revisited if scalability, hosting limitations, costs, or new technical requirements significantly affect the application architecture.