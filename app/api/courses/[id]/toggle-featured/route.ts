import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// PATCH - Toggle estado destacado del curso (solo admin)
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
      sql: 'SELECT featured FROM courses WHERE id = ?',
      args: [parseInt(id)]
    })

    if (currentCourse.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    const currentFeatured = currentCourse.rows[0].featured === 1
    const newFeatured = !currentFeatured

    // Toggle estado destacado
    await db.execute({
      sql: 'UPDATE courses SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [newFeatured ? 1 : 0, parseInt(id)]
    })

    return NextResponse.json({
      success: true,
      featured: newFeatured,
      message: `Curso ${newFeatured ? 'marcado como destacado' : 'removido de destacados'} correctamente`
    })

  } catch (error) {
    console.error('Error cambiando estado destacado del curso:', error)
    return NextResponse.json(
      { error: 'Error al cambiar estado destacado del curso' },
      { status: 500 }
    )
  }
}
