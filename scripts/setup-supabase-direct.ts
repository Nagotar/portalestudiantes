import { Client } from 'pg'
import bcrypt from 'bcryptjs'

const client = new Client({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.bnhtgfbvlrvmyggketpb',
  password: 'Mult0942.adam',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupSupabase() {
  console.log('🚀 Configurando Supabase con PostgreSQL directo...\n')

  try {
    await client.connect()
    console.log('✅ Conectado a Supabase PostgreSQL')

    // 1. Crear usuario admin
    console.log('\n👤 Creando usuario admin...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await client.query(`
      INSERT INTO users (username, password, role, name, email, active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) 
      DO UPDATE SET 
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        active = EXCLUDED.active
    `, ['admin@adam.cl', hashedPassword, 'admin', 'Administrador', 'admin@adam.cl', true])

    console.log('✅ Usuario admin creado/actualizado')
    console.log('   Usuario: admin@adam.cl')
    console.log('   Contraseña: admin123')

    // Verificar usuario
    const result = await client.query('SELECT id, username, role, email FROM users WHERE username = $1', ['admin@adam.cl'])
    console.log('   ID:', result.rows[0].id)

    // 2. Crear funciones RPC
    console.log('\n⚙️  Creando funciones RPC...')
    
    // Función para incrementar vistas
    await client.query(`
      CREATE OR REPLACE FUNCTION increment_video_views(video_id INTEGER)
      RETURNS void AS $$
      BEGIN
        UPDATE videos SET views = views + 1 WHERE id = video_id;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('✅ Función increment_video_views creada')

    // Función para incrementar descargas
    await client.query(`
      CREATE OR REPLACE FUNCTION increment_document_downloads(document_id INTEGER)
      RETURNS void AS $$
      BEGIN
        UPDATE documents SET downloads = downloads + 1 WHERE id = document_id;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('✅ Función increment_document_downloads creada')

    console.log('\n✅ ¡Configuración de Supabase completada exitosamente!')
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Reinicia el servidor: npm run dev')
    console.log('   2. Ve a: http://localhost:3000/login')
    console.log('   3. Inicia sesión con:')
    console.log('      Usuario: admin@adam.cl')
    console.log('      Contraseña: admin123')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

setupSupabase()
