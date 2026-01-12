import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...')

  try {
    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await db.execute({
      sql: `INSERT OR IGNORE INTO users (email, password, name, role, status) 
            VALUES (?, ?, ?, ?, ?)`,
      args: ['admin@adam.cl', hashedPassword, 'Administrador', 'admin', 'active']
    })

    console.log('✅ Usuario administrador creado: admin@adam.cl')

    // Crear usuario estudiante de prueba
    const studentPassword = await bcrypt.hash('estudiante123', 10)
    
    await db.execute({
      sql: `INSERT OR IGNORE INTO users (email, password, name, role, status) 
            VALUES (?, ?, ?, ?, ?)`,
      args: ['estudiante@adam.cl', studentPassword, 'Estudiante Demo', 'estudiante', 'active']
    })

    console.log('✅ Usuario estudiante creado: estudiante@adam.cl')

    // Crear configuración del sistema
    await db.execute({
      sql: `INSERT OR IGNORE INTO system_config (id, site_name, company_name, company_description, 
            company_email, company_phone, company_address, whatsapp_number, whatsapp_message, whatsapp_enabled) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        1,
        'Portal Estudiante',
        'Centro de Capacitación ADAM',
        'Formación en Maquinaria Pesada',
        'contacto@adam.cl',
        '+56 9 1234 5678',
        'Santiago, Chile',
        '+56912345678',
        'Hola, me gustaría obtener más información sobre los cursos disponibles.',
        1
      ]
    })

    console.log('✅ Configuración del sistema creada')

    console.log('\n🎉 Seed completado exitosamente!')
    console.log('\n📝 Credenciales de acceso:')
    console.log('   Admin: admin@adam.cl / admin123')
    console.log('   Estudiante: estudiante@adam.cl / estudiante123')

  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

seed()
