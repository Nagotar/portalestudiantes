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

async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...\n')

    // Listar todas las tablas
    const result = await db.execute(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `)

    console.log('📊 Tablas encontradas:')
    result.rows.forEach((row: any) => {
      console.log(`\n✓ ${row.name}`)
    })

    // Verificar tablas específicas
    const requiredTables = [
      'course_enrollments',
      'evaluations',
      'course_evaluations',
      'student_evaluations'
    ]

    console.log('\n\n🎯 Verificando tablas requeridas:')
    for (const table of requiredTables) {
      const check = await db.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='${table}'
      `)
      
      if (check.rows.length > 0) {
        console.log(`✅ ${table} - EXISTE`)
      } else {
        console.log(`❌ ${table} - NO EXISTE`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyTables()
