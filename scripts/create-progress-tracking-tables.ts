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

async function createTables() {
  try {
    console.log('🚀 Creando tablas de tracking de progreso...\n')

    // Tabla para trackear materiales vistos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS material_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed INTEGER DEFAULT 1,
        UNIQUE(student_id, material_id)
      )
    `)
    console.log('✅ Tabla material_views creada\n')

    // Tabla para trackear videos vistos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS video_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        video_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed INTEGER DEFAULT 1,
        UNIQUE(student_id, video_id)
      )
    `)
    console.log('✅ Tabla video_views creada\n')

    // Verificar tablas
    const result = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND (name='material_views' OR name='video_views')
    `)

    if (result.rows.length === 2) {
      console.log('✅ Todas las tablas verificadas en la base de datos')
      console.log('\n📊 Tablas creadas:')
      console.log('  - material_views: Trackea materiales vistos por estudiante')
      console.log('  - video_views: Trackea videos vistos por estudiante')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createTables()
