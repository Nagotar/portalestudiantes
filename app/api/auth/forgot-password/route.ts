import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const result = await db.execute({
      sql: 'SELECT id, name, email FROM users WHERE email = ?',
      args: [email.toLowerCase()]
    })

    if (result.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, hemos notificado al administrador'
      })
    }

    const user = result.rows[0]

    // Registrar la solicitud de recuperación
    await db.execute({
      sql: `INSERT INTO password_reset_requests (user_id, user_email, user_name, status, created_at) 
            VALUES (?, ?, ?, 'pending', datetime('now'))`,
      args: [user.id, user.email, user.name]
    })

    return NextResponse.json({
      success: true,
      message: 'Hemos notificado al administrador sobre tu solicitud'
    })

  } catch (error) {
    console.error('Error en forgot-password:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
