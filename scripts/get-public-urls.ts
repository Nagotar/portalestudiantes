import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyNDYyMjAsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.mAItLY2fa8sY_axrngYz5SAhXVbe6170VyRyV5du94whSrv708gJBvcQ991f4b1p-COIDzcZKlikla-qy016CQ'
})

async function getPublicUrls() {
  try {
    console.log('🔍 Obteniendo URLs públicas del sitio...\n')

    // Obtener cursos activos
    const coursesResult = await db.execute({
      sql: 'SELECT id, title FROM courses WHERE active = 1',
      args: []
    })
    
    console.log('📚 Cursos activos:')
    console.log(`   Total: ${coursesResult.rows.length}`)
    coursesResult.rows.forEach((course: any) => {
      console.log(`   - /estudiante/curso/${course.id} (${course.title})`)
    })

    // Obtener documentos activos
    const documentsResult = await db.execute({
      sql: 'SELECT id, title FROM documents WHERE active = 1',
      args: []
    })
    
    console.log('\n📄 Documentos activos:')
    console.log(`   Total: ${documentsResult.rows.length}`)
    documentsResult.rows.forEach((doc: any) => {
      console.log(`   - /documentos/${doc.id} (${doc.title})`)
    })

    // Obtener evaluaciones activas
    const evaluationsResult = await db.execute({
      sql: 'SELECT id, title FROM evaluations WHERE active = 1',
      args: []
    })
    
    console.log('\n📝 Evaluaciones activas:')
    console.log(`   Total: ${evaluationsResult.rows.length}`)
    evaluationsResult.rows.forEach((evaluation: any) => {
      console.log(`   - /estudiante/evaluacion/${evaluation.id} (${evaluation.title})`)
    })

    console.log('\n📊 Resumen:')
    console.log(`   Páginas estáticas: 3 (/, /login, /estudiante)`)
    console.log(`   Cursos: ${coursesResult.rows.length}`)
    console.log(`   Documentos: ${documentsResult.rows.length}`)
    console.log(`   Evaluaciones: ${evaluationsResult.rows.length}`)
    console.log(`   TOTAL: ${3 + coursesResult.rows.length + documentsResult.rows.length + evaluationsResult.rows.length} páginas`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

getPublicUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
