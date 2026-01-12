import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/courses/[id]/evaluations - Listar evaluaciones asignadas a un curso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id)

    // Obtener evaluaciones asignadas con su información
    const result = await db.execute({
      sql: `
        SELECT 
          ce.id as assignment_id,
          ce.order_num,
          ce.required,
          ce.available_from,
          ce.available_until,
          ce.created_at as assigned_at,
          e.id as evaluation_id,
          e.title,
          e.description,
          e.duration,
          e.active
        FROM course_evaluations ce
        INNER JOIN evaluations e ON ce.evaluation_id = e.id
        WHERE ce.course_id = ?
        ORDER BY ce.order_num ASC, ce.created_at DESC
      `,
      args: [courseId]
    })

    const evaluations = result.rows.map((row: any) => ({
      assignmentId: row.assignment_id,
      evaluationId: row.evaluation_id,
      title: row.title,
      description: row.description,
      duration: row.duration,
      passingScore: 70, // Valor por defecto
      orderNum: row.order_num,
      required: row.required === 1,
      availableFrom: row.available_from,
      availableUntil: row.available_until,
      active: row.active === 1,
      assignedAt: row.assigned_at
    }))

    return NextResponse.json({
      success: true,
      evaluations,
      total: evaluations.length
    })

  } catch (error) {
    console.error('Error obteniendo evaluaciones del curso:', error)
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones del curso' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/evaluations - Asignar evaluaciones a un curso
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden asignar evaluaciones' },
        { status: 403 }
      )
    }

    const { id } = await params
    const courseId = parseInt(id)
    const body = await request.json()
    const { evaluationIds, required = true } = body

    // Validar que se envíen IDs de evaluaciones
    if (!evaluationIds || !Array.isArray(evaluationIds) || evaluationIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un ID de evaluación' },
        { status: 400 }
      )
    }

    // Verificar que el curso existe
    const courseCheck = await db.execute({
      sql: 'SELECT id FROM courses WHERE id = ?',
      args: [courseId]
    })

    if (courseCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
      alreadyAssigned: [] as any[]
    }

    // Obtener el orden máximo actual
    const maxOrderResult = await db.execute({
      sql: 'SELECT MAX(order_num) as max_order FROM course_evaluations WHERE course_id = ?',
      args: [courseId]
    })
    let currentOrder = (maxOrderResult.rows[0]?.max_order as number) || 0

    // Asignar cada evaluación
    for (const evaluationId of evaluationIds) {
      try {
        // Verificar que la evaluación existe
        const evaluationCheck = await db.execute({
          sql: 'SELECT id, title FROM evaluations WHERE id = ?',
          args: [evaluationId]
        })

        if (evaluationCheck.rows.length === 0) {
          results.errors.push({
            evaluationId,
            error: 'Evaluación no encontrada'
          })
          continue
        }

        // Verificar si ya está asignada
        const assignmentCheck = await db.execute({
          sql: 'SELECT id FROM course_evaluations WHERE course_id = ? AND evaluation_id = ?',
          args: [courseId, evaluationId]
        })

        if (assignmentCheck.rows.length > 0) {
          results.alreadyAssigned.push({
            evaluationId,
            title: evaluationCheck.rows[0].title
          })
          continue
        }

        // Crear asignación
        currentOrder++
        await db.execute({
          sql: `
            INSERT INTO course_evaluations (
              course_id, evaluation_id, order_num, required
            ) VALUES (?, ?, ?, ?)
          `,
          args: [courseId, evaluationId, currentOrder, required ? 1 : 0]
        })

        results.success.push({
          evaluationId,
          title: evaluationCheck.rows[0].title
        })

      } catch (error) {
        console.error(`Error asignando evaluación ${evaluationId}:`, error)
        results.errors.push({
          evaluationId,
          error: 'Error al asignar evaluación'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Proceso de asignación completado',
      results
    }, { status: 201 })

  } catch (error) {
    console.error('Error asignando evaluaciones:', error)
    return NextResponse.json(
      { error: 'Error al asignar evaluaciones al curso' },
      { status: 500 }
    )
  }
}
