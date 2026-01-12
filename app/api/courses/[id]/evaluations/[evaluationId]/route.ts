import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// DELETE /api/courses/[id]/evaluations/[evaluationId] - Desasignar evaluación de un curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evaluationId: string }> }
) {
  try {
    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden desasignar evaluaciones' },
        { status: 403 }
      )
    }

    const { id, evaluationId: evalId } = await params
    const courseId = parseInt(id)
    const evaluationId = parseInt(evalId)

    // Verificar que la asignación existe
    const assignmentCheck = await db.execute({
      sql: 'SELECT id FROM course_evaluations WHERE course_id = ? AND evaluation_id = ?',
      args: [courseId, evaluationId]
    })

    if (assignmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar asignación
    await db.execute({
      sql: 'DELETE FROM course_evaluations WHERE course_id = ? AND evaluation_id = ?',
      args: [courseId, evaluationId]
    })

    return NextResponse.json({
      success: true,
      message: 'Evaluación desasignada del curso exitosamente'
    })

  } catch (error) {
    console.error('Error desasignando evaluación:', error)
    return NextResponse.json(
      { error: 'Error al desasignar evaluación del curso' },
      { status: 500 }
    )
  }
}
