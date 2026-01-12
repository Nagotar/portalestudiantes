import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  'https://bnhtgfbvlrvmyggketpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuaHRnZmJ2bHJ2bXlnZ2tldHBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ0ODgyMSwiZXhwIjoyMDUyMDI0ODIxfQ.sb_secret_AfqGgs2UaTgp9gjWLrG73A_Mgn906DH'
)

async function setupSupabase() {
  console.log('🚀 Configurando Supabase...\n')

  try {
    // 1. Crear usuario admin
    console.log('👤 Creando usuario admin...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([
        {
          username: 'admin@adam.cl',
          password: hashedPassword,
          role: 'admin',
          name: 'Administrador',
          email: 'admin@adam.cl',
          active: true
        }
      ], { 
        onConflict: 'username',
        ignoreDuplicates: false 
      })
      .select()

    if (userError) {
      console.error('❌ Error creando usuario:', userError.message)
    } else {
      console.log('✅ Usuario admin creado')
      console.log('   Usuario: admin@adam.cl')
      console.log('   Contraseña: admin123')
    }

    // 2. Crear funciones RPC
    console.log('\n⚙️  Creando funciones RPC...')
    
    // Función para incrementar vistas
    const { error: viewsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE FUNCTION increment_video_views(video_id INTEGER)
        RETURNS void AS $$
        BEGIN
          UPDATE videos SET views = views + 1 WHERE id = video_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (viewsError) {
      console.log('⚠️  Función increment_video_views:', viewsError.message)
    } else {
      console.log('✅ Función increment_video_views creada')
    }

    // Función para incrementar descargas
    const { error: downloadsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE FUNCTION increment_document_downloads(document_id INTEGER)
        RETURNS void AS $$
        BEGIN
          UPDATE documents SET downloads = downloads + 1 WHERE id = document_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (downloadsError) {
      console.log('⚠️  Función increment_document_downloads:', downloadsError.message)
    } else {
      console.log('✅ Función increment_document_downloads creada')
    }

    console.log('\n✅ Configuración de Supabase completada!')
    console.log('\n🔄 Ahora reinicia el servidor con: npm run dev')
    console.log('🔐 Luego inicia sesión en /login con:')
    console.log('   Usuario: admin@adam.cl')
    console.log('   Contraseña: admin123')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
  }
}

setupSupabase()
