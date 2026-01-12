import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/student/courses/[id]/materials - Obtener materiales de un curso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Obtener usuario autenticado
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que sea estudiante
    if (user.role !== 'estudiante') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo estudiantes pueden acceder.' },
        { status: 403 }
      )
    }

    // Verificar que el estudiante esté inscrito en el curso
    const enrollmentResult = await db.execute({
      sql: 'SELECT id FROM course_enrollments WHERE student_id = ? AND course_id = ?',
      args: [user.id, parseInt(id)]
    })

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 403 }
      )
    }

    // Obtener materiales del curso
    const materialsResult = await db.execute({
      sql: `SELECT 
        id,
        title,
        description,
        type,
        content,
        order_num,
        created_at
      FROM course_materials
      WHERE course_id = ? AND active = 1
      ORDER BY order_num ASC, created_at ASC`,
      args: [parseInt(id)]
    })

    const materials = materialsResult.rows.map((material: any) => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type, // 'pdf' o 'youtube'
      content: material.content, // base64 para PDFs o URL para YouTube
      url: material.type === 'youtube' ? material.content : null, // Si es youtube, content es la URL
      displayOrder: material.order_num,
      createdAt: material.created_at,
      // Calcular tamaño aproximado para PDFs
      size: material.type === 'pdf' && material.content 
        ? Math.round(material.content.length * 0.75 / 1024 / 1024 * 100) / 100 // MB aproximado
        : null
    }))

    return NextResponse.json({
      success: true,
      materials,
      count: materials.length
    })

  } catch (error: any) {
    console.error('Error obteniendo materiales del curso:', error)
    return NextResponse.json(
      { error: 'Error al obtener materiales', details: error.message },
      { status: 500 }
    )
  }
}
