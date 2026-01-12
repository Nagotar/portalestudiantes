import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// GET /api/evaluations - Listar evaluaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const category = searchParams.get('category')
    const includeQuestions = searchParams.get('includeQuestions') === 'true'

    let sql = 'SELECT * FROM evaluations WHERE 1=1'
    const args: any[] = []

    if (active === 'true') {
      sql += ' AND active = 1'
    }

    if (category) {
      sql += ' AND category = ?'
      args.push(category)
    }

    sql += ' ORDER BY created_date DESC, id DESC'

    const result = await client.execute({
      sql,
      args
    })

    const evaluations = await Promise.all(result.rows.map(async (row) => {
      let questions: any[] = []
      
      if (includeQuestions) {
        const questionsResult = await client.execute({
          sql: 'SELECT * FROM questions WHERE evaluation_id = ? ORDER BY order_num ASC, id ASC',
          args: [row.id]
        })

        questions = questionsResult.rows.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.parse(q.options as string) : undefined,
          correctAnswer: q.correct_answer ? (q.type === 'multiple' ? parseInt(q.correct_answer as string) : q.correct_answer) : undefined,
          points: q.points
        }))
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        cursoId: row.curso_id,
        tipoEvaluacion: row.tipo_evaluacion || 'practica',
        fechaHabilitacion: row.fecha_habilitacion,
        fechaCierre: row.fecha_cierre,
        duration: row.duration,
        totalPoints: row.total_points,
        questions,
        active: Boolean(row.active),
        createdDate: row.created_date,
        attempts: row.attempts,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    }))

    return NextResponse.json({ evaluations })
  } catch (error: any) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
      { status: 500 }
    )
  }
}

// POST /api/evaluations - Crear nueva evaluación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      cursoId,
      tipoEvaluacion = 'practica',
      fechaHabilitacion,
      fechaCierre,
      duration,
      totalPoints,
      questions = [],
      active = true,
      createdDate
    } = body

    // Validaciones
    if (!title || !description || !duration) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (!cursoId) {
      return NextResponse.json(
        { error: 'Debe seleccionar un curso para la evaluación' },
        { status: 400 }
      )
    }

    // Validar fechas para evaluaciones finales
    if (tipoEvaluacion === 'final') {
      if (!fechaHabilitacion || !fechaCierre) {
        return NextResponse.json(
          { error: 'Las evaluaciones finales requieren fecha de habilitación y cierre' },
          { status: 400 }
        )
      }
      if (new Date(fechaHabilitacion) >= new Date(fechaCierre)) {
        return NextResponse.json(
          { error: 'La fecha de cierre debe ser posterior a la fecha de habilitación' },
          { status: 400 }
        )
      }
    }

    // Insertar evaluación
    const result = await client.execute({
      sql: `
        INSERT INTO evaluations (
          title, description, category, curso_id, tipo_evaluacion, 
          fecha_habilitacion, fecha_cierre, duration, total_points,
          active, created_date, attempts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `,
      args: [
        title,
        description,
        category || '',
        cursoId,
        tipoEvaluacion,
        fechaHabilitacion || null,
        fechaCierre || null,
        duration,
        totalPoints || 0,
        active ? 1 : 0,
        createdDate || new Date().toISOString().split('T')[0]
      ]
    })

    const evaluationId = Number(result.lastInsertRowid)

    // Insertar preguntas
    if (questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await client.execute({
          sql: `
            INSERT INTO questions (
              evaluation_id, type, question, options, correct_answer, points, order_num
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            evaluationId,
            q.type,
            q.question,
            q.options ? JSON.stringify(q.options) : null,
            q.correctAnswer !== undefined ? String(q.correctAnswer) : null,
            q.points,
            i
          ]
        })
      }
    }

    return NextResponse.json({
      message: 'Evaluación creada exitosamente',
      evaluationId
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Error al crear evaluación' },
      { status: 500 }
    )
  }
}
