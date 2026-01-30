import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyNDYyMjAsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.mAItLY2fa8sY_axrngYz5SAhXVbe6170VyRyV5du94whSrv708gJBvcQ991f4b1p-COIDzcZKlikla-qy016CQ'
})

async function createSatisfactionSurveysTables() {
  try {
    console.log('🔧 Creando tablas de encuestas de satisfacción...\n')

    // Tabla principal de encuestas
    console.log('📊 Creando tabla satisfaction_surveys...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS satisfaction_surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        course_id INTEGER,
        active INTEGER DEFAULT 1,
        required_for_certificate INTEGER DEFAULT 0,
        anonymous INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Tabla satisfaction_surveys creada\n')

    // Tabla de preguntas de la encuesta
    console.log('📝 Creando tabla satisfaction_survey_questions...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS satisfaction_survey_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_id INTEGER NOT NULL,
        section TEXT NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'scale',
        scale_min INTEGER DEFAULT 1,
        scale_max INTEGER DEFAULT 7,
        display_order INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (survey_id) REFERENCES satisfaction_surveys(id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Tabla satisfaction_survey_questions creada\n')

    // Tabla de respuestas de estudiantes
    console.log('📋 Creando tabla satisfaction_survey_responses...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS satisfaction_survey_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_id INTEGER NOT NULL,
        user_id INTEGER,
        course_id INTEGER,
        question_id INTEGER NOT NULL,
        rating INTEGER,
        text_response TEXT,
        recommend_course INTEGER,
        comments TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (survey_id) REFERENCES satisfaction_surveys(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES satisfaction_survey_questions(id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Tabla satisfaction_survey_responses creada\n')

    // Índices para optimizar consultas
    console.log('📑 Creando índices...')
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_surveys_course ON satisfaction_surveys(course_id)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_questions_survey ON satisfaction_survey_questions(survey_id)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_responses_survey ON satisfaction_survey_responses(survey_id)
    `)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_responses_user ON satisfaction_survey_responses(user_id)
    `)
    console.log('✅ Índices creados\n')

    // Crear encuesta predefinida con las preguntas del documento
    console.log('🌱 Creando encuesta predefinida...')
    
    const surveyResult = await db.execute(`
      INSERT INTO satisfaction_surveys (title, description, active, required_for_certificate)
      VALUES ('Encuesta de Satisfacción RC-ES-01 REV.05', 'Evaluación de módulos, instructor, infraestructura y satisfacción general', 1, 1)
    `)
    
    const surveyId = Number(surveyResult.lastInsertRowid)

    // Sección I: MÓDULOS Y CONTENIDOS
    const modulosQuestions = [
      'Los contenidos del módulo concuerdan con la temática del curso',
      'El módulo (temas y contenidos) cumplieron con sus expectativas',
      'Los contenidos entregados, cuentan con la profundidad necesaria y son aplicables en sus tareas actuales, permitiendo mejorarlas',
      'El material didáctico es adecuado para el curso',
      'La duración de la actividad de capacitación fue acorde a los objetivos del curso'
    ]

    for (let i = 0; i < modulosQuestions.length; i++) {
      await db.execute({
        sql: `INSERT INTO satisfaction_survey_questions 
              (survey_id, section, question_number, question_text, question_type, scale_min, scale_max, display_order)
              VALUES (?, 'MÓDULOS Y CONTENIDOS', ?, ?, 'scale', 1, 7, ?)`,
        args: [surveyId, i + 1, modulosQuestions[i], i + 1]
      })
    }

    // Sección II: INSTRUCTOR-EXPOSITOR
    const instructorQuestions = [
      'El (los) relator (es) conoce y maneja el tema expuesto',
      'El vocabulario utilizado por el relator es adecuado a los temas expuestos',
      'La exposición es dinámica e interactiva',
      'El relator utiliza medios técnicos de apoyo adecuados a la temática',
      'El relator cumple con los horarios establecidos'
    ]

    for (let i = 0; i < instructorQuestions.length; i++) {
      await db.execute({
        sql: `INSERT INTO satisfaction_survey_questions 
              (survey_id, section, question_number, question_text, question_type, scale_min, scale_max, display_order)
              VALUES (?, 'INSTRUCTOR-EXPOSITOR', ?, ?, 'scale', 1, 7, ?)`,
        args: [surveyId, i + 1, instructorQuestions[i], i + 6]
      })
    }

    // Sección III: INFRAESTRUCTURA
    const infraQuestions = [
      'La infraestructura es adecuada para el desarrollo de la actividad',
      'Las condiciones ambientales de la sala son adecuadas para el desarrollo de la actividad: ventilación, luminosidad y otros',
      'Las condiciones del terreno de trabajo práctico es adecuado a la actividad',
      'La maquinaria utilizada es adecuada para las actividades planificadas'
    ]

    for (let i = 0; i < infraQuestions.length; i++) {
      await db.execute({
        sql: `INSERT INTO satisfaction_survey_questions 
              (survey_id, section, question_number, question_text, question_type, scale_min, scale_max, display_order)
              VALUES (?, 'INFRAESTRUCTURA', ?, ?, 'scale', 1, 7, ?)`,
        args: [surveyId, i + 1, infraQuestions[i], i + 11]
      })
    }

    // Sección IV: SATISFACCIÓN (pregunta especial)
    await db.execute({
      sql: `INSERT INTO satisfaction_survey_questions 
            (survey_id, section, question_number, question_text, question_type, display_order)
            VALUES (?, 'SATISFACCIÓN', 1, 'Recomendaría el curso', 'boolean', 15)`,
      args: [surveyId]
    })

    console.log('✅ Encuesta predefinida creada con todas las preguntas\n')

    console.log('✨ ¡Tablas de encuestas de satisfacción creadas exitosamente!')
    console.log('\n📋 Tablas creadas:')
    console.log('  - satisfaction_surveys')
    console.log('  - satisfaction_survey_questions')
    console.log('  - satisfaction_survey_responses')
    console.log('\n📊 Encuesta predefinida:')
    console.log('  - Sección I: MÓDULOS Y CONTENIDOS (5 preguntas)')
    console.log('  - Sección II: INSTRUCTOR-EXPOSITOR (5 preguntas)')
    console.log('  - Sección III: INFRAESTRUCTURA (4 preguntas)')
    console.log('  - Sección IV: SATISFACCIÓN (1 pregunta)')
    console.log('  - Total: 15 preguntas')

  } catch (error) {
    console.error('❌ Error creando tablas:', error)
    throw error
  }
}

createSatisfactionSurveysTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
