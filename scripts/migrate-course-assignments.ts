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

async function migrate() {
  try {
    console.log('🚀 Iniciando migración de tablas de asignación de cursos...')

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-course-assignments.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Ejecutar todo el SQL de una vez (Turso soporta múltiples comandos)
    console.log(`📝 Ejecutando script SQL completo...`)

    try {
      await db.execute(sql)
      console.log(`✅ Script ejecutado correctamente`)
    } catch (error: any) {
      // Si falla, intentar comando por comando
      console.log(`⚠️  Ejecución completa falló, intentando comando por comando...`)
      
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i]
        try {
          await db.execute(command)
          console.log(`✅ Comando ${i + 1}/${commands.length} ejecutado`)
        } catch (cmdError: any) {
          // Ignorar errores de "tabla ya existe"
          if (cmdError.message.includes('already exists') || cmdError.message.includes('duplicate')) {
            console.log(`⚠️  Comando ${i + 1}/${commands.length} - Ya existe, omitiendo...`)
          } else {
            console.error(`❌ Error en comando ${i + 1}:`, cmdError.message)
          }
        }
      }
    }

    console.log('\n✅ Migración completada exitosamente!')
    console.log('\n📊 Tablas creadas:')
    console.log('  - course_enrollments (matrículas de estudiantes)')
    console.log('  - evaluations (evaluaciones del sistema)')
    console.log('  - course_evaluations (evaluaciones asignadas a cursos)')
    console.log('  - student_evaluations (resultados de evaluaciones)')

    // Verificar las tablas creadas
    const tables = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name IN ('course_enrollments', 'evaluations', 'course_evaluations', 'student_evaluations')
      ORDER BY name
    `)

    console.log('\n✅ Tablas verificadas en la base de datos:')
    tables.rows.forEach((row: any) => {
      console.log(`  ✓ ${row.name}`)
    })

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  }
}

migrate()
