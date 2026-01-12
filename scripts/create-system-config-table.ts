import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function createSystemConfigTable() {
  console.log('🚀 Creando tabla system_config...\n')

  try {
    // Crear tabla
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_name TEXT NOT NULL DEFAULT 'Portal Estudiante',
        logo TEXT,
        logo_light TEXT,
        favicon TEXT,
        primary_color TEXT DEFAULT '#000000',
        secondary_color TEXT DEFAULT '#6B7280',
        accent_color TEXT DEFAULT '#3B82F6',
        background_color TEXT DEFAULT '#F9FAFB',
        text_color TEXT DEFAULT '#111827',
        header_color TEXT DEFAULT '#FFFFFF',
        sidebar_color TEXT DEFAULT '#1F2937',
        button_color TEXT DEFAULT '#000000',
        link_color TEXT DEFAULT '#3B82F6',
        whatsapp_number TEXT DEFAULT '+56912345678',
        whatsapp_message TEXT DEFAULT 'Hola, me gustaría obtener más información sobre los cursos disponibles.',
        whatsapp_enabled INTEGER DEFAULT 1,
        company_name TEXT DEFAULT 'Centro de Capacitación ADAM',
        company_description TEXT DEFAULT 'Formación en Maquinaria Pesada',
        company_email TEXT DEFAULT 'contacto@adam.cl',
        company_phone TEXT DEFAULT '+56 9 1234 5678',
        company_address TEXT DEFAULT 'Santiago, Chile',
        about_title TEXT DEFAULT 'Sobre Nosotros',
        about_description TEXT DEFAULT 'Somos líderes en formación de operadores de maquinaria pesada con más de 15 años de experiencia en el sector.',
        about_mission TEXT DEFAULT 'Formar operadores altamente calificados y certificados, brindando las mejores herramientas y conocimientos para su desarrollo profesional en la industria de la construcción y minería.',
        about_vision TEXT DEFAULT 'Ser el centro de capacitación líder en Chile, reconocido por la excelencia en la formación de operadores de maquinaria pesada y por contribuir al desarrollo de la industria.',
        about_history TEXT DEFAULT 'Fundado en 2010, nuestro centro ha capacitado a más de 5,000 operadores que hoy trabajan en las principales empresas del país. Contamos con instalaciones modernas, maquinaria de última generación y un equipo de instructores certificados con amplia experiencia en el campo.',
        about_image1 TEXT,
        about_image2 TEXT,
        about_image3 TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla system_config creada')

    // Verificar si ya existe configuración
    const existing = await db.execute('SELECT COUNT(*) as count FROM system_config')
    const count = existing.rows[0].count as number

    if (count === 0) {
      // Insertar configuración por defecto
      await db.execute(`
        INSERT INTO system_config (
          site_name, primary_color, secondary_color, accent_color,
          background_color, text_color, header_color, sidebar_color,
          button_color, link_color, whatsapp_number, whatsapp_message,
          whatsapp_enabled, company_name, company_description,
          company_email, company_phone, company_address,
          about_title, about_description, about_mission, about_vision, about_history
        ) VALUES (
          'Portal Estudiante',
          '#000000', '#6B7280', '#3B82F6',
          '#F9FAFB', '#111827', '#FFFFFF', '#1F2937',
          '#000000', '#3B82F6',
          '+56912345678',
          'Hola, me gustaría obtener más información sobre los cursos disponibles.',
          1,
          'Centro de Capacitación ADAM',
          'Formación en Maquinaria Pesada',
          'contacto@adam.cl',
          '+56 9 1234 5678',
          'Santiago, Chile',
          'Sobre Nosotros',
          'Somos líderes en formación de operadores de maquinaria pesada con más de 15 años de experiencia en el sector.',
          'Formar operadores altamente calificados y certificados, brindando las mejores herramientas y conocimientos para su desarrollo profesional en la industria de la construcción y minería.',
          'Ser el centro de capacitación líder en Chile, reconocido por la excelencia en la formación de operadores de maquinaria pesada y por contribuir al desarrollo de la industria.',
          'Fundado en 2010, nuestro centro ha capacitado a más de 5,000 operadores que hoy trabajan en las principales empresas del país. Contamos con instalaciones modernas, maquinaria de última generación y un equipo de instructores certificados con amplia experiencia en el campo.'
        )
      `)
      console.log('✅ Configuración por defecto insertada')
    } else {
      console.log('ℹ️  Ya existe configuración en la base de datos')
    }

    // Verificar datos
    const config = await db.execute('SELECT * FROM system_config LIMIT 1')
    console.log('\n📋 Configuración actual:')
    console.log('  - Nombre del sitio:', config.rows[0].site_name)
    console.log('  - Empresa:', config.rows[0].company_name)
    console.log('  - WhatsApp:', config.rows[0].whatsapp_number)
    console.log('  - Email:', config.rows[0].company_email)

    console.log('\n✅ ¡Tabla system_config lista!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

createSystemConfigTable()
