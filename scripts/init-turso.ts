import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function initDatabase() {
  console.log('🗄️  Inicializando base de datos Turso...')

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'init-db.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    // Dividir en statements individuales, eliminando comentarios
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Filtrar líneas vacías y comentarios
        if (s.length === 0) return false
        const lines = s.split('\n').filter(line => {
          const trimmed = line.trim()
          return trimmed.length > 0 && !trimmed.startsWith('--')
        })
        return lines.length > 0
      })
      .map(s => {
        // Limpiar comentarios de cada statement
        return s.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim()
      })

    console.log(`📝 Ejecutando ${statements.length} statements SQL...`)

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue
      
      try {
        await db.execute(statement)
        // Identificar tipo de statement
        const statementType = statement.split(' ')[0].toUpperCase()
        console.log(`✅ ${statementType} ${i + 1}/${statements.length} ejecutado`)
      } catch (error: any) {
        // Ignorar errores de "table already exists" o "index already exists"
        if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate'))) {
          console.log(`⚠️  Statement ${i + 1}/${statements.length} - ya existe, continuando...`)
        } else {
          console.error(`❌ Error en statement ${i + 1}:`, error.message)
          console.error(`Statement: ${statement.substring(0, 100)}...`)
        }
      }
    }

    console.log('\n🎉 Base de datos inicializada correctamente!')
    console.log('\n📋 Próximo paso: ejecutar npm run db:seed para crear usuarios iniciales')

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error)
    process.exit(1)
  }
}

initDatabase()
