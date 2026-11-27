import 'dotenv/config'

import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { user } from '../src/db/auth-schema'
import { activities, breeds, characters, dogActivities, dogCharacters, dogPhotos, dogs, profiles } from '../src/db/schema'

// Order matches the breed/photo entries in demo-photos.json.
const dogsToSeed = [
  ['Nala', 'Camille', 'female', '2022-04-18', 'Frisbee jaune', 'Sociable', 'Baignade', 'Elle repère un point d’eau avant tout le monde et attend son signal pour plonger.'],
  ['Oslo', 'Camille', 'male', '2021-10-09', 'Balle orange', 'Joueur', 'Jeu de balle', 'Il rapporte la balle mais préfère négocier une récompense avant de la rendre.'],
  ['Miso', 'Inès', 'male', '2023-01-29', 'Peluche renard', 'Indépendant', 'Balade en forêt', 'Il prend son temps pour explorer et apprécie les premières rencontres au calme.'],
  ['Neige', 'Yanis', 'female', '2020-12-12', 'Corde bleue', 'Bavard', 'Randonnée', 'Elle commente chaque départ en balade et adore les chemins frais et ombragés.'],
  ['Biscotte', 'Sarah', 'female', '2024-03-21', 'Balle à friandises', 'Gourmand', 'Balade en forêt', 'Son nez mène la promenade. Elle s’arrête pour inspecter chaque souche.'],
  ['Pickles', 'Léo', 'male', '2022-08-03', 'Doudou lapin', 'Curieux', 'Parc à chiens', 'Il fait le tour du parc tranquillement et adore suivre les chiens de sa taille.'],
  ['Jazz', 'Noémie', 'male', '2019-07-13', 'Poulet qui couine', 'Foufou', 'Jeu de balle', 'Il bondit au premier lancer, puis se pose volontiers à côté des autres chiens.'],
  ['Pixel', 'Arthur', 'female', '2023-06-11', 'Disque souple', 'Joueur', 'Agility', 'Elle connaît le slalom et aime apprendre de nouveaux tours en petits groupes.'],
  ['Poppy', 'Jade', 'female', '2022-09-02', 'Anneau de corde', 'Curieux', 'Randonnée', 'Elle préfère les sentiers variés et revient régulièrement vérifier que tout le monde suit.'],
  ['Koda', 'Malik', 'male', '2021-01-17', 'Boudin orange', 'Bavard', 'Course', 'Il trotte longtemps en harnais et discute beaucoup quand la pause se prolonge.'],
  ['Mochi', 'Zoé', 'male', '2024-11-26', 'Vieux chausson', 'Câlin', 'Parc à chiens', 'Il aime les jeux courts et s’installe volontiers à l’ombre après quelques tours.'],
  ['Plume', 'Émilie', 'female', '2025-05-07', 'Balle en feutre', 'Curieux', 'Agility', 'Elle observe d’abord les obstacles, puis se lance quand un copain montre le chemin.'],
  ['Domino', 'Sacha', 'male', '2022-02-15', 'Corde à nœuds', 'Sociable', 'Course', 'Il garde un trot régulier et préfère rencontrer de nouveaux copains en marchant.'],
  ['Gaufre', 'Romane', 'female', '2020-05-01', 'Peluche toast', 'Calme', 'Parc à chiens', 'Elle apprécie les petites sorties avec de longues pauses pour observer les autres.'],
  ['Pistache', 'Hugo', 'male', '2023-02-23', 'Renard en tissu', 'Câlin', 'Balade en forêt', 'Il marche près de son humain et adore les chiens qui prennent le temps de dire bonjour.'],
  ['Chipie', 'Hugo', 'female', '2024-06-16', 'Mini corde', 'Timide', 'Parc à chiens', 'Elle commence la balade à distance et rejoint le groupe quand elle se sent à l’aise.'],
  ['Cacao', 'Maëlle', 'male', '2021-11-09', 'Balle flottante', 'Gourmand', 'Baignade', 'Il plonge seulement quand sa balle flotte près du bord, puis attend une friandise.'],
  ['Nuage', 'Lina', 'male', '2025-08-19', 'Petit canard', 'Joueur', 'Jeu de balle', 'Il fait de petits bonds autour de la balle avant de la rapporter fièrement.'],
  ['Toast', 'Nathan', 'male', '2022-11-07', 'Os en tissu', 'Foufou', 'Parc à chiens', 'Il aime les poursuites courtes et fait souvent le premier pas vers ses compagnons.'],
  ['Pepper', 'Lou', 'female', '2023-12-16', 'Rat en peluche', 'Têtu', 'Agility', 'Elle fait les parcours dans son ordre à elle et adore chercher un jouet caché.'],
  ['Barnabé', 'Mina', 'male', '2018-10-23', 'Anneau rouge', 'Calme', 'Randonnée', 'Il choisit les chemins larges, marche à son rythme et adore les pauses.'],
  ['Suki', 'Nora', 'female', '2020-09-08', 'Corde verte', 'Indépendant', 'Balade en forêt', 'Elle apprécie les promenades parallèles et préfère que les autres chiens l’approchent doucement.'],
  ['Comète', 'Eliott', 'female', '2025-12-12', 'Lévrier en tissu', 'Joueur', 'Course', 'Elle fait deux petites accélérations, puis cherche un endroit douillet pour récupérer.'],
  ['Truffe', 'Manon', 'male', '2021-05-22', 'Pomme en caoutchouc', 'Curieux', 'Plage', 'Il fouille le sable à marée basse et revient avec les pattes pleines de sable.'],
] as const

