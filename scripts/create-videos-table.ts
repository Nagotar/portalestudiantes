import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function createVideosTable() {
  try {
    console.log('🎬 Creando tabla de videos...')

    // Crear tabla videos
    await client.execute(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('didactico', 'informativo')),
        duration TEXT NOT NULL,
        thumbnail TEXT,
        video_url TEXT,
        upload_date TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Tabla videos creada exitosamente')

    // Insertar videos de ejemplo
    console.log('📝 Insertando videos de ejemplo...')

    const sampleVideos = [
      {
        title: 'Operación Segura de Excavadoras',
        description: 'Aprende las técnicas fundamentales para operar excavadoras de forma segura',
        category: 'Excavadoras',
        type: 'didactico',
        duration: '25:30',
        upload_date: '2026-01-05',
        views: 1234,
        active: 1,
        featured: 0
      },
      {
        title: 'Bienvenida al Centro de Capacitación',
        description: 'Conoce nuestras instalaciones y programas de formación en maquinaria pesada',
        category: 'Institucional',
        type: 'informativo',
        duration: '3:45',
        upload_date: '2026-01-06',
        views: 3421,
        active: 1,
        featured: 1
      },
      {
        title: 'Proceso de Inscripción y Certificación',
        description: 'Paso a paso para inscribirte y obtener tu certificación oficial',
        category: 'Tutorial',
        type: 'informativo',
        duration: '4:30',
        upload_date: '2026-01-05',
        views: 2856,
        active: 1,
        featured: 1
      },
      {
        title: 'Mantenimiento Preventivo de Retroexcavadoras',
        description: 'Técnicas esenciales de mantenimiento para prolongar la vida útil del equipo',
        category: 'Retroexcavadoras',
        type: 'didactico',
        duration: '18:45',
        upload_date: '2026-01-03',
        views: 856,
        active: 1,
        featured: 0
      },
      {
        title: 'Seguridad en Obra: Protocolos Esenciales',
        description: 'Normas y procedimientos de seguridad que todo operador debe conocer',
        category: 'Seguridad',
        type: 'informativo',
        duration: '12:15',
        upload_date: '2026-01-04',
        views: 2145,
        active: 1,
        featured: 1
      },
      {
        title: 'Operación de Cargadores Frontales',
        description: 'Guía completa para el manejo eficiente de cargadores frontales',
        category: 'Cargadores Frontales',
        type: 'didactico',
        duration: '22:00',
        upload_date: '2026-01-02',
        views: 1567,
        active: 1,
        featured: 0
      }
    ]

    for (const video of sampleVideos) {
      await client.execute({
        sql: `
          INSERT INTO videos (
            title, description, category, type, duration,
            upload_date, views, active, featured
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          video.title,
          video.description,
          video.category,
          video.type,
          video.duration,
          video.upload_date,
          video.views,
          video.active,
          video.featured
        ]
      })
    }

    console.log(`✅ ${sampleVideos.length} videos insertados exitosamente`)

    // Verificar datos
    const result = await client.execute('SELECT COUNT(*) as count FROM videos')
    console.log(`📊 Total de videos en la base de datos: ${result.rows[0].count}`)

    console.log('\n✨ ¡Tabla de videos creada e inicializada correctamente!')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    client.close()
  }
}

createVideosTable()
