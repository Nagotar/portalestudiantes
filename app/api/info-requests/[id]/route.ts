import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// GET /api/info-requests/[id] - Obtener solicitud por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await client.execute({
      sql: 'SELECT * FROM info_requests WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const infoRequest = {
      id: row.id,
      nombre: row.name,
      email: row.email,
      telefono: row.phone,
      curso: row.curso,
      mensaje: row.mensaje,
      status: row.status,
      fecha: row.created_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({ request: infoRequest })
  } catch (error: any) {
    console.error('Error fetching info request:', error)
    return NextResponse.json(
      { error: 'Error al obtener solicitud' },
      { status: 500 }
    )
  }
}

// PUT /api/info-requests/[id] - Actualizar solicitud
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validar que la solicitud existe
    const existing = await client.execute({
      sql: 'SELECT id FROM info_requests WHERE id = ?',
      args: [id]
    })

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    // Validar status
    if (status && !['pending', 'contacted', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Actualizar solicitud
    await client.execute({
      sql: `
        UPDATE info_requests 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [status, id]
    })

    // Obtener solicitud actualizada
    const updated = await client.execute({
      sql: 'SELECT * FROM info_requests WHERE id = ?',
      args: [id]
    })

    const row = updated.rows[0]
    const infoRequest = {
      id: row.id,
      nombre: row.name,
      email: row.email,
      telefono: row.phone,
      curso: row.curso,
      mensaje: row.mensaje,
      status: row.status,
      fecha: row.created_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({ request: infoRequest })
  } catch (error: any) {
    console.error('Error updating info request:', error)
    return NextResponse.json(
      { error: 'Error al actualizar solicitud' },
      { status: 500 }
    )
  }
}

// DELETE /api/info-requests/[id] - Eliminar solicitud
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validar que la solicitud existe
    const existing = await client.execute({
      sql: 'SELECT id FROM info_requests WHERE id = ?',
      args: [id]
    })

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar solicitud
    await client.execute({
      sql: 'DELETE FROM info_requests WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({ message: 'Solicitud eliminada exitosamente' })
  } catch (error: any) {
    console.error('Error deleting info request:', error)
    return NextResponse.json(
      { error: 'Error al eliminar solicitud' },
      { status: 500 }
    )
  }
}
