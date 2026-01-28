import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET - Obtener un documento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.execute({
      sql: 'SELECT * FROM documents WHERE id = ?',
      args: [parseInt(id)]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const document = {
      id: row.id,
      title: row.title,
      description: row.description,
      licenseType: row.license_type,
      fileData: row.file_data,
      fileName: row.file_name,
      fileSize: row.file_size,
      downloads: row.downloads,
      active: row.active === 1,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error) {
    console.error('Error obteniendo documento:', error)
    return NextResponse.json(
      { error: 'Error al obtener documento' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un documento (solo admin)
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
        { error: 'No autorizado. Solo administradores pueden actualizar documentos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      licenseType,
      fileData,
      fileName,
      fileSize,
      active,
      cloudinaryPublicId
    } = body

    // Verificar que el documento existe
    const existingDocument = await db.execute({
      sql: 'SELECT id FROM documents WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingDocument.rows.length === 0) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar documento
    await db.execute({
      sql: `UPDATE documents SET 
        title = ?, 
        description = ?, 
        license_type = ?, 
        file_data = ?,
        file_name = ?,
        file_size = ?,
        active = ?,
        cloudinary_public_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        title,
        description,
        licenseType,
        fileData || null,
        fileName || null,
        fileSize || null,
        active !== false ? 1 : 0,
        cloudinaryPublicId || null,
        parseInt(id)
      ]
    })

    // Obtener documento actualizado
    const updatedDocument = await db.execute({
      sql: 'SELECT * FROM documents WHERE id = ?',
      args: [parseInt(id)]
    })

    const row = updatedDocument.rows[0]
    const document = {
      id: row.id,
      title: row.title,
      description: row.description,
      licenseType: row.license_type,
      fileData: row.file_data,
      fileName: row.file_name,
      fileSize: row.file_size,
      downloads: row.downloads,
      active: row.active === 1,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error) {
    console.error('Error actualizando documento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar documento' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar documento (solo admin)
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
        { error: 'No autorizado. Solo administradores pueden eliminar documentos' },
        { status: 403 }
      )
    }

    // Verificar que el documento existe
    const existingDocument = await db.execute({
      sql: 'SELECT id FROM documents WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingDocument.rows.length === 0) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar documento
    await db.execute({
      sql: 'DELETE FROM documents WHERE id = ?',
      args: [parseInt(id)]
    })

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado correctamente'
    })

  } catch (error) {
    console.error('Error eliminando documento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    )
  }
}
