import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function addBrandingFields() {
  try {
    console.log('Agregando campos de branding a system_config...')

    // Verificar si las columnas ya existen
    const tableInfo = await client.execute('PRAGMA table_info(system_config)')
    const existingColumns = tableInfo.rows.map((row: any) => row.name)

    const columnsToAdd = [
      { name: 'branding_title', type: 'TEXT', default: "'Bienvenido de vuelta'" },
      { name: 'branding_subtitle', type: 'TEXT', default: "'Accede a tu cuenta para continuar tu aprendizaje'" },
      { name: 'branding_image', type: 'TEXT', default: 'NULL' },
      { name: 'branding_gradient_from', type: 'TEXT', default: "'#1F2937'" },
      { name: 'branding_gradient_to', type: 'TEXT', default: "'#000000'" },
    ]

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        const sql = `ALTER TABLE system_config ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`
        await client.execute(sql)
        console.log(`✓ Columna ${column.name} agregada`)
      } else {
        console.log(`- Columna ${column.name} ya existe`)
      }
    }

    console.log('\n✅ Campos de branding agregados exitosamente')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    client.close()
  }
}

addBrandingFields()
