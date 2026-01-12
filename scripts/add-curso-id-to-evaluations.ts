import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function addCursoIdToEvaluations() {
  try {
    console.log('📝 Modificando tabla evaluations...\n')

    // Verificar si la columna ya existe
    const tableInfo = await client.execute('PRAGMA table_info(evaluations)')
    const columnExists = tableInfo.rows.some(row => row.name === 'curso_id')

    if (columnExists) {
      console.log('⚠️  La columna curso_id ya existe en la tabla evaluations')
    } else {
      // Agregar columna curso_id
      await client.execute(`
        ALTER TABLE evaluations
        ADD COLUMN curso_id INTEGER
      `)
      console.log('✅ Columna curso_id agregada a evaluations')

      // Crear índice para curso_id
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_evaluations_curso_id ON evaluations(curso_id)
      `)
      console.log('✅ Índice idx_evaluations_curso_id creado')
    }

    // Mostrar estructura actualizada
    console.log('\n📋 Estructura de la tabla evaluations:')
    const updatedTableInfo = await client.execute('PRAGMA table_info(evaluations)')
    updatedTableInfo.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type}${row.notnull ? ' NOT NULL' : ''}${row.dflt_value ? ` DEFAULT ${row.dflt_value}` : ''}`)
    })

    // Mostrar cursos disponibles
    console.log('\n📚 Cursos disponibles:')
    const courses = await client.execute('SELECT id, name, category FROM courses WHERE active = 1')
    courses.rows.forEach(course => {
      console.log(`  - ID ${course.id}: ${course.name} (${course.category})`)
    })

    console.log('\n✅ Migración completada exitosamente!')
    console.log('💡 Ahora las evaluaciones pueden ser asignadas a cursos específicos')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.close()
  }
}

addCursoIdToEvaluations()
