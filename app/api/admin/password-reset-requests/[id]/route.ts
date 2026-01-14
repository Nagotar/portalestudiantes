import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const requestId = parseInt(id)

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    await db.execute({
      sql: `UPDATE password_reset_requests 
            SET status = ?, resolved_at = datetime('now'), resolved_by = ? 
            WHERE id = ?`,
      args: [status, user.id, requestId]
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitud actualizada'
    })

  } catch (error) {
    console.error('Error actualizando solicitud:', error)
    return NextResponse.json(
      { error: 'Error al actualizar solicitud' },
      { status: 500 }
    )
  }
}
