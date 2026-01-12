import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA'
})

async function verifyData() {
  console.log('🔍 Verificando datos en la base de datos...\n')

  try {
    // Verificar cursos
    const courses = await db.execute('SELECT id, name, active, featured FROM courses')
    console.log('📚 CURSOS:')
    console.log(`Total: ${courses.rows.length}`)
    courses.rows.forEach((course: any) => {
      const activeStatus = course.active === 1 ? '✅ Activo' : '❌ Inactivo'
      const featuredStatus = course.featured === 1 ? '⭐ Destacado' : '⚪ Normal'
      console.log(`  - ${course.name} | ${activeStatus} | ${featuredStatus}`)
    })

    const activeFeaturedCourses = await db.execute(
      'SELECT COUNT(*) as count FROM courses WHERE active = 1 AND featured = 1'
    )
    console.log(`\n🎯 Cursos activos Y destacados (mostrados en portada): ${activeFeaturedCourses.rows[0].count}\n`)

    // Verificar documentos
    const documents = await db.execute('SELECT id, title, license_type, active FROM documents')
    console.log('📄 DOCUMENTOS:')
    console.log(`Total: ${documents.rows.length}`)
    documents.rows.forEach((doc: any) => {
      const activeStatus = doc.active === 1 ? '✅ Activo' : '❌ Inactivo'
      console.log(`  - ${doc.title} (${doc.license_type}) | ${activeStatus}`)
    })

    const activeDocuments = await db.execute(
      'SELECT COUNT(*) as count FROM documents WHERE active = 1'
    )
    console.log(`\n🎯 Documentos activos (mostrados en portada): ${activeDocuments.rows[0].count}\n`)

    // Verificar solicitudes de información
    const infoRequests = await db.execute('SELECT COUNT(*) as count FROM info_requests')
    console.log('📧 SOLICITUDES DE INFORMACIÓN:')
    console.log(`Total: ${infoRequests.rows[0].count}\n`)

    console.log('✅ Verificación completada!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyData()
