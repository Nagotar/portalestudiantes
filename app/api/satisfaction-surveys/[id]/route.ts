import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, courseId, active, requiredForCertificate, anonymous } = body

    await db.execute({
      sql: `UPDATE satisfaction_surveys 
            SET title = ?, description = ?, course_id = ?, active = ?, 
                required_for_certificate = ?, anonymous = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [
        title,
        description || null,
        courseId || null,
        active ? 1 : 0,
        requiredForCertificate ? 1 : 0,
        anonymous ? 1 : 0,
        params.id
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Encuesta actualizada exitosamente'
    })
  } catch (error: any) {
    console.error('Error actualizando encuesta:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar encuesta', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.execute({
      sql: 'DELETE FROM satisfaction_surveys WHERE id = ?',
      args: [params.id]
    })

    return NextResponse.json({
      success: true,
      message: 'Encuesta eliminada exitosamente'
    })
  } catch (error: any) {
    console.error('Error eliminando encuesta:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar encuesta', details: error.message },
      { status: 500 }
    )
  }
}
