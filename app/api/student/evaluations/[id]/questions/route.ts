import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (user.role !== 'estudiante') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo estudiantes pueden acceder.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const evaluationId = parseInt(id)

    // Verificar que el estudiante tiene acceso a esta evaluación
    const enrollmentCheck = await db.execute({
      sql: `SELECT ce.id 
        FROM course_evaluations ce
        INNER JOIN course_enrollments enr ON ce.course_id = enr.course_id
        WHERE ce.evaluation_id = ? AND enr.student_id = ?`,
      args: [evaluationId, user.id]
    })

    if (enrollmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta evaluación' },
        { status: 403 }
      )
    }

    // Obtener información de la evaluación
    const evaluationResult = await db.execute({
      sql: `SELECT 
        e.id,
        e.title,
        e.description,
        e.category,
        e.duration,
        e.total_points,
        c.name as course_name
      FROM evaluations e
      INNER JOIN course_evaluations ce ON e.id = ce.evaluation_id
      INNER JOIN courses c ON ce.course_id = c.id
      WHERE e.id = ? AND e.active = 1`,
      args: [evaluationId]
    })

    if (evaluationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    const evaluation = evaluationResult.rows[0]

    // Obtener preguntas de la evaluación
    const questionsResult = await db.execute({
      sql: `SELECT 
        id,
        type,
        question,
        options,
        correct_answer,
        points,
        order_num
      FROM questions
      WHERE evaluation_id = ?
      ORDER BY order_num ASC`,
      args: [evaluationId]
    })

    // Mapear preguntas al formato del frontend
    const questions = questionsResult.rows.map((q: any) => ({
      id: q.id,
      type: q.type, // 'multiple', 'true-false', 'open'
      question: q.question,
      options: q.options ? JSON.parse(q.options) : null,
      correctAnswer: q.correct_answer,
      points: q.points,
      orderNum: q.order_num
    }))

    return NextResponse.json({
      success: true,
      evaluation: {
        id: evaluation.id,
        title: evaluation.title,
        description: evaluation.description,
        category: evaluation.category,
        course: evaluation.course_name,
        duration: evaluation.duration,
        totalPoints: evaluation.total_points,
        totalQuestions: questions.length
      },
      questions
    })

  } catch (error) {
    console.error('Error obteniendo preguntas de evaluación:', error)
    return NextResponse.json(
      { error: 'Error al obtener las preguntas' },
      { status: 500 }
    )
  }
}
