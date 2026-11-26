import { attachDatabasePool } from '@neon/functions'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as authSchema from './auth-schema'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const pool = new Pool({ connectionString: databaseUrl, max: 5 })
attachDatabasePool(pool)

export const db = drizzle(pool, { schema: authSchema })
