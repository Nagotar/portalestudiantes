import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function createBannersTables() {
  console.log('🔧 Creando tablas de banners y logos...\n')

  try {
    // Crear tabla de banners
    await db.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        description TEXT NOT NULL,
        gradient TEXT NOT NULL,
        icon TEXT NOT NULL,
        image TEXT,
        use_image INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla banners creada')

    // Crear tabla de logos de empresas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS company_logos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla company_logos creada')

    // Agregar columna display_order si no existe
    try {
      await db.execute('ALTER TABLE company_logos ADD COLUMN display_order INTEGER DEFAULT 0')
      console.log('✅ Columna display_order agregada a company_logos')
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate column name')) {
        console.log('⚠️  Columna display_order ya existe en company_logos')
      }
    }

    // Insertar banners de ejemplo
    console.log('\n📝 Insertando banners de ejemplo...')
    
    const sampleBanners = [
      {
        title: 'Bienvenido al Portal Estudiante',
        subtitle: 'Tu plataforma educativa integral',
        description: 'Accede a todos tus cursos, tareas y calificaciones en un solo lugar',
        gradient: 'from-blue-600 via-purple-600 to-pink-600',
        icon: 'graduation',
        display_order: 1
      },
      {
        title: 'Aprende a tu Ritmo',
        subtitle: 'Educación flexible y personalizada',
        description: 'Contenido disponible 24/7 adaptado a tu horario y necesidades',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        icon: 'book',
        display_order: 2
      },
      {
        title: 'Conecta con tu Comunidad',
        subtitle: 'Colaboración y crecimiento',
        description: 'Únete a grupos de estudio y comparte conocimiento con otros estudiantes',
        gradient: 'from-orange-500 via-red-500 to-pink-600',
        icon: 'users',
        display_order: 3
      }
    ]

    for (const banner of sampleBanners) {
      await db.execute({
        sql: `INSERT INTO banners (title, subtitle, description, gradient, icon, use_image, active, display_order)
              VALUES (?, ?, ?, ?, ?, 0, 1, ?)`,
        args: [banner.title, banner.subtitle, banner.description, banner.gradient, banner.icon, banner.display_order]
      })
    }
    console.log('✅ Banners de ejemplo insertados')

    // Insertar logos de empresas de ejemplo
    console.log('\n📝 Insertando logos de empresas de ejemplo...')
    
    const sampleCompanies = [
      { name: 'Constructora ABC', display_order: 1 },
      { name: 'Minera XYZ', display_order: 2 },
      { name: 'Transportes DEF', display_order: 3 }
    ]

    for (const company of sampleCompanies) {
      await db.execute({
        sql: `INSERT INTO company_logos (name, logo, active, display_order)
              VALUES (?, '', 1, ?)`,
        args: [company.name, company.display_order]
      })
    }
    console.log('✅ Logos de empresas de ejemplo insertados')

    // Verificar
    const bannersCount = await db.execute('SELECT COUNT(*) as count FROM banners')
    const logosCount = await db.execute('SELECT COUNT(*) as count FROM company_logos')
    
    console.log(`\n📊 Total de banners: ${bannersCount.rows[0].count}`)
    console.log(`📊 Total de logos: ${logosCount.rows[0].count}`)

    console.log('\n🎉 Tablas creadas e inicializadas exitosamente!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createBannersTables()
