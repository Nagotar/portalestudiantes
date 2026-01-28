import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// GET - Listar todos los documentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let sql = 'SELECT * FROM documents'
    
    if (activeOnly) {
      sql += ' WHERE active = 1'
    }
    
    sql += ' ORDER BY created_at DESC'

    const result = await db.execute(sql)

    const documents = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      licenseType: row.license_type,
      fileData: row.file_data,
      fileName: row.file_name,
      fileSize: row.file_size,
      downloads: row.downloads || 0,
      active: row.active === 1,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return NextResponse.json({
      success: true,
      documents
    })

  } catch (error) {
    console.error('Error obteniendo documentos:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo documento (solo admin)
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
        { error: 'No autorizado. Solo administradores pueden crear documentos' },
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

    // Validar campos requeridos
    if (!title || !description || !licenseType) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, description, licenseType' },
        { status: 400 }
      )
    }

    // Insertar documento en la base de datos
    const result = await db.execute({
      sql: `INSERT INTO documents (
        title, description, license_type, file_data, file_name, file_size, downloads, active, cloudinary_public_id
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      args: [
        title,
        description,
        licenseType,
        fileData || null,
        fileName || null,
        fileSize || null,
        active !== false ? 1 : 0,
        cloudinaryPublicId || null
      ]
    })

    // Obtener el documento recién creado
    const documentId = Number(result.lastInsertRowid)
    const newDocument = await db.execute({
      sql: 'SELECT * FROM documents WHERE id = ?',
      args: [documentId]
    })

    const doc = newDocument.rows[0]

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        licenseType: doc.license_type,
        fileData: doc.file_data,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        downloads: doc.downloads,
        active: doc.active === 1,
        cloudinaryPublicId: doc.cloudinary_public_id,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando documento:', error)
    return NextResponse.json(
      { error: 'Error al crear documento' },
      { status: 500 }
    )
  }
}
