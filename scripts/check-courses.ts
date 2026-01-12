import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function checkCourses() {
  console.log('🔍 Verificando cursos en la base de datos...\n')

  try {
    // Obtener todos los cursos
    const allCourses = await db.execute('SELECT id, name, active, featured FROM courses')
    console.log(`📚 Total de cursos en la base de datos: ${allCourses.rows.length}`)
    
    if (allCourses.rows.length === 0) {
      console.log('⚠️  No hay cursos en la base de datos')
      return
    }

    console.log('\n📋 Lista de cursos:')
    allCourses.rows.forEach((course: any) => {
      const activeStatus = course.active === 1 ? '✅ Activo' : '❌ Inactivo'
      const featuredStatus = course.featured === 1 ? '⭐ Destacado' : '⚪ Normal'
      console.log(`  - ID: ${course.id} | ${course.name}`)
      console.log(`    ${activeStatus} | ${featuredStatus}`)
    })

    // Obtener cursos activos
    const activeCourses = await db.execute('SELECT COUNT(*) as count FROM courses WHERE active = 1')
    console.log(`\n✅ Cursos activos: ${activeCourses.rows[0].count}`)

    // Obtener cursos destacados
    const featuredCourses = await db.execute('SELECT COUNT(*) as count FROM courses WHERE featured = 1')
    console.log(`⭐ Cursos destacados: ${featuredCourses.rows[0].count}`)

    // Obtener cursos activos Y destacados
    const activeAndFeatured = await db.execute('SELECT COUNT(*) as count FROM courses WHERE active = 1 AND featured = 1')
    console.log(`🎯 Cursos activos Y destacados: ${activeAndFeatured.rows[0].count}`)

    if (activeAndFeatured.rows[0].count === 0) {
      console.log('\n⚠️  PROBLEMA: No hay cursos que sean activos Y destacados al mismo tiempo')
      console.log('💡 Solución: Marca al menos un curso como activo y destacado desde el panel de administración')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkCourses()
