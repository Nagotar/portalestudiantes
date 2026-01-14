import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { signToken } from '@/lib/auth'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'
import { logAuditEvent, AuditActions } from '@/lib/audit-log'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    // Debug: Log del valor de rememberMe
    console.log('Login attempt - rememberMe:', rememberMe, 'type:', typeof rememberMe)

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Rate limiting por IP y email
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `login:${ip}:${email.toLowerCase()}`
    
    const rateLimit = checkRateLimit(rateLimitKey, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000 // 5 intentos en 15 minutos
    })

    if (!rateLimit.allowed) {
      const minutesRemaining = Math.ceil((rateLimit.resetTime - Date.now()) / 60000)
      return NextResponse.json(
        { 
          error: `Demasiados intentos fallidos. Intenta nuevamente en ${minutesRemaining} minutos.`,
          retryAfter: rateLimit.resetTime
        },
        { status: 429 }
      )
    }

    // Buscar usuario por email
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
      args: [email.toLowerCase()]
    })

    const user = result.rows[0]

    if (!user) {
      // Log intento fallido
      logAuditEvent({
        userEmail: email,
        action: AuditActions.LOGIN_FAILED,
        resource: 'auth',
        details: { reason: 'user_not_found' },
        ip,
        userAgent: request.headers.get('user-agent') || undefined,
        success: false
      })
      
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password as string)

    if (!isValidPassword) {
      // Log intento fallido
      logAuditEvent({
        userId: user.id as number,
        userEmail: email,
        action: AuditActions.LOGIN_FAILED,
        resource: 'auth',
        details: { reason: 'invalid_password' },
        ip,
        userAgent: request.headers.get('user-agent') || undefined,
        success: false
      })
      
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar que el usuario esté activo
    if (user.status !== 'active') {
      // Log intento fallido
      logAuditEvent({
        userId: user.id as number,
        userEmail: email,
        action: AuditActions.LOGIN_FAILED,
        resource: 'auth',
        details: { reason: 'user_inactive' },
        ip,
        userAgent: request.headers.get('user-agent') || undefined,
        success: false
      })
      
      return NextResponse.json(
        { error: 'Usuario inactivo. Contacte al administrador' },
        { status: 403 }
      )
    }

    // Generar token JWT con duración según rememberMe
    const expiresIn = rememberMe ? '30d' : '8h'
    console.log('Token expiration:', expiresIn, 'rememberMe:', rememberMe)
    
    const token = await signToken({
      id: user.id as number,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string
    }, expiresIn)

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
    // Si rememberMe es true, la sesión dura 30 días, sino 8 horas
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8 // 30 días o 8 horas
    console.log('Cookie maxAge:', maxAge, 'seconds (', maxAge / 3600, 'hours )')
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge
    })

    // Resetear rate limit en login exitoso
    resetRateLimit(rateLimitKey)

    // Log login exitoso
    logAuditEvent({
      userId: user.id as number,
      userEmail: email,
      action: AuditActions.LOGIN_SUCCESS,
      resource: 'auth',
      details: { role: user.role },
      ip,
      userAgent: request.headers.get('user-agent') || undefined,
      success: true
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
