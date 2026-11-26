import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'

import { auth, webOrigins } from './auth'

export type SessionVariables = { userId: string; userName: string }

const apiOrigin = typeof auth.options.baseURL === 'string'
  ? new URL(auth.options.baseURL).origin : undefined

/** CORS pour Expo Web, avec les cookies de session. */
export const sessionCors = cors({
  origin: webOrigins,
  credentials: true,
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
})

/**
 * Réserve les routes aux utilisateurs connectés et expose `userId` / `userName`.
 * Les POST doivent venir d'une origine connue et porter du JSON.
 */
export const requireSession = createMiddleware<{ Variables: SessionVariables }>(async (c, next) => {
  c.header('Cache-Control', 'private, no-store')
  if (c.req.method === 'POST') {
    const origin = c.req.header('Origin')
    if (origin && origin !== apiOrigin && !webOrigins.includes(origin)) {
      return c.json({ error: 'Origine non autorisée.' }, 403)
    }
    if (c.req.header('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return c.json({ error: 'Un contenu JSON est requis.' }, 415)
    }
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Connexion requise.' }, 401)
  c.set('userId', session.user.id)
  c.set('userName', session.user.name)
  await next()
})
