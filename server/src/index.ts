
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { auth, webOrigins } from './auth'
import { db } from './db'
import { breeds } from './db/schema'
import { discovery } from './discovery'

const app = new Hono()
const frenchOrder = new Intl.Collator('fr')

app.route('/api/discovery', discovery)

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

app.use('/api/breeds', cors({ origin: webOrigins, allowMethods: ['GET', 'OPTIONS'] }))

app.get('/api/breeds', async (c) => {
  const catalog = await db.select().from(breeds)
  catalog.sort((a, b) => frenchOrder.compare(a.name, b.name))

  c.header('Cache-Control', 'public, max-age=300')
  return c.json({ breeds: catalog })
})

// Routes Better Auth
app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

export default app
