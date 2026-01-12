import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function addMissingColumns() {
  console.log('🔧 Agregando columnas faltantes a la tabla courses...')

  try {
    // Agregar columna image
    try {
      await db.execute('ALTER TABLE courses ADD COLUMN image TEXT')
      console.log('✅ Columna "image" agregada')
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate column name')) {
        console.log('⚠️  Columna "image" ya existe')
      } else {
        throw error
      }
    }

    // Agregar columna featured
    try {
      await db.execute('ALTER TABLE courses ADD COLUMN featured INTEGER DEFAULT 0')
      console.log('✅ Columna "featured" agregada')
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate column name')) {
        console.log('⚠️  Columna "featured" ya existe')
      } else {
        throw error
      }
    }

    console.log('\n🎉 Columnas agregadas exitosamente!')

  } catch (error) {
    console.error('❌ Error agregando columnas:', error)
    process.exit(1)
  }
}

addMissingColumns()
