import { randomUUID } from 'node:crypto'

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/** Bucket déclaré dans `neon.ts`, en lecture publique. */
export const PHOTO_BUCKET = 'photos'

/** Durée de validité d'une URL d'envoi (secondes). */
const UPLOAD_URL_TTL = 5 * 60

export const PHOTO_MAX_BYTES = 10 * 1024 * 1024

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
} as const

export type PhotoContentType = keyof typeof EXTENSIONS

export function isPhotoContentType(value: unknown): value is PhotoContentType {
  return typeof value === 'string' && Object.hasOwn(EXTENSIONS, value)
}

/**
 * Client S3 du stockage Neon. Les variables `AWS_*` sont injectées dans la fonction déployée
 * dès qu'un bucket existe sur la branche ; en local, `neon env pull` les écrit dans le `.env`.
 */
let client: S3Client | undefined

function storage() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3
  if (!endpoint || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Neon object storage is not configured (AWS_* variables missing)')
  }
  client ??= new S3Client({
    region: process.env.AWS_REGION,
    endpoint,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    // Le stockage Neon n'accepte que l'adressage par chemin
    forcePathStyle: true,
  })
  return client
}

/** Les photos d'un utilisateur sont rangées sous `users/<id>/`. */
function userPrefix(userId: string) {
  return `users/${encodeURIComponent(userId)}/`
}

/** Vérifie qu'une clé désigne bien une photo envoyée par cet utilisateur. */
export function isOwnPhotoKey(userId: string, key: unknown): key is string {
  if (typeof key !== 'string' || !key.startsWith(userPrefix(userId))) return false
  return /^[0-9a-f-]{36}\.(?:jpg|png|webp|heic)$/.test(key.slice(userPrefix(userId).length))
}

/**
 * Prépare l'envoi d'une photo : l'app l'envoie ensuite directement au stockage avec une requête PUT,
 * sans passer par l'API. Le type et la taille sont signés : le stockage refuse tout autre fichier.
 */
export async function createPhotoUpload(userId: string, contentType: PhotoContentType, size: number) {
  const key = `${userPrefix(userId)}${randomUUID()}.${EXTENSIONS[contentType]}`
  const uploadUrl = await getSignedUrl(
    storage(),
    new PutObjectCommand({
      Bucket: PHOTO_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
    { expiresIn: UPLOAD_URL_TTL },
  )
  return { key, uploadUrl }
}

/** Indique si la photo a bien été envoyée au stockage. */
export async function photoExists(key: string) {
  try {
    await storage().send(new HeadObjectCommand({ Bucket: PHOTO_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

/** URL publique d'une photo (bucket en `public_read`), enregistrée en base. */
export function photoUrl(key: string) {
  storage()
  return `${process.env.AWS_ENDPOINT_URL_S3!.replace(/\/+$/, '')}/${PHOTO_BUCKET}/${key}`
}

/** Garde seulement les URL publiques (les anciennes clés de stockage ne s'affichent pas). */
export function publicPhotoUrl(value: string | null) {
  return value?.startsWith('https://') ? value : null
}

/** Supprime toutes les photos envoyées par un utilisateur (suppression de son compte). */
export async function deleteUserPhotos(userId: string) {
  const client = storage()
  let continuationToken: string | undefined

  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: PHOTO_BUCKET,
        Prefix: userPrefix(userId),
        ContinuationToken: continuationToken,
      }),
    )
    for (const object of page.Contents ?? []) {
      if (object.Key) await client.send(new DeleteObjectCommand({ Bucket: PHOTO_BUCKET, Key: object.Key }))
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (continuationToken)
}
