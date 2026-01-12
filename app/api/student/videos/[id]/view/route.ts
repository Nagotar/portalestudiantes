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
    const videoId = parseInt(id)

    // Obtener curso_id del video
    const videoResult = await db.execute({
      sql: 'SELECT curso_id FROM videos WHERE id = ?',
      args: [videoId]
    })

    if (videoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      )
    }

    const courseId = videoResult.rows[0].curso_id

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

    // Marcar video como visto (INSERT OR REPLACE para evitar duplicados)
    await db.execute({
      sql: `INSERT INTO video_views (student_id, video_id, course_id, viewed_at, completed)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
        ON CONFLICT(student_id, video_id) 
        DO UPDATE SET viewed_at = CURRENT_TIMESTAMP, completed = 1`,
      args: [user.id, videoId, courseId]
    })

    return NextResponse.json({
      success: true,
      message: 'Video marcado como visto'
    })

  } catch (error) {
    console.error('Error marcando video como visto:', error)
    return NextResponse.json(
      { error: 'Error al marcar video como visto' },
      { status: 500 }
    )
  }
}
