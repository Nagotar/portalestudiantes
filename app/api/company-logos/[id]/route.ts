import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET - Obtener un logo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.execute({
      sql: 'SELECT * FROM company_logos WHERE id = ?',
      args: [parseInt(id)]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Logo no encontrado' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const logo = {
      id: row.id,
      name: row.name,
      logo: row.logo,
      active: row.active === 1,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      logo
    })

  } catch (error) {
    console.error('Error obteniendo logo:', error)
    return NextResponse.json(
      { error: 'Error al obtener logo' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un logo (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden actualizar logos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      logo,
      active,
      displayOrder
    } = body

    // Verificar que el logo existe
    const existingLogo = await db.execute({
      sql: 'SELECT id FROM company_logos WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingLogo.rows.length === 0) {
      return NextResponse.json(
        { error: 'Logo no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar logo
    await db.execute({
      sql: `UPDATE company_logos SET 
        name = ?, 
        logo = ?, 
        active = ?,
        display_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        name,
        logo,
        active !== false ? 1 : 0,
        displayOrder || 0,
        parseInt(id)
      ]
    })

    // Obtener logo actualizado
    const updatedLogo = await db.execute({
      sql: 'SELECT * FROM company_logos WHERE id = ?',
      args: [parseInt(id)]
    })

    const row = updatedLogo.rows[0]
    const logoData = {
      id: row.id,
      name: row.name,
      logo: row.logo,
      active: row.active === 1,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      logo: logoData
    })

  } catch (error) {
    console.error('Error actualizando logo:', error)
    return NextResponse.json(
      { error: 'Error al actualizar logo' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar logo (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden eliminar logos' },
        { status: 403 }
      )
    }

    // Verificar que el logo existe
    const existingLogo = await db.execute({
      sql: 'SELECT id FROM company_logos WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingLogo.rows.length === 0) {
      return NextResponse.json(
        { error: 'Logo no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar logo
    await db.execute({
      sql: 'DELETE FROM company_logos WHERE id = ?',
      args: [parseInt(id)]
    })

    return NextResponse.json({
      success: true,
      message: 'Logo eliminado correctamente'
    })

  } catch (error) {
    console.error('Error eliminando logo:', error)
    return NextResponse.json(
      { error: 'Error al eliminar logo' },
      { status: 500 }
    )
  }
}
