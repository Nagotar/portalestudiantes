import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

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
    } else {
      // Por defecto, solo usuarios activos
      sql += ' AND status = ?'
      args.push('active')
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
