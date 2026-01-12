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
    console.log('🚀 Creando tablas individualmente...\n')

    // Tabla 1: course_enrollments
    console.log('📝 Creando tabla course_enrollments...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ course_enrollments creada\n')

    // Tabla 2: course_evaluations
    console.log('📝 Creando tabla course_evaluations...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS course_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        evaluation_id INTEGER NOT NULL,
        order_num INTEGER DEFAULT 0,
        required INTEGER DEFAULT 1,
        available_from DATETIME,
        available_until DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ course_evaluations creada\n')

    // Tabla 3: student_evaluations
    console.log('📝 Creando tabla student_evaluations...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        evaluation_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        score INTEGER,
        answers TEXT,
        passed INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 1,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ student_evaluations creada\n')

    console.log('✅ Todas las tablas creadas exitosamente!')

    // Verificar
    const result = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name IN ('course_enrollments', 'course_evaluations', 'student_evaluations')
      ORDER BY name
    `)

    console.log('\n📊 Tablas verificadas:')
    result.rows.forEach((row: any) => {
      console.log(`  ✓ ${row.name}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createTables()
