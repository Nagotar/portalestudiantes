import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/courses/[id]/materials - Listar materiales de un curso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id)

    const result = await db.execute({
      sql: `
        SELECT 
          id,
          title,
          description,
          type,
          content,
          order_num,
          active,
          created_at,
          updated_at
        FROM course_materials
        WHERE course_id = ?
        ORDER BY order_num ASC, created_at DESC
      `,
      args: [courseId]
    })

    const materials = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type, // 'pdf' o 'youtube'
      content: row.content, // URL del PDF o enlace de YouTube
      orderNum: row.order_num,
      active: row.active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return NextResponse.json({
      success: true,
      materials,
      total: materials.length
    })

  } catch (error) {
    console.error('Error obteniendo materiales del curso:', error)
    return NextResponse.json(
      { error: 'Error al obtener materiales del curso' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/materials - Agregar material a un curso
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden agregar materiales' },
        { status: 403 }
      )
    }

    const { id } = await params
    const courseId = parseInt(id)
    const body = await request.json()
    const { title, description, type, content } = body

    // Validaciones
    if (!title || !type || !content) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: title, type, content' },
        { status: 400 }
      )
    }

    if (!['pdf', 'youtube'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Debe ser "pdf" o "youtube"' },
        { status: 400 }
      )
    }

    // Verificar que el curso existe
    const courseCheck = await db.execute({
      sql: 'SELECT id FROM courses WHERE id = ?',
      args: [courseId]
    })

    if (courseCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el orden máximo actual
    const maxOrderResult = await db.execute({
      sql: 'SELECT MAX(order_num) as max_order FROM course_materials WHERE course_id = ?',
      args: [courseId]
    })
    const nextOrder = ((maxOrderResult.rows[0]?.max_order as number) || 0) + 1

    // Insertar material
    const result = await db.execute({
      sql: `
        INSERT INTO course_materials (
          course_id, title, description, type, content, order_num, active
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      args: [courseId, title, description || '', type, content, nextOrder]
    })

    const materialId = Number(result.lastInsertRowid)

    return NextResponse.json({
      success: true,
      message: 'Material agregado exitosamente',
      materialId
    }, { status: 201 })

  } catch (error) {
    console.error('Error agregando material:', error)
    return NextResponse.json(
      { error: 'Error al agregar material al curso' },
      { status: 500 }
    )
  }
}
