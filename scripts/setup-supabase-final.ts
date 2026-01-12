import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Usar service role key con permisos completos
const supabase = createClient(
  'https://bnhtgfbvlrvmyggketpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuaHRnZmJ2bHJ2bXlnZ2tldHBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ0ODgyMSwiZXhwIjoyMDUyMDI0ODIxfQ.HOvup64pCWm4c6JGunzfEV2EOKFVcTLQVwOXPBbK4TbL99CAU-znlSjithHLoxZd6qaGdPfks7UgB3hmmUIe8g',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function setupSupabase() {
  console.log('🚀 Configurando Supabase con service role key...\n')

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
        onConflict: 'username'
      })
      .select()

    if (userError) {
      console.error('❌ Error creando usuario:', userError.message)
    } else {
      console.log('✅ Usuario admin creado/actualizado')
      console.log('   Usuario: admin@adam.cl')
      console.log('   Contraseña: admin123')
    }

    // Verificar usuario
    const { data: verifyUser } = await supabase
      .from('users')
      .select('id, username, role, email')
      .eq('username', 'admin@adam.cl')
      .single()

    if (verifyUser) {
      console.log('   ID:', verifyUser.id)
    }

    console.log('\n✅ ¡Configuración completada!')
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Reinicia el servidor: npm run dev')
    console.log('   2. Ve a: http://localhost:3000/login')
    console.log('   3. Inicia sesión con:')
    console.log('      Usuario: admin@adam.cl')
    console.log('      Contraseña: admin123')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
  }
}

setupSupabase()
