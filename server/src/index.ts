
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { auth, webOrigins } from './modules/auth/auth'
import { breeds } from './modules/breeds/routes'
import { discovery } from './modules/discovery/routes'
import { messagingLive } from './modules/messaging/live'
import { messaging } from './modules/messaging/routes'
import { onboarding } from './modules/onboarding/routes'
import { profile } from './modules/profile/routes'
import { uploads } from './modules/uploads/routes'

const app = new Hono()

app.route('/api/breeds', breeds)
app.route('/api/discovery', discovery)
app.get('/api/messaging/live', messagingLive)
app.route('/api/messaging', messaging)
app.route('/api/onboarding', onboarding)
app.route('/api/profile', profile)
app.route('/api/uploads', uploads)

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
