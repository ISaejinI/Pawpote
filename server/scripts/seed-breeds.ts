import 'dotenv/config'

import { readFile } from 'node:fs/promises'

import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { breeds } from '../src/db/schema'

type BreedEntry = Pick<typeof breeds.$inferInsert, 'name' | 'size'>

function isBreedEntry(entry: unknown): entry is BreedEntry {
  return !!entry && typeof entry === 'object' &&
    'name' in entry && typeof entry.name === 'string' && entry.name.length > 0 &&
    entry.name === entry.name.trim() && 'size' in entry &&
    (entry.size === 'small' || entry.size === 'medium' || entry.size === 'large')
}

async function seedBreeds() {
  const catalog: unknown = JSON.parse(await readFile(new URL('../data/breeds.json', import.meta.url), 'utf8'))
  if (!Array.isArray(catalog) || !catalog.length || !catalog.every(isBreedEntry)) {
    throw new Error('Le catalogue des races est vide ou contient des entrées invalides.')
  }

  const names = new Set(catalog.map(({ name }) => name.normalize('NFC').toLocaleLowerCase('fr')))
  if (names.size !== catalog.length) throw new Error('Le catalogue contient des noms en double.')

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL est requise dans server/.env.')

  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 15_000 })
  const db = drizzle(pool)

  try {
    const changed = await db.insert(breeds)
      .values(catalog.map(({ name, size }) => ({ name, size })))
      .onConflictDoUpdate({
        target: breeds.name,
        set: { size: sql`excluded.size` },
        setWhere: sql`${breeds.size} IS DISTINCT FROM excluded.size`,
      })
      .returning({ id: breeds.id })

    console.log(`${catalog.length} entrées dans le catalogue, ${changed.length} ajoutées ou mises à jour.`)
  } finally {
    await pool.end()
  }
}

await seedBreeds().catch((error: unknown) => {
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error
  console.error(cause instanceof Error ? cause.message : 'Échec de l’import des races.')
  process.exitCode = 1
})
