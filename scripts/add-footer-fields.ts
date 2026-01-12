import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function addFooterFields() {
  console.log('🚀 Agregando campos de footer a system_config...\n')

  try {
    // Agregar columnas de footer
    const footerColumns = [
      { name: 'footer_text', type: 'TEXT', default: "'© 2024 Centro de Capacitación ADAM. Todos los derechos reservados.'" },
      { name: 'footer_show_company_info', type: 'INTEGER', default: '1' },
      { name: 'footer_show_social_media', type: 'INTEGER', default: '1' },
      { name: 'footer_facebook_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_instagram_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_twitter_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_linkedin_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_youtube_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link1_text', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link1_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link2_text', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link2_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link3_text', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link3_url', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link4_text', type: 'TEXT', default: 'NULL' },
      { name: 'footer_link4_url', type: 'TEXT', default: 'NULL' }
    ]

    for (const column of footerColumns) {
      try {
        await db.execute(`
          ALTER TABLE system_config 
          ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}
        `)
        console.log(`✅ Columna ${column.name} agregada`)
      } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️  Columna ${column.name} ya existe`)
        } else {
          throw error
        }
      }
    }

    // Actualizar valores por defecto si no existen
    await db.execute(`
      UPDATE system_config 
      SET 
        footer_text = '© 2024 Centro de Capacitación ADAM. Todos los derechos reservados.',
        footer_show_company_info = 1,
        footer_show_social_media = 1
      WHERE footer_text IS NULL
    `)

    console.log('\n✅ Campos de footer agregados exitosamente!')
    
    // Verificar
    const result = await db.execute('SELECT footer_text, footer_show_company_info FROM system_config LIMIT 1')
    console.log('\n📋 Configuración de footer:')
    console.log('  - Texto:', result.rows[0].footer_text)
    console.log('  - Mostrar info empresa:', result.rows[0].footer_show_company_info === 1 ? 'Sí' : 'No')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

addFooterFields()
