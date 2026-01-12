import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function checkUsers() {
  console.log('🔍 Verificando usuarios en Turso...\n')

  try {
    // Primero verificar el esquema de la tabla
    console.log('📋 Esquema de la tabla users:')
    const schema = await db.execute('PRAGMA table_info(users)')
    schema.rows.forEach((col: any) => {
      console.log(`  - ${col.name} (${col.type})`)
    })
    
    console.log('\n👥 Usuarios en la base de datos:\n')
    const result = await db.execute('SELECT * FROM users')
    
    if (result.rows.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos')
      console.log('💡 Necesitas crear un usuario admin primero')
      return
    }

    result.rows.forEach((user: any) => {
      console.log('Usuario:')
      Object.entries(user).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
      console.log('---')
    })

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkUsers()
