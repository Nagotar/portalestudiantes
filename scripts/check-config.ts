import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function checkConfig() {
  try {
    console.log('🔍 Verificando configuración del sistema...\n')

    const result = await client.execute('SELECT * FROM system_config LIMIT 1')
    
    if (result.rows.length === 0) {
      console.log('❌ No hay configuración en la base de datos')
      return
    }

    const config = result.rows[0]
    
    console.log('📋 Configuración actual:\n')
    console.log('=== GENERAL ===')
    console.log(`  site_name: ${config.site_name}`)
    console.log(`  logo: ${config.logo ? 'Configurado' : 'No configurado'}`)
    console.log(`  logo_light: ${config.logo_light ? 'Configurado' : 'No configurado'}`)
    console.log(`  favicon: ${config.favicon ? 'Configurado' : 'No configurado'}`)
    
    console.log('\n=== COLORES ===')
    console.log(`  primary_color: ${config.primary_color}`)
    console.log(`  secondary_color: ${config.secondary_color}`)
    console.log(`  accent_color: ${config.accent_color}`)
    console.log(`  background_color: ${config.background_color}`)
    console.log(`  text_color: ${config.text_color}`)
    console.log(`  header_color: ${config.header_color}`)
    console.log(`  sidebar_color: ${config.sidebar_color}`)
    console.log(`  button_color: ${config.button_color}`)
    console.log(`  link_color: ${config.link_color}`)
    
    console.log('\n=== WHATSAPP ===')
    console.log(`  whatsapp_number: ${config.whatsapp_number}`)
    console.log(`  whatsapp_enabled: ${config.whatsapp_enabled}`)
    
    console.log('\n✅ Configuración verificada')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    client.close()
  }
}

checkConfig()
