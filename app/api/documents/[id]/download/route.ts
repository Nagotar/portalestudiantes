import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

// POST - Incrementar contador de descargas
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el documento existe
    const existingDocument = await db.execute({
      sql: 'SELECT id, downloads FROM documents WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingDocument.rows.length === 0) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Incrementar contador de descargas
    await db.execute({
      sql: 'UPDATE documents SET downloads = downloads + 1 WHERE id = ?',
      args: [parseInt(id)]
    })

    return NextResponse.json({
      success: true,
      message: 'Descarga registrada'
    })

  } catch (error) {
    console.error('Error registrando descarga:', error)
    return NextResponse.json(
      { error: 'Error al registrar descarga' },
      { status: 500 }
    )
  }
}
