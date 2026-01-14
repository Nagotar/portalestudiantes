import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// Configuración para aumentar el límite de tamaño del body
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// GET - Listar todos los cursos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const featuredOnly = searchParams.get('featured') === 'true'

    let sql = 'SELECT * FROM courses'
    const conditions = []
    
    if (activeOnly) {
      conditions.push('active = 1')
    }
    
    if (featuredOnly) {
      conditions.push('featured = 1')
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    
    sql += ' ORDER BY created_at DESC'

    const result = await db.execute(sql)

    const courses = result.rows.map((row: any) => ({
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
      modules: row.modules ? JSON.parse(row.modules) : [],
      benefits: row.benefits ? JSON.parse(row.benefits) : [],
      image: row.image,
      video: row.video,
      featured: row.featured === 1,
      active: row.active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return NextResponse.json({
      success: true,
      courses
    })

  } catch (error) {
    console.error('Error obteniendo cursos:', error)
    return NextResponse.json(
      { error: 'Error al obtener cursos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo curso (solo admin)
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
        { error: 'No autorizado. Solo administradores pueden crear cursos' },
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

    // Validar campos requeridos
    if (!name || !description || !duration || !category) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, description, duration, category' },
        { status: 400 }
      )
    }

    // Insertar curso en la base de datos
    const result = await db.execute({
      sql: `INSERT INTO courses (
        name, description, full_description, duration, level, price, 
        category, gradient, video_url, modules, benefits, image, video, featured, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        active !== false ? 1 : 0
      ]
    })

    const courseId = Number(result.lastInsertRowid)
    const newCourse = await db.execute({
      sql: 'SELECT * FROM courses WHERE id = ?',
      args: [courseId]
    })

    const course = newCourse.rows[0]

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        name: course.name,
        description: course.description,
        fullDescription: course.full_description,
        duration: course.duration,
        level: course.level,
        price: course.price,
        category: course.category,
        gradient: course.gradient,
        videoUrl: course.video_url,
        modules: course.modules ? JSON.parse(course.modules as string) : [],
        benefits: course.benefits ? JSON.parse(course.benefits as string) : [],
        image: course.image,
        video: course.video,
        featured: course.featured === 1,
        active: course.active === 1,
        createdAt: course.created_at,
        updatedAt: course.updated_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando curso:', error)
    return NextResponse.json(
      { error: 'Error al crear curso' },
      { status: 500 }
    )
  }
}
