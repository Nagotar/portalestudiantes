import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
      args: [email.toLowerCase()]
    })

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password as string)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar que el usuario esté activo
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Usuario inactivo. Contacte al administrador' },
        { status: 403 }
      )
    }

    // Generar token JWT
    const token = await signToken({
      id: user.id as number,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string
    })

    // Determinar URL de redirección según rol
    let redirectUrl = '/'
    if (user.role === 'admin') {
      redirectUrl = '/admin'
    } else if (user.role === 'estudiante') {
      redirectUrl = '/estudiante'
    }

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      redirectUrl
    })

    // Establecer cookie con el token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8 // 8 horas
    })

    return response

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
