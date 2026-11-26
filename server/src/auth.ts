import { expo } from '@better-auth/expo'
import { functionBaseUrl } from '@neon/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from './db'
import * as authSchema from './db/auth-schema'
import { profiles } from './db/schema'

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

/** Longueur maximale acceptée pour un prénom ou un nom. */
const MAX_NAME_LENGTH = 50

/** Lit un champ texte facultatif du corps de l'inscription, nettoyé et borné. */
function readName(body: unknown, key: 'firstName' | 'lastName') {
  if (!body || typeof body !== 'object') return undefined
  const value = (body as Record<string, unknown>)[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().slice(0, MAX_NAME_LENGTH)
  return trimmed || undefined
}

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
  user: {
    // Changement d'adresse depuis le profil. L'app n'envoie pas encore d'e-mail de confirmation :
    // l'adresse, jamais vérifiée, est remplacée directement.
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Crée le profil du propriétaire avec le prénom et le nom saisis à l'inscription.
        // Better Auth lance ce hook une fois l'utilisateur enregistré : la clé étrangère est valide.
        after: async (user, context) => {
          const firstName =
            readName(context?.body, 'firstName') ?? (user.name.trim().split(/\s+/)[0] || user.name)
          const lastName = readName(context?.body, 'lastName') ?? null

          await db
            .insert(profiles)
            .values({ userId: user.id, firstName, lastName })
            .onConflictDoNothing()
        },
      },
    },
  },
  trustedOrigins: [
    'pawpote://',
    ...webOrigins,
    ...(process.env.BETTER_AUTH_EXPO_GO === 'true' ? ['exp://**'] : []),
  ],
  plugins: [expo()],
})
