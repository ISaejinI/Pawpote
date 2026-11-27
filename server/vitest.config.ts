import { defineConfig } from 'vitest/config'

/**
 * Tests d'intégration de l'API (`npm test`). Chaque fichier de test a sa propre base Postgres
 * en mémoire (PGlite), créée à partir des migrations : aucune base Neon n'est touchée.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    // Migrations + hachage des mots de passe : plus lent qu'un test unitaire
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      BETTER_AUTH_SECRET: 'test-secret-for-automated-tests-only-0123456789',
      BETTER_AUTH_URL: 'http://localhost:8787',
      BETTER_AUTH_WEB_ORIGINS: '',
      DATABASE_URL: 'postgres://not-used-by-tests',
    },
  },
})
