import { sql } from 'drizzle-orm'
import {
    boolean,
    check,
    date,
    doublePrecision,
    index,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'

// ==========================================
// RÉFÉRENTIELS
// ==========================================

// Races de chiens
export const breeds = pgTable(
  'breeds',
  {
    id: integer('id')
      .primaryKey()
      .generatedAlwaysAsIdentity(),

    name: text('name').notNull().unique(),

    size: text('size', {
      enum: ['small', 'medium', 'large'],
    }).notNull(),
  },
  (table) => [
    check(
      'breeds_valid_size',
      sql`${table.size} IN ('small', 'medium', 'large')`,
    ),
  ],
)

// Activités proposées
export const activities = pgTable('activities', {
  id: integer('id')
    .primaryKey()
    .generatedAlwaysAsIdentity(),

  name: text('name').notNull().unique(),
})

// Traits de caractère
export const characters = pgTable('characters', {
  id: integer('id')
    .primaryKey()
    .generatedAlwaysAsIdentity(),

  name: text('name').notNull().unique(),
})

// ==========================================
// PROFILS
// ==========================================

// Profils des propriétaires
export const profiles = pgTable(
  'profiles',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, {
        onDelete: 'cascade',
      }),

    firstName: text('first_name').notNull(),

    // Nom de famille du propriétaire
    lastName: text('last_name'),

    birthDate: date('birth_date'),

    // Adresse du propriétaire
    address: text('address'),
    postalCode: text('postal_code'),
    city: text('city'),

    // Localisation géographique
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    homeLatitude: doublePrecision('home_latitude'),
    homeLongitude: doublePrecision('home_longitude'),

    avatarKey: text('avatar_key'),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    check(
      'profiles_valid_latitude',
      sql`${table.latitude} BETWEEN -90 AND 90`,
    ),

    check(
      'profiles_valid_longitude',
      sql`${table.longitude} BETWEEN -180 AND 180`,
    ),

    check(
      'profiles_coordinates_together',
      sql`(${table.latitude} IS NULL AND ${table.longitude} IS NULL)
          OR (${table.latitude} IS NOT NULL AND ${table.longitude} IS NOT NULL)`,
    ),
    check(
      'profiles_valid_home_coordinates',
      sql`(${table.homeLatitude} IS NULL AND ${table.homeLongitude} IS NULL)
          OR (${table.homeLatitude} IS NOT NULL AND ${table.homeLongitude} IS NOT NULL
              AND ${table.homeLatitude} BETWEEN -90 AND 90 AND ${table.homeLongitude} BETWEEN -180 AND 180)`,
    ),
  ],
)

// Profils des chiens
export const dogs = pgTable(
  'dogs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    ownerId: text('owner_id')
      .notNull()
      .references(() => profiles.userId, {
        onDelete: 'cascade',
      }),

    breedId: integer('breed_id')
      .references(() => breeds.id, {
        onDelete: 'set null',
      }),

    name: text('name').notNull(),

    birthDate: date('birth_date'),

    sex: text('sex', {
      enum: ['male', 'female'],
    }),

    description: text('description'),
    quirk: text('quirk'),

    // Jouet préféré du chien (32 caractères maximum)
    favoriteToy: text('favorite_toy'),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index('dogs_owner_id_idx').on(table.ownerId),

    index('dogs_breed_id_idx').on(table.breedId),

    check(
      'dogs_valid_sex',
      sql`${table.sex} IN ('male', 'female')`,
    ),

    check(
      'dogs_favorite_toy_max_length',
      sql`char_length(${table.favoriteToy}) <= 32`,
    ),
  ],
)

// Photos des chiens
export const dogPhotos = pgTable(
  'dog_photos',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    dogId: uuid('dog_id')
      .notNull()
      .references(() => dogs.id, {
        onDelete: 'cascade',
      }),

    storageKey: text('storage_key').notNull(),

    position: integer('position')
      .notNull()
      .default(0),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    index('dog_photos_dog_id_idx').on(
      table.dogId,
      table.position,
    ),

    check(
      'dog_photos_valid_position',
      sql`${table.position} >= 0`,
    ),
  ],
)

// ==========================================
// ASSOCIATIONS DES CHIENS
// ==========================================

// Association entre les chiens et leurs activités
export const dogActivities = pgTable(
  'dog_activities',
  {
    dogId: uuid('dog_id')
      .notNull()
      .references(() => dogs.id, {
        onDelete: 'cascade',
      }),

    activityId: integer('activity_id')
      .notNull()
      .references(() => activities.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.dogId, table.activityId],
    }),

    index('dog_activities_activity_id_idx').on(
      table.activityId,
    ),
  ],
)

// Association entre les chiens et leurs traits de caractère
export const dogCharacters = pgTable(
  'dog_characters',
  {
    dogId: uuid('dog_id')
      .notNull()
      .references(() => dogs.id, {
        onDelete: 'cascade',
      }),

    characterId: integer('character_id')
      .notNull()
      .references(() => characters.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.dogId, table.characterId],
    }),

    index('dog_characters_character_id_idx').on(
      table.characterId,
    ),
  ],
)

// ==========================================
// RENCONTRES
// ==========================================

// Choix d'un compte sur un chien
export const swipes = pgTable(
  'swipes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Origine des anciens swipes, conservée pour l'historique.
    swiperDogId: uuid('swiper_dog_id')
      .references(() => dogs.id, {
        onDelete: 'cascade',
      }),

    swiperUserId: text('swiper_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    targetDogId: uuid('target_dog_id')
      .notNull()
      .references(() => dogs.id, {
        onDelete: 'cascade',
      }),

    action: text('action', {
      enum: ['like', 'dislike'],
    }).notNull(),

    reviewed: boolean('reviewed').default(true).notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('swipes_dog_pair_idx').on(
      table.swiperDogId,
      table.targetDogId,
    ),
    uniqueIndex('swipes_user_target_reviewed_idx')
      .on(table.swiperUserId, table.targetDogId)
      .where(sql`${table.reviewed}`),

    index('swipes_target_dog_id_idx').on(
      table.targetDogId,
    ),

    check(
      'swipes_different_dogs',
      sql`${table.swiperDogId} <> ${table.targetDogId}`,
    ),

    check(
      'swipes_valid_action',
      sql`${table.action} IN ('like', 'dislike')`,
    ),
  ],
)

// Matchs entre les chiens après des likes réciproques
export const matches = pgTable(
  'matches',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    dog1Id: uuid('dog_1_id')
      .notNull()
      .references(() => dogs.id, {
        onDelete: 'cascade',
      }),

    dog2Id: uuid('dog_2_id')
      .notNull()
      .references(() => dogs.id, {
        onDelete: 'cascade',
      }),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('matches_dog_pair_idx').on(
      table.dog1Id,
      table.dog2Id,
    ),

    index('matches_dog_2_id_idx').on(
      table.dog2Id,
    ),

    check(
      'matches_ordered_dogs',
      sql`${table.dog1Id} < ${table.dog2Id}`,
    ),
  ],
)