const quirks: Record<typeof dogsToSeed[number][0], string> = {
  Nala: 'Fait deux tours sur elle-même avant de sauter dans l’eau.',
  Oslo: 'Dépose sa balle à un mètre de toi et attend que tu viennes la chercher.',
  Miso: 'Choisit toujours la branche la plus fine du chemin.',
  Neige: 'Chante quand elle voit sortir le harnais.',
  Biscotte: 'Devine qui a des friandises rien qu’au bruit des poches.',
  Pickles: 'Se cache derrière son lapin en peluche quand on sort le manteau de pluie.',
  Jazz: 'Renifle sa balle avant chaque lancer, comme pour vérifier que c’est la bonne.',
  Pixel: 'S’assoit au bout du slalom pour attendre les applaudissements.',
  Poppy: 'Attend chaque retardataire au prochain croisement.',
  Koda: 'Se couche dans la flaque la plus proche dès qu’on fait une pause.',
  Mochi: 'Emporte son chausson du panier jusqu’à la porte avant chaque balade.',
  Plume: 'Penche la tête à gauche à chaque nouveau mot.',
  Domino: 'Fait quelques pas en arrière pour inviter les autres chiens à jouer.',
  Gaufre: 'A un banc préféré dans chaque parc.',
  Pistache: 'Vient poser son museau sur le genou quand la balade se termine.',
  Chipie: 'Se fait discrète au début puis propose toujours le dernier jeu.',
  Cacao: 'Ressort de l’eau uniquement par la pente qu’il a choisie.',
  Nuage: 'Saute à pieds joints devant chaque feuille qui bouge.',
  Toast: 'Court en petits cercles quand il entend son nom.',
  Pepper: 'Range ses peluches une par une sous le canapé.',
  Barnabé: 'Fait sa pause dès qu’il trouve un bout de chemin au soleil.',
  Suki: 'S’arrête devant les vitrines pour regarder son reflet.',
  Comète: 'Met toujours une patte sur son jouet quand elle s’endort.',
  Truffe: 'Enterre les coquillages qu’il trouve sur le sable.',
}

type DemoPhoto = { breed: string; url: string }

