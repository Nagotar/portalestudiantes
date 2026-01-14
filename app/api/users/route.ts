import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET /api/users - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden listar usuarios' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    let sql = 'SELECT id, email, name, role, status, created_at FROM users WHERE 1=1'
    const args: any[] = []

    if (role) {
      sql += ' AND role = ?'
      args.push(role)
    }

    if (status) {
      sql += ' AND status = ?'
      args.push(status)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await db.execute({
      sql,
      args
    })

    const users = result.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      status: row.status,
      createdAt: row.created_at
    }))

    return NextResponse.json({
      success: true,
      users,
      total: users.length
    })

  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST /api/users - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden crear usuarios' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, role, status } = body

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()]
    })

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const result = await db.execute({
      sql: `INSERT INTO users (name, email, password, role, status, created_at) 
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        name,
        email.toLowerCase(),
        hashedPassword,
        role || 'estudiante',
        status || 'active'
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.lastInsertRowid
    })

  } catch (error) {
    console.error('Error creando usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
