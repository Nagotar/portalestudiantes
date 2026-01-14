import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyNDYyMjAsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.mAItLY2fa8sY_axrngYz5SAhXVbe6170VyRyV5du94whSrv708gJBvcQ991f4b1p-COIDzcZKlikla-qy016CQ'
})

async function createNewAdmin() {
  try {
    console.log('🔐 Creando nuevo usuario administrador...\n')

    // Datos del nuevo admin (puedes modificar estos valores)
    const adminData = {
      name: 'Thomas Landeros',
      email: 'thomas@adam.cl',
      password: 'thomas123456', // Cambiar por una contraseña segura
      role: 'admin',
      status: 'active'
    }

    // Verificar si el email ya existe
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [adminData.email]
    })

    if (existingUser.rows.length > 0) {
      console.log('⚠️  El email ya está registrado')
      console.log('   Email:', adminData.email)
      console.log('\n💡 Cambia el email en el script y vuelve a ejecutar')
      return
    }

    // Hashear contraseña
    console.log('🔒 Hasheando contraseña...')
    const hashedPassword = await bcrypt.hash(adminData.password, 10)

    // Insertar usuario
    console.log('💾 Insertando usuario en la base de datos...')
    const result = await db.execute({
      sql: `INSERT INTO users (name, email, password, role, status, created_at) 
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        adminData.name,
        adminData.email,
        hashedPassword,
        adminData.role,
        adminData.status
      ]
    })

    console.log('\n✅ Usuario administrador creado exitosamente!')
    console.log('\n📋 Credenciales:')
    console.log('   Nombre:', adminData.name)
    console.log('   Email:', adminData.email)
    console.log('   Contraseña:', adminData.password)
    console.log('   Rol:', adminData.role)
    console.log('   Estado:', adminData.status)
    console.log('\n💡 Ya puedes iniciar sesión en https://www.adam.cl/login')
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createNewAdmin()
