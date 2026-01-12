import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function createInfoRequestsTable() {
  try {
    console.log('📝 Creando tabla info_requests...\n')

    // Crear tabla de solicitudes de información
    await client.execute(`
      CREATE TABLE IF NOT EXISTS info_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        telefono TEXT NOT NULL,
        curso TEXT NOT NULL,
        mensaje TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'closed')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla info_requests creada')

    // Crear índices
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_info_requests_status ON info_requests(status)
    `)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_info_requests_email ON info_requests(email)
    `)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_info_requests_created_at ON info_requests(created_at)
    `)
    console.log('✅ Índices creados')

    // Insertar datos de ejemplo
    await client.execute(`
      INSERT INTO info_requests (nombre, email, telefono, curso, mensaje, status, created_at)
      VALUES 
        ('María González', 'maria.gonzalez@email.com', '+56 9 1234 5678', 'Operador de Excavadoras', 
         'Me gustaría conocer más sobre el programa y modalidades de pago', 'pending', '2026-01-07 10:30:00'),
        
        ('Carlos Rodríguez', 'carlos.r@email.com', '+56 9 8765 4321', 'Operador de Grúas Torre',
         '¿Cuál es la duración del curso y tiene certificación?', 'contacted', '2026-01-07 09:15:00'),
        
        ('Ana Martínez', 'ana.martinez@email.com', '+56 9 5555 6666', 'Mantenimiento de Maquinaria Pesada',
         'Necesito información sobre requisitos previos', 'closed', '2026-01-06 16:45:00'),
        
        ('Pedro Silva', 'pedro.silva@email.com', '+56 9 7777 8888', 'Operador de Retroexcavadora',
         '¿Ofrecen descuentos para grupos?', 'pending', '2026-01-06 14:20:00')
    `)
    console.log('✅ Datos de ejemplo insertados')

    // Mostrar estructura de la tabla
    console.log('\n📋 Estructura de la tabla info_requests:')
    const tableInfo = await client.execute('PRAGMA table_info(info_requests)')
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type}${row.notnull ? ' NOT NULL' : ''}${row.dflt_value ? ` DEFAULT ${row.dflt_value}` : ''}`)
    })

    // Mostrar solicitudes insertadas
    console.log('\n📊 Solicitudes de ejemplo:')
    const requests = await client.execute('SELECT id, nombre, email, curso, status FROM info_requests ORDER BY created_at DESC')
    requests.rows.forEach(req => {
      console.log(`  - ID ${req.id}: ${req.nombre} - ${req.curso} (${req.status})`)
    })

    console.log('\n✅ Tabla info_requests creada exitosamente!')
    console.log('💡 Estados disponibles: pending, contacted, closed')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.close()
  }
}

createInfoRequestsTable()
