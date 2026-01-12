import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'

// GET /api/videos - Listar videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const featured = searchParams.get('featured')
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    let sql = 'SELECT * FROM videos WHERE 1=1'
    const args: any[] = []

    if (active === 'true') {
      sql += ' AND active = 1'
    }

    if (featured === 'true') {
      sql += ' AND featured = 1'
    }

    if (type) {
      sql += ' AND type = ?'
      args.push(type)
    }

    if (category) {
      sql += ' AND category = ?'
      args.push(category)
    }

    sql += ' ORDER BY upload_date DESC, id DESC'

    const result = await db.execute({ sql, args })

    const videos = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: row.type,
      duration: row.duration,
      thumbnail: row.thumbnail,
      videoUrl: row.video_url,
      uploadDate: row.upload_date,
      views: row.views,
      active: Boolean(row.active),
      featured: Boolean(row.featured),
      cursoId: row.curso_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return NextResponse.json({ videos })
  } catch (error: any) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Error al obtener videos' },
      { status: 500 }
    )
  }
}

// POST /api/videos - Crear nuevo video
export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar autenticación cuando esté disponible
    
    const body = await request.json()
    const {
      title,
      description,
      category,
      type,
      duration,
      thumbnail,
      videoUrl,
      uploadDate,
      active = true,
      featured = false,
      cursoId
    } = body

    // Validaciones
    if (!title || !description || !category || !type || !duration) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (!['didactico', 'informativo'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de video inválido' },
        { status: 400 }
      )
    }

    // Validar que videos didácticos tengan curso asignado
    if (type === 'didactico' && !cursoId) {
      return NextResponse.json(
        { error: 'Los videos didácticos deben tener un curso asignado' },
        { status: 400 }
      )
    }

    // Validar tamaño de thumbnail (max 5MB en base64)
    if (thumbnail && thumbnail.length > 7000000) {
      return NextResponse.json(
        { error: 'La miniatura es demasiado grande (máximo 5MB)' },
        { status: 400 }
      )
    }

    // Validar tamaño de video (max 500MB en base64)
    if (videoUrl && videoUrl.length > 700000000) {
      return NextResponse.json(
        { error: 'El video es demasiado grande (máximo 500MB)' },
        { status: 400 }
      )
    }

    const result = await db.execute({
      sql: `
        INSERT INTO videos (
          title, description, category, type, duration,
          thumbnail, video_url, upload_date, views, active, featured, curso_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
      `,
      args: [
        title,
        description,
        category,
        type,
        duration,
        thumbnail || null,
        videoUrl || null,
        uploadDate || new Date().toISOString().split('T')[0],
        active ? 1 : 0,
        featured ? 1 : 0,
        cursoId || null
      ]
    })

    return NextResponse.json({
      message: 'Video creado exitosamente',
      videoId: Number(result.lastInsertRowid)
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Error al crear video' },
      { status: 500 }
    )
  }
}
