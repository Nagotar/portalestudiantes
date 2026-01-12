import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// GET /api/info-requests - Listar solicitudes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let sql = 'SELECT * FROM info_requests'
    const args: any[] = []

    if (status) {
      sql += ' WHERE status = ?'
      args.push(status)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await client.execute({ sql, args })

    const requests = result.rows.map(row => ({
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
    }))

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error('Error fetching info requests:', error)
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    )
  }
}

// POST /api/info-requests - Crear nueva solicitud
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, curso, mensaje = '' } = body

    // Validaciones
    if (!nombre || !email || !telefono || !curso) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Insertar solicitud
    const result = await client.execute({
      sql: `
        INSERT INTO info_requests (name, email, phone, curso, mensaje, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `,
      args: [nombre, email, telefono, curso, mensaje]
    })

    const requestId = Number(result.lastInsertRowid)

    // Obtener la solicitud creada
    const created = await client.execute({
      sql: 'SELECT * FROM info_requests WHERE id = ?',
      args: [requestId]
    })

    const row = created.rows[0]
    const newRequest = {
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

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating info request:', error)
    return NextResponse.json(
      { error: 'Error al crear solicitud' },
      { status: 500 }
    )
  }
}
