import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function createDocumentsTable() {
  console.log('🔧 Creando tabla documents...')

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        license_type TEXT NOT NULL,
        file_data TEXT,
        file_name TEXT,
        file_size INTEGER,
        downloads INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Tabla documents creada exitosamente')

    // Insertar documentos de ejemplo
    console.log('\n📝 Insertando documentos de ejemplo...')

    const sampleDocuments = [
      {
        title: 'Requisitos Licencia Clase A',
        description: 'Documentación completa para obtener licencia profesional Clase A (vehículos de carga)',
        license_type: 'Clase A',
        file_name: 'requisitos-clase-a.pdf',
        file_size: 2400000,
        downloads: 234
      },
      {
        title: 'Requisitos Licencia Clase B',
        description: 'Documentación necesaria para licencia profesional Clase B (transporte de pasajeros)',
        license_type: 'Clase B',
        file_name: 'requisitos-clase-b.pdf',
        file_size: 1800000,
        downloads: 189
      },
      {
        title: 'Requisitos Licencia Clase D',
        description: 'Requisitos para licencia no profesional Clase D (vehículos motorizados)',
        license_type: 'Clase D',
        file_name: 'requisitos-clase-d.pdf',
        file_size: 1500000,
        downloads: 456
      },
      {
        title: 'Requisitos Licencia A1',
        description: 'Documentación para licencia especial A1 (grúas horquillas hasta 5 toneladas)',
        license_type: 'A1',
        file_name: 'requisitos-a1.pdf',
        file_size: 2100000,
        downloads: 312
      }
    ]

    for (const doc of sampleDocuments) {
      await db.execute({
        sql: `INSERT INTO documents (title, description, license_type, file_name, file_size, downloads, active)
              VALUES (?, ?, ?, ?, ?, ?, 1)`,
        args: [doc.title, doc.description, doc.license_type, doc.file_name, doc.file_size, doc.downloads]
      })
    }

    console.log('✅ Documentos de ejemplo insertados')

    // Verificar
    const result = await db.execute('SELECT COUNT(*) as count FROM documents')
    console.log(`\n📊 Total de documentos: ${result.rows[0].count}`)

    console.log('\n🎉 Tabla documents creada e inicializada exitosamente!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createDocumentsTable()
