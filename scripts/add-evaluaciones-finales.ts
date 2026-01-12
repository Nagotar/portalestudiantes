import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function addEvaluacionesFinales() {
  try {
    console.log('📝 Agregando campos para evaluaciones finales...\n')

    const tableInfo = await client.execute('PRAGMA table_info(evaluations)')
    
    // Verificar y agregar tipo_evaluacion
    const tipoExists = tableInfo.rows.some(row => row.name === 'tipo_evaluacion')
    if (!tipoExists) {
      await client.execute(`
        ALTER TABLE evaluations
        ADD COLUMN tipo_evaluacion TEXT DEFAULT 'practica' CHECK(tipo_evaluacion IN ('practica', 'final'))
      `)
      console.log('✅ Columna tipo_evaluacion agregada')
    } else {
      console.log('⚠️  Columna tipo_evaluacion ya existe')
    }

    // Verificar y agregar fecha_habilitacion
    const fechaExists = tableInfo.rows.some(row => row.name === 'fecha_habilitacion')
    if (!fechaExists) {
      await client.execute(`
        ALTER TABLE evaluations
        ADD COLUMN fecha_habilitacion TEXT
      `)
      console.log('✅ Columna fecha_habilitacion agregada')
    } else {
      console.log('⚠️  Columna fecha_habilitacion ya existe')
    }

    // Verificar y agregar fecha_cierre
    const cierreExists = tableInfo.rows.some(row => row.name === 'fecha_cierre')
    if (!cierreExists) {
      await client.execute(`
        ALTER TABLE evaluations
        ADD COLUMN fecha_cierre TEXT
      `)
      console.log('✅ Columna fecha_cierre agregada')
    } else {
      console.log('⚠️  Columna fecha_cierre ya existe')
    }

    // Crear índices
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_evaluations_tipo ON evaluations(tipo_evaluacion)
    `)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_evaluations_fecha_habilitacion ON evaluations(fecha_habilitacion)
    `)
    console.log('✅ Índices creados')

    // Actualizar evaluaciones existentes a tipo 'practica'
    await client.execute(`
      UPDATE evaluations 
      SET tipo_evaluacion = 'practica' 
      WHERE tipo_evaluacion IS NULL
    `)
    console.log('✅ Evaluaciones existentes marcadas como prácticas')

    // Mostrar estructura actualizada
    console.log('\n📋 Estructura actualizada de evaluations:')
    const updatedTableInfo = await client.execute('PRAGMA table_info(evaluations)')
    updatedTableInfo.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type}${row.notnull ? ' NOT NULL' : ''}${row.dflt_value ? ` DEFAULT ${row.dflt_value}` : ''}`)
    })

    console.log('\n✅ Migración completada exitosamente!')
    console.log('💡 Tipos de evaluación:')
    console.log('   - practica: Evaluaciones de práctica disponibles siempre')
    console.log('   - final: Evaluaciones finales habilitadas por fecha')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.close()
  }
}

addEvaluacionesFinales()
