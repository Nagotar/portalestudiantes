import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function addCursoIdColumn() {
  try {
    console.log('🔧 Agregando campo curso_id a la tabla videos...')

    // Verificar si la columna ya existe
    const tableInfo = await client.execute('PRAGMA table_info(videos)')
    const columnExists = tableInfo.rows.some((row: any) => row.name === 'curso_id')

    if (columnExists) {
      console.log('✅ La columna curso_id ya existe en la tabla videos')
      return
    }

    // Agregar la columna curso_id (puede ser NULL para videos informativos)
    await client.execute(`
      ALTER TABLE videos 
      ADD COLUMN curso_id INTEGER
    `)

    console.log('✅ Columna curso_id agregada exitosamente')

    // Crear índice para mejorar el rendimiento de las consultas
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_videos_curso_id ON videos(curso_id)
    `)

    console.log('✅ Índice creado para curso_id')

    // Mostrar estructura actualizada
    const updatedTableInfo = await client.execute('PRAGMA table_info(videos)')
    console.log('\n📋 Estructura actualizada de la tabla videos:')
    updatedTableInfo.rows.forEach((row: any) => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : 'NULL'}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.close()
  }
}

addCursoIdColumn()
