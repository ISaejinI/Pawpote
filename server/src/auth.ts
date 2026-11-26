import { expo } from '@better-auth/expo'
import { functionBaseUrl } from '@neon/env'
import { attachDatabasePool } from '@neon/functions'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as authSchema from './db/auth-schema'

const databaseUrl = process.env.DATABASE_URL
const secret = process.env.BETTER_AUTH_SECRET

if (!databaseUrl || !secret) {
  throw new Error('DATABASE_URL and BETTER_AUTH_SECRET are required')
}

export const webOrigins = (process.env.BETTER_AUTH_WEB_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => {
    const url = URL.parse(origin)
    if (
      !url ||
      !['http:', 'https:'].includes(url.protocol) ||
      origin !== url.origin ||
      origin.includes('*')
    ) {
      throw new Error('BETTER_AUTH_WEB_ORIGINS must contain exact HTTP(S) origins without trailing slashes')
    }
    return url.origin
  })

const pool = new Pool({ connectionString: databaseUrl, max: 5 })
attachDatabasePool(pool)
const db = drizzle(pool, { schema: authSchema })

export const auth = betterAuth({
  appName: 'Pawpote',
  baseURL: process.env.BETTER_AUTH_URL?.trim() || functionBaseUrl('pawpote'),
  secret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'pawpote://',
    ...webOrigins,
    ...(process.env.BETTER_AUTH_EXPO_GO === 'true' ? ['exp://**'] : []),
  ],
  plugins: [expo()],
})
