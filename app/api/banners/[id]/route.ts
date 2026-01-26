import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET - Obtener un banner por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.execute({
      sql: 'SELECT * FROM banners WHERE id = ?',
      args: [parseInt(id)]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Banner no encontrado' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const banner = {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      gradient: row.gradient,
      icon: row.icon,
      image: row.image,
      useImage: row.use_image === 1,
      active: row.active === 1,
      displayOrder: row.display_order,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      banner
    })

  } catch (error) {
    console.error('Error obteniendo banner:', error)
    return NextResponse.json(
      { error: 'Error al obtener banner' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un banner (solo admin)
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
        { error: 'No autorizado. Solo administradores pueden actualizar banners' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      description,
      gradient,
      icon,
      image,
      useImage,
      active,
      displayOrder,
      cloudinaryPublicId
    } = body

    // Verificar que el banner existe
    const existingBanner = await db.execute({
      sql: 'SELECT id FROM banners WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingBanner.rows.length === 0) {
      return NextResponse.json(
        { error: 'Banner no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar banner
    await db.execute({
      sql: `UPDATE banners SET 
        title = ?, 
        subtitle = ?, 
        description = ?, 
        gradient = ?, 
        icon = ?,
        image = ?,
        use_image = ?,
        active = ?,
        display_order = ?,
        cloudinary_public_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        title,
        subtitle,
        description,
        gradient,
        icon,
        image || null,
        useImage ? 1 : 0,
        active !== false ? 1 : 0,
        displayOrder || 0,
        cloudinaryPublicId || null,
        parseInt(id)
      ]
    })

    // Obtener banner actualizado
    const updatedBanner = await db.execute({
      sql: 'SELECT * FROM banners WHERE id = ?',
      args: [parseInt(id)]
    })

    const row = updatedBanner.rows[0]
    const banner = {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      gradient: row.gradient,
      icon: row.icon,
      image: row.image,
      useImage: row.use_image === 1,
      active: row.active === 1,
      displayOrder: row.display_order,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      banner
    })

  } catch (error) {
    console.error('Error actualizando banner:', error)
    return NextResponse.json(
      { error: 'Error al actualizar banner' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar banner (solo admin)
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
        { error: 'No autorizado. Solo administradores pueden eliminar banners' },
        { status: 403 }
      )
    }

    // Verificar que el banner existe
    const existingBanner = await db.execute({
      sql: 'SELECT id FROM banners WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingBanner.rows.length === 0) {
      return NextResponse.json(
        { error: 'Banner no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar banner
    await db.execute({
      sql: 'DELETE FROM banners WHERE id = ?',
      args: [parseInt(id)]
    })

    return NextResponse.json({
      success: true,
      message: 'Banner eliminado correctamente'
    })

  } catch (error) {
    console.error('Error eliminando banner:', error)
    return NextResponse.json(
      { error: 'Error al eliminar banner' },
      { status: 500 }
    )
  }
}
