import { expo } from '@better-auth/expo'
import { functionBaseUrl } from '@neon/env'
import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from './db'
import * as authSchema from './db/auth-schema'
import { profiles } from './db/schema'
import { clearSignInAttempts, hasClientIp, recordSignInAttempt } from './sign-in-limit'
import { deleteUserPhotos } from './storage'

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

/** Adresse e-mail d'une tentative de connexion, normalisée comme le fait Better Auth. */
function signInEmail(ctx: { path?: string; body?: unknown }) {
  if (ctx.path !== '/sign-in/email') return null
  const email = (ctx.body as { email?: unknown } | undefined)?.email
  return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null
}

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
  // Limite le nombre de requêtes par adresse IP, avec des compteurs partagés en base : en mémoire,
  // chaque instance de la fonction aurait les siens. Plus strict sur la connexion et l'inscription
  // (3 essais toutes les 10 s). Voir aussi la limite par compte dans `hooks`.
  rateLimit: {
    enabled: true,
    storage: 'database',
    customRules: {
      '/**': (request, rule) => (hasClientIp(request) ? rule : false),
    },
  },
  user: {
    // Changement d'adresse depuis le profil. L'app n'envoie pas encore d'e-mail de confirmation :
    // l'adresse, jamais vérifiée, est remplacée directement.
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    // Suppression du compte depuis le profil. Le profil, les chiens, les matchs et les messages
    // partent en cascade avec l'utilisateur ; ses photos sont retirées du stockage ensuite.
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        try {
          await deleteUserPhotos(user.id)
        } catch (error) {
          // Le compte est déjà supprimé : des photos orphelines ne doivent pas faire échouer la demande
          console.error('Photo cleanup after account deletion failed:', error)
        }
      },
    },
  },
  hooks: {
    // Sans mot de passe, Better Auth accepte la suppression depuis une session récente :
    // on l'exige toujours, un téléphone déverrouillé ne doit pas suffire à supprimer le compte.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/delete-user') {
        const password = (ctx.body as { password?: unknown } | undefined)?.password
        if (typeof password !== 'string' || !password) {
          throw new APIError('BAD_REQUEST', { message: 'Password is required', code: 'PASSWORD_REQUIRED' })
        }
      }

      // Limite par compte : bloque les essais de mots de passe en série, même depuis plusieurs IP
      const email = signInEmail(ctx)
      if (email && !(await recordSignInAttempt(email))) {
        throw new APIError('TOO_MANY_REQUESTS', {
          message: 'Too many sign-in attempts',
          code: 'TOO_MANY_SIGN_IN_ATTEMPTS',
        })
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const email = signInEmail(ctx)
      if (email && ctx.context.newSession) await clearSignInAttempts(email)
    }),
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
