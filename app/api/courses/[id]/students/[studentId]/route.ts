import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// DELETE /api/courses/[id]/students/[studentId] - Desasignar estudiante de un curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden desasignar estudiantes' },
        { status: 403 }
      )
    }

    const { id, studentId: studId } = await params
    const courseId = parseInt(id)
    const studentId = parseInt(studId)

    // Verificar que la matrícula existe
    const enrollmentCheck = await db.execute({
      sql: 'SELECT id FROM course_enrollments WHERE course_id = ? AND student_id = ?',
      args: [courseId, studentId]
    })

    if (enrollmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Matrícula no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar matrícula
    await db.execute({
      sql: 'DELETE FROM course_enrollments WHERE course_id = ? AND student_id = ?',
      args: [courseId, studentId]
    })

    return NextResponse.json({
      success: true,
      message: 'Estudiante desasignado del curso exitosamente'
    })

  } catch (error) {
    console.error('Error desasignando estudiante:', error)
    return NextResponse.json(
      { error: 'Error al desasignar estudiante del curso' },
      { status: 500 }
    )
  }
}
