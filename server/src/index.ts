import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    name: 'Pawpote API',
    status: 'ok',
  })
})

export default app