
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { createAuth, type AuthEnv } from './auth'

const app = new Hono<{
  Bindings: AuthEnv
}>()

// Origines autorisées pour le développement local
const developmentOrigins = [
  'http://localhost:8081',
  'http://localhost:8082',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8082',
  'http://192.168.1.20:8081',
  'http://192.168.1.20:8082',
]

// Autoriser les requêtes depuis Expo Web
app.use(
  '/api/auth/*',
  cors({
    origin: developmentOrigins,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  }),
)

// Vérification de l'API
app.get('/', (c) => {
  return c.json({
    name: 'Pawpote API',
    status: 'ok',
  })
})

// Routes Better Auth
app.on(['GET', 'POST'], '/api/auth/*', (c) => {
  const auth = createAuth(c.env)

  return auth.handler(c.req.raw)
})

export default app
