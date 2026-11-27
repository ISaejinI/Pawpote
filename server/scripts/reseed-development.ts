import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { hashPassword } from 'better-auth/crypto'
import { eq, inArray, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { account, user } from '../src/db/auth-schema'
import { breeds, dogPhotos, dogs, matches, messages, profiles, swipes } from '../src/db/schema'
import { seedBreeds } from './seed-breeds'
import { seedDiscovery } from './seed-discovery'

const connectionString = process.env.PAWPOTE_RESEED_DATABASE_URL
const expectedHost = process.env.PAWPOTE_DEMO_DB_HOST
const password = process.env.PAWPOTE_DEMO_PASSWORD
if (process.argv[2] !== '--reset-development' || !connectionString || !expectedHost ||
  new URL(connectionString).hostname !== expectedHost || !password || password.length < 8) {
  throw new Error('Confirme --reset-development et renseigne la connexion, le nom d’hôte et le mot de passe de démo.')
}

const fixtures = [
  { id: 'pawpote-demo-alice', email: 'alice@example.test', name: 'Alice', dog: 'Vasco',
    breed: 'Golden Retriever', sex: 'male', latitude: 44.85, longitude: -0.59,
    avatarKey: 'https://api.dicebear.com/9.x/thumbs/png?seed=PawpoteAlice' },
  { id: 'pawpote-demo-nora', email: 'nora@example.test', name: 'Nora', dog: 'Nala',
    breed: 'Shiba Inu', sex: 'female', homeLatitude: 44.85, homeLongitude: -0.58 },
] as const
const photos: { breed: string; url: string }[] = JSON.parse(
  await readFile(new URL('../data/demo-photos.json', import.meta.url), 'utf8'),
)
const passwords = await Promise.all(fixtures.map(() => hashPassword(password)))
const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 15_000 })
const db = drizzle(pool)

try {
  await db.transaction(async (tx) => {
    await tx.execute(sql`set local lock_timeout = '8s'`)
    await tx.execute(sql`truncate table public.messages, public.matches, public.swipes, public.dog_characters,
      public.dog_activities, public.dog_photos, public.dogs, public.profiles, public.breeds,
      public.activities, public.characters, public.session, public.account, public.verification,
      public.sign_in_attempts, public.rate_limit, public."user"`)

    await seedBreeds(tx)
    await seedDiscovery(tx)

    const breedRows = await tx.select().from(breeds).where(inArray(breeds.name, fixtures.map((fixture) => fixture.breed)))
    const dogIds: string[] = []
    for (const [index, fixture] of fixtures.entries()) {
      const { id, email, name, dog, breed, sex, ...locationAndAvatar } = fixture
      const breedRow = breedRows.find((row) => row.name === breed)
      const photo = photos.find((entry) => entry.breed === breed)
      if (!breedRow || !photo) throw new Error(`Race ou photo manquante pour ${dog}.`)

      await tx.insert(user).values({ id, email, name })
      await tx.insert(account).values({ id: randomUUID(), accountId: id, userId: id,
        providerId: 'credential', password: passwords[index], updatedAt: new Date() })
      await tx.insert(profiles).values({ userId: id, firstName: name, lastName: 'Démo', birthDate: '1995-05-14',
        address: 'Adresse de démonstration', city: 'Bordeaux', postalCode: '33000', ...locationAndAvatar })
      const [createdDog] = await tx.insert(dogs).values({
        name: dog, ownerId: id, breedId: breedRow.id, sex, birthDate: '2022-04-18',
        favoriteToy: 'Balle orange', quirk: 'Ramasse les feuilles mortes.',
        description: 'Toujours partant pour une promenade au parc.',
      }).returning({ id: dogs.id })
      dogIds.push(createdDog.id)
      await tx.insert(dogPhotos).values({ dogId: createdDog.id, storageKey: photo.url })
    }

    // Quelques chiens de démo proches ou loin de Bordeaux, les autres sans coordonnées.
    await tx.update(profiles).set({ homeLatitude: 44.855, homeLongitude: -0.59 })
      .where(eq(profiles.userId, 'pawpote-demo-owner-1'))
    await tx.update(profiles).set({ homeLatitude: 48.855, homeLongitude: 2.35 })
      .where(eq(profiles.userId, 'pawpote-demo-owner-2'))

    const [aliceDog, noraDog] = dogIds
    const [alice, nora] = fixtures
    await tx.insert(swipes).values([
      { swiperUserId: alice.id, targetDogId: noraDog, action: 'like' },
      { swiperUserId: nora.id, targetDogId: aliceDog, action: 'like' },
    ])
    const [dog1Id, dog2Id] = [...dogIds].sort()
    const [{ id: matchId }] = await tx.insert(matches).values({ dog1Id, dog2Id, chatRevision: 4 })
      .returning({ id: matches.id })

    const now = Date.now()
    const inDays = (days: number) => new Date(now + days * 86_400_000)
    await tx.insert(messages).values([
      { matchId, authorId: alice.id, body: 'Salut Nora ! On fait découvrir le parc à Vasco et Nala ?',
        createdAt: new Date(now - 180_000) },
      { matchId, authorId: nora.id, body: 'Avec plaisir ! Retrouvons-nous à l’entrée.',
        createdAt: new Date(now - 120_000) },
      { matchId, authorId: nora.id, body: 'Parc Bordelais, entrée principale',
        walkStartsAt: inDays(7), walkMinutes: 45, walkStatus: 'accepted', createdAt: new Date(now - 60_000) },
      { matchId, authorId: alice.id, body: 'Jardin public, entrée côté cours de Verdun',
        walkStartsAt: inDays(10), walkMinutes: 60, walkStatus: 'pending', createdAt: new Date(now) },
    ])
  })
  console.log('Réinitialisation validée : 26 chiens, 24 propriétaires, 2 comptes connectables et 1 conversation.')
} finally {
  await pool.end()
}
