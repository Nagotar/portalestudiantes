import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// GET /api/videos/[id] - Obtener video por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await client.execute({
      sql: 'SELECT * FROM videos WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const video = {
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
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({ video })
  } catch (error: any) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Error al obtener video' },
      { status: 500 }
    )
  }
}

// PUT /api/videos/[id] - Actualizar video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      active,
      featured,
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

    await client.execute({
      sql: `
        UPDATE videos SET
          title = ?,
          description = ?,
          category = ?,
          type = ?,
          duration = ?,
          thumbnail = ?,
          video_url = ?,
          upload_date = ?,
          active = ?,
          featured = ?,
          curso_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        title,
        description,
        category,
        type,
        duration,
        thumbnail || null,
        videoUrl || null,
        uploadDate,
        active ? 1 : 0,
        featured ? 1 : 0,
        cursoId || null,
        id
      ]
    })

    return NextResponse.json({
      message: 'Video actualizado exitosamente'
    })

  } catch (error: any) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Error al actualizar video' },
      { status: 500 }
    )
  }
}

// DELETE /api/videos/[id] - Eliminar video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar que el video existe
    const checkResult = await client.execute({
      sql: 'SELECT id FROM videos WHERE id = ?',
      args: [id]
    })

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el video
    await client.execute({
      sql: 'DELETE FROM videos WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({
      message: 'Video eliminado exitosamente'
    })

  } catch (error: any) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Error al eliminar video' },
      { status: 500 }
    )
  }
}
