import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'
export const maxDuration = 60

// GET - Obtener un curso por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params en Next.js 15
    const { id } = await params
    const result = await db.execute({
      sql: 'SELECT * FROM courses WHERE id = ?',
      args: [parseInt(id)]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const course = {
      id: row.id,
      name: row.name,
      description: row.description,
      fullDescription: row.full_description,
      duration: row.duration,
      level: row.level,
      price: row.price,
      category: row.category,
      gradient: row.gradient,
      videoUrl: row.video_url,
      modules: row.modules ? JSON.parse(row.modules as string) : [],
      benefits: row.benefits ? JSON.parse(row.benefits as string) : [],
      image: row.image,
      featured: row.featured === 1,
      active: row.active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      course
    })

  } catch (error) {
    console.error('Error obteniendo curso:', error)
    return NextResponse.json(
      { error: 'Error al obtener curso' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un curso (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params en Next.js 15
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
        { error: 'No autorizado. Solo administradores pueden actualizar cursos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      fullDescription,
      duration,
      level,
      price,
      category,
      gradient,
      videoUrl,
      modules,
      benefits,
      image,
      video,
      featured,
      active
    } = body

    // Verificar que el curso existe
    const existingCourse = await db.execute({
      sql: 'SELECT id FROM courses WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar curso
    await db.execute({
      sql: `UPDATE courses SET 
        name = ?, 
        description = ?, 
        full_description = ?, 
        duration = ?, 
        level = ?, 
        price = ?, 
        category = ?, 
        gradient = ?, 
        video_url = ?, 
        modules = ?, 
        benefits = ?, 
        image = ?,
        video = ?, 
        featured = ?, 
        active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        name,
        description,
        fullDescription || '',
        duration,
        level || 'Principiante',
        price || 0,
        category,
        gradient || 'from-blue-500 to-purple-600',
        videoUrl || '',
        modules ? JSON.stringify(modules) : '[]',
        benefits ? JSON.stringify(benefits) : '[]',
        image || null,
        video || null,
        featured ? 1 : 0,
        active !== false ? 1 : 0,
        parseInt(id)
      ]
    })

    // Obtener curso actualizado
    const updatedCourse = await db.execute({
      sql: 'SELECT * FROM courses WHERE id = ?',
      args: [parseInt(id)]
    })

    const row = updatedCourse.rows[0]
    const course = {
      id: row.id,
      name: row.name,
      description: row.description,
      fullDescription: row.full_description,
      duration: row.duration,
      level: row.level,
      price: row.price,
      category: row.category,
      gradient: row.gradient,
      videoUrl: row.video_url,
      modules: row.modules ? JSON.parse(row.modules as string) : [],
      benefits: row.benefits ? JSON.parse(row.benefits as string) : [],
      image: row.image,
      video: row.video,
      featured: row.featured === 1,
      active: row.active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      course
    })

  } catch (error) {
    console.error('Error actualizando curso:', error)
    return NextResponse.json(
      { error: 'Error al actualizar curso' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar curso (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params en Next.js 15
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
        { error: 'No autorizado. Solo administradores pueden eliminar cursos' },
        { status: 403 }
      )
    }

    // Verificar que el curso existe
    const existingCourse = await db.execute({
      sql: 'SELECT id FROM courses WHERE id = ?',
      args: [parseInt(id)]
    })

    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar curso
    await db.execute({
      sql: 'DELETE FROM courses WHERE id = ?',
      args: [parseInt(id)]
    })

    return NextResponse.json({
      success: true,
      message: 'Curso eliminado correctamente'
    })

  } catch (error) {
    console.error('Error eliminando curso:', error)
    return NextResponse.json(
      { error: 'Error al eliminar curso' },
      { status: 500 }
    )
  }
}
