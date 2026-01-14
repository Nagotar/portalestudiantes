import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// PUT /api/users/[id] - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden actualizar usuarios' },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, password, role, status } = body

    // Validaciones
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [userId]
    })

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el email ya está en uso por otro usuario
    const emailCheck = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? AND id != ?',
      args: [email.toLowerCase(), userId]
    })

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado por otro usuario' },
        { status: 400 }
      )
    }

    // Si se proporciona contraseña, validar y hashear
    let updateSql = 'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?'
    let updateArgs: any[] = [name, email.toLowerCase(), role, status, userId]

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        )
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      updateSql = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, status = ? WHERE id = ?'
      updateArgs = [name, email.toLowerCase(), hashedPassword, role, status, userId]
    }

    await db.execute({
      sql: updateSql,
      args: updateArgs
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden eliminar usuarios' },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // No permitir eliminar el propio usuario
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [userId]
    })

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar usuario
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [userId]
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
