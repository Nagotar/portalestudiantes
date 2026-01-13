import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyNDYyMjAsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.mAItLY2fa8sY_axrngYz5SAhXVbe6170VyRyV5du94whSrv708gJBvcQ991f4b1p-COIDzcZKlikla-qy016CQ'
})

async function createAnalyticsTables() {
  try {
    console.log('🔧 Creando tablas de analíticas...\n')

    // Tabla de visitas
    console.log('📊 Creando tabla visits...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT,
        user_agent TEXT,
        page_url TEXT,
        referrer TEXT,
        session_id TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    console.log('✅ Tabla visits creada\n')

    // Índices para optimizar consultas
    console.log('📑 Creando índices para visits...')
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_visits_session ON visits(session_id)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_visits_user ON visits(user_id)
    `)
    console.log('✅ Índices creados\n')

    // Tabla de log de actividades
    console.log('📝 Creando tabla activity_log...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        user_id INTEGER,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    console.log('✅ Tabla activity_log creada\n')

    // Índices para activity_log
    console.log('📑 Creando índices para activity_log...')
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id)
    `)
    console.log('✅ Índices creados\n')

    // Insertar datos de ejemplo para testing
    console.log('🌱 Insertando datos de ejemplo...')
    
    // Visitas de ejemplo (últimos 7 días)
    const visitsSql = `
      INSERT INTO visits (ip_address, page_url, created_at) VALUES
      ('192.168.1.1', '/', datetime('now', '-1 hours')),
      ('192.168.1.2', '/login', datetime('now', '-2 hours')),
      ('192.168.1.3', '/', datetime('now', '-3 hours')),
      ('192.168.1.4', '/cursos', datetime('now', '-5 hours')),
      ('192.168.1.5', '/', datetime('now', '-1 days')),
      ('192.168.1.6', '/', datetime('now', '-1 days', '-2 hours')),
      ('192.168.1.7', '/login', datetime('now', '-2 days')),
      ('192.168.1.8', '/', datetime('now', '-2 days', '-3 hours')),
      ('192.168.1.9', '/cursos', datetime('now', '-3 days')),
      ('192.168.1.10', '/', datetime('now', '-3 days', '-1 hours')),
      ('192.168.1.11', '/', datetime('now', '-4 days')),
      ('192.168.1.12', '/login', datetime('now', '-5 days')),
      ('192.168.1.13', '/', datetime('now', '-6 days')),
      ('192.168.1.14', '/cursos', datetime('now', '-6 days', '-2 hours'))
    `
    await db.execute(visitsSql)
    console.log('✅ Visitas de ejemplo insertadas\n')

    // Actividades de ejemplo
    const activitiesSql = `
      INSERT INTO activity_log (action, entity_type, entity_id, created_at) VALUES
      ('Banner "Bienvenido" actualizado', 'banner', 1, datetime('now', '-2 hours')),
      ('Nueva solicitud de información', 'info_request', 1, datetime('now', '-3 hours')),
      ('Reporte mensual generado', 'report', 1, datetime('now', '-1 days')),
      ('Curso "Operador de Grúa" creado', 'course', 1, datetime('now', '-2 days')),
      ('Video "Seguridad Industrial" subido', 'video', 1, datetime('now', '-3 days'))
    `
    await db.execute(activitiesSql)
    console.log('✅ Actividades de ejemplo insertadas\n')

    console.log('✨ ¡Tablas de analíticas creadas exitosamente!')
    console.log('\n📋 Tablas creadas:')
    console.log('  - visits (con índices)')
    console.log('  - activity_log (con índices)')
    console.log('\n💡 Datos de ejemplo insertados para testing')

  } catch (error) {
    console.error('❌ Error creando tablas:', error)
    throw error
  }
}

createAnalyticsTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
