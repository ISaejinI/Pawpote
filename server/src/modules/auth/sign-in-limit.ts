import { isIP } from 'node:net'

import { eq, sql } from 'drizzle-orm'

import { db } from '../../db'
import { signInAttempts } from '../../db/schema'

/**
 * Protections de la connexion contre les essais de mots de passe en série.
 *
 * - Par compte : au plus `SIGN_IN_MAX_ATTEMPTS` tentatives par adresse e-mail sur 15 minutes,
 *   quelle que soit l'adresse IP. Une connexion réussie remet le compteur à zéro.
 * - Par adresse IP : la limitation de Better Auth, appliquée seulement quand l'IP du client est connue
 *   avec certitude (voir `hasClientIp`).
 */
export const SIGN_IN_MAX_ATTEMPTS = 10

/** Compte une tentative de connexion pour cette adresse. Renvoie `false` au-delà de la limite. */
export async function recordSignInAttempt(email: string) {
  const expired = sql`${signInAttempts.windowStart} < now() - interval '15 minutes'`
  const [attempts] = await db.insert(signInAttempts)
    .values({ email, count: 1, windowStart: sql`now()` })
    .onConflictDoUpdate({
      target: signInAttempts.email,
      set: {
        count: sql`case when ${expired} then 1 else ${signInAttempts.count} + 1 end`,
        windowStart: sql`case when ${expired} then now() else ${signInAttempts.windowStart} end`,
      },
    })
    .returning({ count: signInAttempts.count })
  return attempts.count <= SIGN_IN_MAX_ATTEMPTS
}

export async function clearSignInAttempts(email: string) {
  await db.delete(signInAttempts).where(eq(signInAttempts.email, email))
}

/**
 * Indique si la requête porte une seule adresse IP valide dans `x-forwarded-for`.
 * Sans elle, Better Auth regrouperait tous les utilisateurs dans un même compteur et bloquerait
 * tout le monde : on préfère alors ne pas appliquer la limite par IP (celle par compte reste active).
 */
export function hasClientIp(request?: Request) {
  const forwarded = request?.headers.get('x-forwarded-for')
  const addresses = forwarded?.split(',').map((address) => address.trim()).filter(Boolean) ?? []
  return addresses.length === 1 && isIP(addresses[0]) !== 0
}
