import { serve } from '@hono/node-server'
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'], quiet: true })

const { default: app } = await import('./index')
const port = Number(process.env.PAWPOTE_LAN_PORT ?? '8787')

serve({ fetch: app.fetch, hostname: '0.0.0.0', port }, ({ port }) => {
  console.log(`Pawpote API on port ${port} (LAN)`)
})
