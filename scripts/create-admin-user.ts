import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  'https://bnhtgfbvlrvmyggketpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuaHRnZmJ2bHJ2bXlnZ2tldHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDg4MjEsImV4cCI6MjA1MjAyNDgyMX0.sb_secret_AfqGgs2UaTgp9gjWLrG73A_Mgn906DH'
)

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario admin en Supabase...\n')

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10)
    console.log('✅ Contraseña hasheada')

    // Insertar usuario
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin@adam.cl',
          password: hashedPassword,
          role: 'admin',
          name: 'Administrador',
          email: 'admin@adam.cl',
          active: true
        }
      ])
      .select()

    if (error) {
      console.error('❌ Error creando usuario:', error.message)
      return
    }

    console.log('✅ Usuario admin creado exitosamente!')
    console.log('\n📋 Credenciales:')
    console.log('   Usuario: admin@adam.cl')
    console.log('   Contraseña: admin123')
    console.log('\n💡 Ya puedes iniciar sesión en /login')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

createAdminUser()
