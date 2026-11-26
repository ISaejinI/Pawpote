
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { auth, webOrigins } from './auth'

const app = new Hono()

// Autoriser les requêtes depuis Expo Web
app.use(
  '/api/auth/*',
  cors({
    origin: webOrigins,
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
app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

export default app
