import { Hono } from 'hono'

import { requireSession, sessionCors, type SessionVariables } from '../auth/session'
import { createPhotoUpload, isPhotoContentType, PHOTO_MAX_BYTES } from '../../lib/storage'

const uploads = new Hono<{ Variables: SessionVariables }>()

uploads.use('*', sessionCors)
uploads.use('*', requireSession)

/**
 * Donne une URL d'envoi signée pour une photo. L'app envoie ensuite le fichier directement
 * au stockage Neon, puis transmet la clé reçue à l'enregistrement de l'onboarding.
 */
uploads.post('/photos', async (c) => {
  const input: { contentType?: unknown; size?: unknown } | null = await c.req.json().catch(() => null)
  const size = input?.size

  if (!isPhotoContentType(input?.contentType)) {
    return c.json({ error: 'Format de photo non pris en charge.' }, 400)
  }
  if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0 || size > PHOTO_MAX_BYTES) {
    return c.json({ error: 'Photo trop lourde (10 Mo maximum).' }, 400)
  }

  return c.json(await createPhotoUpload(c.get('userId'), input.contentType, size), 201)
})

export { uploads }
