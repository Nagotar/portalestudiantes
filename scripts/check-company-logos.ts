import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
})

async function checkCompanyLogos() {
  try {
    console.log('🔍 Verificando logos de empresas en la base de datos...\n')

    // Obtener todos los logos
    const result = await db.execute('SELECT * FROM company_logos ORDER BY display_order ASC, created_at DESC')
    
    console.log(`📊 Total de logos encontrados: ${result.rows.length}\n`)

    if (result.rows.length === 0) {
      console.log('⚠️  No hay logos de empresas en la base de datos')
      console.log('💡 Puedes agregar logos desde el panel de administración\n')
      return
    }

    console.log('📋 Lista de logos:\n')
    result.rows.forEach((row: any, index: number) => {
      console.log(`${index + 1}. ${row.name}`)
      console.log(`   ID: ${row.id}`)
      console.log(`   Activo: ${row.active === 1 ? '✅ Sí' : '❌ No'}`)
      console.log(`   Orden: ${row.display_order}`)
      console.log(`   Logo: ${row.logo ? `${row.logo.substring(0, 50)}...` : 'Sin logo'}`)
      console.log(`   Creado: ${row.created_at}`)
      console.log('')
    })

    // Verificar logos activos
    const activeLogos = result.rows.filter((row: any) => row.active === 1)
    console.log(`\n✅ Logos activos: ${activeLogos.length}`)
    console.log(`❌ Logos inactivos: ${result.rows.length - activeLogos.length}`)

  } catch (error) {
    console.error('❌ Error verificando logos:', error)
    throw error
  } finally {
    db.close()
  }
}

checkCompanyLogos()
