import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(
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
    const { userId, newPassword } = body

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'userId y newPassword son requeridos' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña del usuario
    await db.execute({
      sql: 'UPDATE users SET password = ? WHERE id = ?',
      args: [hashedPassword, userId]
    })

    // Marcar la solicitud como resuelta
    await db.execute({
      sql: `UPDATE password_reset_requests 
            SET status = 'resolved', resolved_at = datetime('now'), resolved_by = ? 
            WHERE id = ?`,
      args: [user.id, requestId]
    })

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada y solicitud resuelta'
    })

  } catch (error) {
    console.error('Error asignando contraseña:', error)
    return NextResponse.json(
      { error: 'Error al asignar contraseña' },
      { status: 500 }
    )
  }
}
