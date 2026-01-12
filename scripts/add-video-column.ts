import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function addVideoColumn() {
  console.log('🔧 Agregando columna video a la tabla courses...')

  try {
    // Agregar columna video para almacenar videos en base64
    try {
      await db.execute('ALTER TABLE courses ADD COLUMN video TEXT')
      console.log('✅ Columna "video" agregada')
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate column name')) {
        console.log('⚠️  Columna "video" ya existe')
      } else {
        throw error
      }
    }

    console.log('\n🎉 Columna agregada exitosamente!')

  } catch (error) {
    console.error('❌ Error agregando columna:', error)
    process.exit(1)
  }
}

addVideoColumn()
