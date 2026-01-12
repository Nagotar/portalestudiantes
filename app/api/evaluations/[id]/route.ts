import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// GET /api/evaluations/[id] - Obtener evaluación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await client.execute({
      sql: 'SELECT * FROM evaluations WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    const row = result.rows[0]

    // Obtener preguntas
    const questionsResult = await client.execute({
      sql: 'SELECT * FROM questions WHERE evaluation_id = ? ORDER BY order_num ASC, id ASC',
      args: [id]
    })

    const questions = questionsResult.rows.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options ? JSON.parse(q.options as string) : undefined,
      correctAnswer: q.correct_answer ? (q.type === 'multiple' ? parseInt(q.correct_answer as string) : q.correct_answer) : undefined,
      points: q.points
    }))

    const evaluation = {
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

    return NextResponse.json({ evaluation })
  } catch (error: any) {
    console.error('Error fetching evaluation:', error)
    return NextResponse.json(
      { error: 'Error al obtener evaluación' },
      { status: 500 }
    )
  }
}

// PUT /api/evaluations/[id] - Actualizar evaluación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      active
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

    // Actualizar evaluación
    await client.execute({
      sql: `
        UPDATE evaluations SET
          title = ?,
          description = ?,
          category = ?,
          curso_id = ?,
          tipo_evaluacion = ?,
          fecha_habilitacion = ?,
          fecha_cierre = ?,
          duration = ?,
          total_points = ?,
          active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
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
        id
      ]
    })

    // Eliminar preguntas existentes
    await client.execute({
      sql: 'DELETE FROM questions WHERE evaluation_id = ?',
      args: [id]
    })

    // Insertar nuevas preguntas
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
            id,
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
      message: 'Evaluación actualizada exitosamente'
    })

  } catch (error: any) {
    console.error('Error updating evaluation:', error)
    return NextResponse.json(
      { error: 'Error al actualizar evaluación' },
      { status: 500 }
    )
  }
}

// DELETE /api/evaluations/[id] - Eliminar evaluación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que existe
    const result = await client.execute({
      sql: 'SELECT id FROM evaluations WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar evaluación (las preguntas se eliminan en cascada)
    await client.execute({
      sql: 'DELETE FROM evaluations WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({
      message: 'Evaluación eliminada exitosamente'
    })

  } catch (error: any) {
    console.error('Error deleting evaluation:', error)
    return NextResponse.json(
      { error: 'Error al eliminar evaluación' },
      { status: 500 }
    )
  }
}
