import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyNDYyMjAsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.mAItLY2fa8sY_axrngYz5SAhXVbe6170VyRyV5du94whSrv708gJBvcQ991f4b1p-COIDzcZKlikla-qy016CQ'
})

async function addCloudinaryField() {
  try {
    console.log('🔧 Agregando campo cloudinary_public_id a la tabla banners...')
    
    // Agregar columna cloudinary_public_id a banners
    await db.execute(`
      ALTER TABLE banners 
      ADD COLUMN cloudinary_public_id TEXT
    `)
    
    console.log('✅ Campo cloudinary_public_id agregado exitosamente a banners')

    // También agregar a company_logos
    console.log('🔧 Agregando campo cloudinary_public_id a la tabla company_logos...')
    
    await db.execute(`
      ALTER TABLE company_logos 
      ADD COLUMN cloudinary_public_id TEXT
    `)
    
    console.log('✅ Campo cloudinary_public_id agregado exitosamente a company_logos')
    console.log('\n🎉 Migración completada exitosamente')

  } catch (error) {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  }
}

addCloudinaryField()
