import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/student/evaluations - Obtener evaluaciones del estudiante
export async function GET(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que sea estudiante
    if (user.role !== 'estudiante') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo estudiantes pueden acceder.' },
        { status: 403 }
      )
    }

    // Obtener cursos del estudiante
    const enrollmentsResult = await db.execute({
      sql: 'SELECT course_id FROM course_enrollments WHERE student_id = ?',
      args: [user.id]
    })

    const courseIds = enrollmentsResult.rows.map((row: any) => row.course_id)

    if (courseIds.length === 0) {
      return NextResponse.json({
        success: true,
        evaluations: [],
        stats: {
          total: 0,
          disponibles: 0,
          completadas: 0,
          bloqueadas: 0
        }
      })
    }

    // Obtener evaluaciones asignadas a los cursos del estudiante
    const placeholders = courseIds.map(() => '?').join(',')
    const evaluationsResult = await db.execute({
      sql: `SELECT 
        e.id,
        e.title,
        e.description,
        e.category,
        e.duration,
        e.total_points,
        e.active,
        ce.course_id,
        c.name as course_name
      FROM course_evaluations ce
      INNER JOIN evaluations e ON ce.evaluation_id = e.id
      INNER JOIN courses c ON ce.course_id = c.id
      WHERE ce.course_id IN (${placeholders}) AND e.active = 1
      ORDER BY ce.course_id, e.title ASC`,
      args: courseIds
    })

    const evaluations = evaluationsResult.rows

    // Para cada evaluación, obtener intentos del estudiante
    const evaluationsWithAttempts = await Promise.all(
      evaluations.map(async (evaluation: any) => {
        // Contar total de preguntas de la evaluación
        const questionsResult = await db.execute({
          sql: 'SELECT COUNT(*) as total FROM questions WHERE evaluation_id = ?',
          args: [evaluation.id]
        })
        const totalQuestions = questionsResult.rows[0]?.total || 0

        // Obtener intentos del estudiante para esta evaluación
        const attemptsResult = await db.execute({
          sql: `SELECT 
            id,
            score,
            passed,
            completed_at,
            started_at
          FROM student_evaluations
          WHERE student_id = ? AND evaluation_id = ?
          ORDER BY completed_at DESC`,
          args: [user.id, evaluation.id]
        })

        const attempts = attemptsResult.rows
        const totalAttempts = attempts.length
        const bestAttempt = attempts.length > 0 
          ? attempts.reduce((best: any, current: any) => 
              (Number(current.score) > Number(best.score)) ? current : best
            )
          : null

        // Determinar estado de la evaluación
        let status: 'disponible' | 'completada' | 'bloqueada' = 'disponible'
        
        // Determinar tipo basado en categoría (temporal hasta agregar columna type)
        const evaluationType = evaluation.category.toLowerCase().includes('final') ? 'final' : 'practica'
        
        if (bestAttempt && bestAttempt.passed) {
          status = 'completada'
        }

        // Configurar intentos máximos
        const maxAttempts = evaluationType === 'final' ? 1 : 999
        
        // Bloquear si es evaluación final y no ha completado las de práctica del mismo curso
        if (evaluationType === 'final' && !bestAttempt?.passed) {
          // Verificar si hay evaluaciones de práctica en el mismo curso
          const practiceEvals = evaluations.filter((e: any) => 
            e.course_id === evaluation.course_id && 
            !e.category.toLowerCase().includes('final')
          )
          
          if (practiceEvals.length > 0) {
            // Por ahora, permitir acceso (se puede mejorar con lógica de completitud)
            // status = 'bloqueada'
          }
        }
        
        // Bloquear si alcanzó el máximo de intentos sin aprobar
        if (totalAttempts >= maxAttempts && !bestAttempt?.passed) {
          status = 'bloqueada'
        }

        return {
          id: evaluation.id,
          title: evaluation.title,
          description: evaluation.description,
          type: evaluationType,
          course: evaluation.course_name,
          courseId: evaluation.course_id,
          duration: evaluation.duration,
          questions: totalQuestions,
          passingScore: 70, // Valor por defecto
          attempts: totalAttempts,
          maxAttempts: maxAttempts,
          bestScore: bestAttempt ? Number(bestAttempt.score) : undefined,
          status: status,
          lastAttemptDate: bestAttempt ? bestAttempt.completed_at : undefined
        }
      })
    )

    // Calcular estadísticas
    const stats = {
      total: evaluationsWithAttempts.length,
      disponibles: evaluationsWithAttempts.filter(e => e.status === 'disponible').length,
      completadas: evaluationsWithAttempts.filter(e => e.status === 'completada').length,
      bloqueadas: evaluationsWithAttempts.filter(e => e.status === 'bloqueada').length
    }

    return NextResponse.json({
      success: true,
      evaluations: evaluationsWithAttempts,
      stats
    })

  } catch (error: any) {
    console.error('Error obteniendo evaluaciones del estudiante:', error)
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones', details: error.message },
      { status: 500 }
    )
  }
}
