import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Obtener usuario desde el token
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener datos actualizados del usuario
    const result = await db.execute({
      sql: 'SELECT id, email, name, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      args: [user.id]
    })

    const currentUser = result.rows[0]

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (currentUser.status !== 'active') {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        status: currentUser.status,
        createdAt: currentUser.created_at
      }
    })

  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
