import { expo } from '@better-auth/expo'
import { functionBaseUrl } from '@neon/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from './db'
import * as authSchema from './db/auth-schema'

const secret = process.env.BETTER_AUTH_SECRET

if (!secret) throw new Error('BETTER_AUTH_SECRET is required')

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
