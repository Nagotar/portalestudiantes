import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// PATCH - Toggle estado activo del curso (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params en Next.js 15
    const { id } = await params

    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden modificar cursos' },
        { status: 403 }
      )
    }

    // Obtener estado actual
    const currentCourse = await db.execute({
      sql: 'SELECT active FROM courses WHERE id = ?',
      args: [parseInt(id)]
    })

    if (currentCourse.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    const currentActive = currentCourse.rows[0].active === 1
    const newActive = !currentActive

    // Toggle estado activo
    await db.execute({
      sql: 'UPDATE courses SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [newActive ? 1 : 0, parseInt(id)]
    })

    return NextResponse.json({
      success: true,
      active: newActive,
      message: `Curso ${newActive ? 'activado' : 'desactivado'} correctamente`
    })

  } catch (error) {
    console.error('Error cambiando estado del curso:', error)
    return NextResponse.json(
      { error: 'Error al cambiar estado del curso' },
      { status: 500 }
    )
  }
}
