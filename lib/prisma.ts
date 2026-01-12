import { createClient } from '@libsql/client'

const globalForDb = global as unknown as { db: ReturnType<typeof createClient> }

export const db =
  globalForDb.db ||
  createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.db = db

export default db
