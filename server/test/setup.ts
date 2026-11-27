import { vi } from 'vitest'

// Remplace la base Neon par une base Postgres en mémoire, construite avec les vraies migrations
vi.mock('../src/db', async () => {
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')
  const { migrate } = await import('drizzle-orm/pglite/migrator')
  const authSchema = await import('../src/db/auth-schema')

  const db = drizzle(new PGlite(), { schema: authSchema })
  await migrate(db, { migrationsFolder: new URL('../drizzle', import.meta.url).pathname.replace(/^\/(\w:)/, '$1') })
  return { db }
})
