
import { expo } from '@better-auth/expo'
import { neon } from '@neondatabase/serverless'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/neon-http'

import * as authSchema from './db/auth-schema'

// Variables nécessaires au fonctionnement de l'API
export type AuthEnv = {
    DATABASE_URL: string
    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string
}

// Configuration de Better Auth
export const createAuth = (env: AuthEnv) => {
    // Connexion à Neon PostgreSQL
    const sql = neon(env.DATABASE_URL)

    // Initialisation de Drizzle
    const db = drizzle(sql, {
        schema: authSchema,
    })

    return betterAuth({
        appName: 'Pawpote',

        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,

        database: drizzleAdapter(db, {
            provider: 'pg',
            schema: authSchema,
        }),

        emailAndPassword: {
            enabled: true,
        },

        trustedOrigins: [
            'pawpote://',
            ...(
                env.BETTER_AUTH_URL.includes('localhost')
                    ? [
                        'http://localhost:8081',
                        'http://localhost:8082',
                        'http://127.0.0.1:8081',
                        'http://127.0.0.1:8082',
                        'http://192.168.1.20:8081',
                        'http://192.168.1.20:8082',
                        'exp://**',
                    ]
                    : []
            ),
        ],

        plugins: [
            expo(),
        ],
    })
}
