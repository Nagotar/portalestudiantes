import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function createEvaluationsTables() {
  try {
    console.log('📝 Creando tablas de evaluaciones...\n')

    // Crear tabla de evaluaciones
    await client.execute(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        duration INTEGER NOT NULL,
        total_points INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_date TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla evaluations creada')

    // Crear tabla de preguntas
    await client.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evaluation_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('multiple', 'true-false', 'open')),
        question TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT,
        points INTEGER NOT NULL,
        order_num INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Tabla questions creada')

    // Crear índices
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_evaluations_active ON evaluations(active)
    `)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_evaluations_category ON evaluations(category)
    `)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_questions_evaluation_id ON questions(evaluation_id)
    `)
    console.log('✅ Índices creados')

    // Insertar datos de ejemplo
    console.log('\n📊 Insertando datos de ejemplo...')

    const eval1 = await client.execute({
      sql: `INSERT INTO evaluations (
        title, description, category, duration, total_points, 
        active, created_date, attempts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'Evaluación JavaScript Básico',
        'Prueba tus conocimientos fundamentales de JavaScript',
        'Programación',
        30,
        10,
        1,
        '2026-01-05',
        45
      ]
    })

    const eval1Id = Number(eval1.lastInsertRowid)

    await client.execute({
      sql: `INSERT INTO questions (
        evaluation_id, type, question, options, correct_answer, points, order_num
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        eval1Id,
        'multiple',
        '¿Qué es JavaScript?',
        JSON.stringify(['Un lenguaje de programación', 'Un framework', 'Una base de datos', 'Un editor de código']),
        '0',
        10,
        0
      ]
    })

    const eval2 = await client.execute({
      sql: `INSERT INTO evaluations (
        title, description, category, duration, total_points, 
        active, created_date, attempts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'React Hooks - Evaluación',
        'Evalúa tu comprensión de React Hooks',
        'Desarrollo Web',
        45,
        0,
        1,
        '2026-01-03',
        32
      ]
    })

    console.log('✅ Datos de ejemplo insertados')

    // Verificar datos
    const evaluations = await client.execute('SELECT * FROM evaluations')
    const questions = await client.execute('SELECT * FROM questions')

    console.log(`\n📋 Evaluaciones creadas: ${evaluations.rows.length}`)
    console.log(`❓ Preguntas creadas: ${questions.rows.length}`)

    console.log('\n✅ Tablas de evaluaciones creadas exitosamente!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.close()
  }
}

createEvaluationsTables()