export async function seedDiscovery(db: Pick<NodePgDatabase, 'transaction'>) {
  const photos: DemoPhoto[] = JSON.parse(await readFile(new URL('../data/demo-photos.json', import.meta.url), 'utf8'))
  const catalog: (Pick<typeof breeds.$inferInsert, 'name' | 'size'>)[] =
    JSON.parse(await readFile(new URL('../data/breeds.json', import.meta.url), 'utf8'))
  const selected = photos.map(({ breed }) => catalog.find(({ name }) => name === breed))
  if (photos.length !== dogsToSeed.length || selected.some((breed) => !breed)) {
    throw new Error('Une photo de démo ne correspond pas à une race du catalogue.')
  }

  const owners = [...new Set(dogsToSeed.map((dog) => dog[1]))]
  const ownerId = (name: typeof owners[number]) => `pawpote-demo-owner-${owners.indexOf(name) + 1}`

  await db.transaction(async (tx) => {
    await tx.insert(user).values(owners.map((name) => ({
      id: ownerId(name), name, email: `${ownerId(name)}@example.invalid`,
    }))).onConflictDoNothing()
    await tx.insert(profiles).values(owners.map((firstName) => ({
      userId: ownerId(firstName), firstName,
    }))).onConflictDoNothing()

    const traits = [...new Set(dogsToSeed.map((dog) => dog[5]))]
    const hobbies = [...new Set(dogsToSeed.map((dog) => dog[6]))]
    await tx.insert(breeds).values(selected.filter((breed) => breed !== undefined)).onConflictDoNothing()
    await tx.insert(characters).values(traits.map((name) => ({ name }))).onConflictDoNothing()
    await tx.insert(activities).values(hobbies.map((name) => ({ name }))).onConflictDoNothing()
    const breedRows = await tx.select().from(breeds)
      .where(inArray(breeds.name, photos.map(({ breed }) => breed)))
    const traitRows = await tx.select().from(characters).where(inArray(characters.name, traits))
    const hobbyRows = await tx.select().from(activities).where(inArray(activities.name, hobbies))

    for (const [i, [name, owner, sex, birthDate, favoriteToy, trait, hobby, description]] of dogsToSeed.entries()) {
      const { breed, url } = photos[i]
      const suffix = String(i + 1).padStart(12, '0')
      const id = `6ca71b00-7e1d-4000-a000-${suffix}`
      const ownerKey = ownerId(owner)
      await tx.insert(dogs).values({
        id, ownerId: ownerKey, name, sex, birthDate, favoriteToy, description, quirk: quirks[name],
        breedId: breedRows.find((row) => row.name === breed)!.id,
      }).onConflictDoUpdate({
        target: dogs.id,
        set: { quirk: sql`excluded.quirk` },
        setWhere: and(eq(dogs.ownerId, ownerKey), isNull(dogs.quirk)),
      })
      await tx.insert(dogPhotos).values({
        id: `6ca71b00-7e1d-4000-b000-${suffix}`, dogId: id, storageKey: url,
      }).onConflictDoNothing()
      await tx.insert(dogCharacters).values({
        dogId: id, characterId: traitRows.find((row) => row.name === trait)!.id,
      }).onConflictDoNothing()
      await tx.insert(dogActivities).values({
        dogId: id, activityId: hobbyRows.find((row) => row.name === hobby)!.id,
      }).onConflictDoNothing()
    }
  })
  console.log(`${dogsToSeed.length} chiens et ${owners.length} propriétaires de démo disponibles.`)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const connectionString = process.env.DATABASE_URL
  const expectedHost = process.env.PAWPOTE_DEMO_DB_HOST
  if (!connectionString || !expectedHost || new URL(connectionString).hostname !== expectedHost) {
    throw new Error('Vérifie DATABASE_URL et PAWPOTE_DEMO_DB_HOST. Utilise uniquement la base de démonstration.')
  }
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 15_000 })
  try {
    await seedDiscovery(drizzle(pool))
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Échec de l’import du jeu de données.')
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}
