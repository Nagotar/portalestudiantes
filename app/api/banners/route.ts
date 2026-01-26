import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// Configuración para aumentar el límite de tamaño del body
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// GET - Listar todos los banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let sql = 'SELECT * FROM banners'
    
    if (activeOnly) {
      sql += ' WHERE active = 1'
    }
    
    sql += ' ORDER BY display_order ASC, created_at DESC'

    const result = await db.execute(sql)

    const banners = result.rows.map((row: any) => ({
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
    }))

    return NextResponse.json({
      success: true,
      banners
    })

  } catch (error) {
    console.error('Error obteniendo banners:', error)
    return NextResponse.json(
      { error: 'Error al obtener banners' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo banner (solo admin)
export async function POST(request: NextRequest) {
  try {
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
        { error: 'No autorizado. Solo administradores pueden crear banners' },
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

    // Validar campos requeridos
    if (!title || !subtitle || !description || !gradient || !icon) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, subtitle, description, gradient, icon' },
        { status: 400 }
      )
    }

    // Insertar banner en la base de datos
    const result = await db.execute({
      sql: `INSERT INTO banners (
        title, subtitle, description, gradient, icon, image, use_image, active, display_order, cloudinary_public_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        cloudinaryPublicId || null
      ]
    })

    // Obtener el banner recién creado
    const bannerId = Number(result.lastInsertRowid)
    const newBanner = await db.execute({
      sql: 'SELECT * FROM banners WHERE id = ?',
      args: [bannerId]
    })

    const banner = newBanner.rows[0]

    return NextResponse.json({
      success: true,
      banner: {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        gradient: banner.gradient,
        icon: banner.icon,
        image: banner.image,
        useImage: banner.use_image === 1,
        active: banner.active === 1,
        displayOrder: banner.display_order,
        cloudinaryPublicId: banner.cloudinary_public_id,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando banner:', error)
    return NextResponse.json(
      { error: 'Error al crear banner' },
      { status: 500 }
    )
  }
}
