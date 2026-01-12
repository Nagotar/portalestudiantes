import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(
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
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const materialId = parseInt(id)

    // Obtener course_id del material
    const materialResult = await db.execute({
      sql: 'SELECT course_id FROM course_materials WHERE id = ?',
      args: [materialId]
    })

    if (materialResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    const courseId = materialResult.rows[0].course_id

    // Verificar que el estudiante esté inscrito en el curso
    const enrollmentCheck = await db.execute({
      sql: 'SELECT id FROM course_enrollments WHERE student_id = ? AND course_id = ?',
      args: [user.id, courseId]
    })

    if (enrollmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 403 }
      )
    }

    // Marcar material como visto (INSERT OR REPLACE para evitar duplicados)
    await db.execute({
      sql: `INSERT INTO material_views (student_id, material_id, course_id, viewed_at, completed)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
        ON CONFLICT(student_id, material_id) 
        DO UPDATE SET viewed_at = CURRENT_TIMESTAMP, completed = 1`,
      args: [user.id, materialId, courseId]
    })

    return NextResponse.json({
      success: true,
      message: 'Material marcado como visto'
    })

  } catch (error) {
    console.error('Error marcando material como visto:', error)
    return NextResponse.json(
      { error: 'Error al marcar material como visto' },
      { status: 500 }
    )
  }
}
