import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { db } from '../../db'
import { breeds as breedsTable } from '../../db/schema'
import { webOrigins } from '../auth/auth'

const breeds = new Hono()
const frenchOrder = new Intl.Collator('fr')

breeds.use('*', cors({ origin: webOrigins, allowMethods: ['GET', 'OPTIONS'] }))

/** Catalogue public des races, trié dans l'ordre alphabétique français. */
breeds.get('/', async (c) => {
  const catalog = await db.select().from(breedsTable)
  catalog.sort((a, b) => frenchOrder.compare(a.name, b.name))

  c.header('Cache-Control', 'public, max-age=300')
  return c.json({ breeds: catalog })
})

export { breeds }
