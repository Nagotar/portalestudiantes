import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

// Leer variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const db = createClient({
  url: envVars.TURSO_DATABASE_URL,
  authToken: envVars.TURSO_AUTH_TOKEN,
})

async function createTable() {
  try {
    console.log('🚀 Creando tabla course_materials...\n')

    await db.execute(`
      CREATE TABLE IF NOT EXISTS course_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        order_num INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla course_materials creada\n')

    // Verificar
    const result = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='course_materials'
    `)

    if (result.rows.length > 0) {
      console.log('✅ Tabla verificada en la base de datos')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createTable()
