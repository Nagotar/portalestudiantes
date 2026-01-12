import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// DELETE /api/courses/[id]/materials/[materialId] - Eliminar material de un curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden eliminar materiales' },
        { status: 403 }
      )
    }

    const { id, materialId: matId } = await params
    const courseId = parseInt(id)
    const materialId = parseInt(matId)

    // Verificar que el material existe
    const materialCheck = await db.execute({
      sql: 'SELECT id FROM course_materials WHERE id = ? AND course_id = ?',
      args: [materialId, courseId]
    })

    if (materialCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar material
    await db.execute({
      sql: 'DELETE FROM course_materials WHERE id = ? AND course_id = ?',
      args: [materialId, courseId]
    })

    return NextResponse.json({
      success: true,
      message: 'Material eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando material:', error)
    return NextResponse.json(
      { error: 'Error al eliminar material del curso' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id]/materials/[materialId] - Actualizar material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden actualizar materiales' },
        { status: 403 }
      )
    }

    const { id, materialId: matId } = await params
    const courseId = parseInt(id)
    const materialId = parseInt(matId)
    const body = await request.json()
    const { title, description, content, active } = body

    // Verificar que el material existe
    const materialCheck = await db.execute({
      sql: 'SELECT id FROM course_materials WHERE id = ? AND course_id = ?',
      args: [materialId, courseId]
    })

    if (materialCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar material
    await db.execute({
      sql: `
        UPDATE course_materials 
        SET title = ?, description = ?, content = ?, active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND course_id = ?
      `,
      args: [
        title,
        description || '',
        content,
        active ? 1 : 0,
        materialId,
        courseId
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Material actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error actualizando material:', error)
    return NextResponse.json(
      { error: 'Error al actualizar material del curso' },
      { status: 500 }
    )
  }
}
