import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/courses/[id]/students - Listar estudiantes matriculados en un curso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id)

    // Obtener estudiantes matriculados con su información
    const result = await db.execute({
      sql: `
        SELECT 
          ce.id as enrollment_id,
          ce.enrolled_at,
          ce.status,
          ce.progress,
          ce.completed_at,
          u.id as student_id,
          u.name,
          u.email,
          u.created_at as user_created_at
        FROM course_enrollments ce
        INNER JOIN users u ON ce.student_id = u.id
        WHERE ce.course_id = ? AND u.role = 'estudiante'
        ORDER BY ce.enrolled_at DESC
      `,
      args: [courseId]
    })

    const students = result.rows.map((row: any) => ({
      enrollmentId: row.enrollment_id,
      studentId: row.student_id,
      name: row.name,
      email: row.email,
      enrolledAt: row.enrolled_at,
      status: row.status,
      progress: row.progress,
      completedAt: row.completed_at,
      userCreatedAt: row.user_created_at
    }))

    return NextResponse.json({
      success: true,
      students,
      total: students.length
    })

  } catch (error) {
    console.error('Error obteniendo estudiantes del curso:', error)
    return NextResponse.json(
      { error: 'Error al obtener estudiantes del curso' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/students - Asignar estudiantes a un curso
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden asignar estudiantes' },
        { status: 403 }
      )
    }

    const { id } = await params
    const courseId = parseInt(id)
    const body = await request.json()
    const { studentIds } = body

    // Validar que se envíen IDs de estudiantes
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un ID de estudiante' },
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

    const results: {
      success: Array<{ studentId: number; name: string }>;
      errors: Array<{ studentId: number; error: string }>;
      alreadyEnrolled: Array<{ studentId: number; name: string }>;
    } = {
      success: [],
      errors: [],
      alreadyEnrolled: []
    }

    // Asignar cada estudiante
    for (const studentId of studentIds) {
      try {
        // Verificar que el usuario existe y es estudiante
        const studentCheck = await db.execute({
          sql: 'SELECT id, name, role FROM users WHERE id = ? AND role = ?',
          args: [studentId, 'estudiante']
        })

        if (studentCheck.rows.length === 0) {
          results.errors.push({
            studentId,
            error: 'Usuario no encontrado o no es estudiante'
          })
          continue
        }

        // Verificar si ya está matriculado
        const enrollmentCheck = await db.execute({
          sql: 'SELECT id FROM course_enrollments WHERE course_id = ? AND student_id = ?',
          args: [courseId, studentId]
        })

        if (enrollmentCheck.rows.length > 0) {
          results.alreadyEnrolled.push({
            studentId,
            name: String(studentCheck.rows[0].name || 'Sin nombre')
          })
          continue
        }

        // Crear matrícula
        await db.execute({
          sql: `
            INSERT INTO course_enrollments (
              course_id, student_id, status, progress
            ) VALUES (?, ?, 'active', 0)
          `,
          args: [courseId, studentId]
        })

        results.success.push({
          studentId,
          name: String(studentCheck.rows[0].name || 'Sin nombre')
        })

      } catch (error) {
        console.error(`Error asignando estudiante ${studentId}:`, error)
        results.errors.push({
          studentId,
          error: 'Error al asignar estudiante'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Proceso de asignación completado',
      results
    }, { status: 201 })

  } catch (error) {
    console.error('Error asignando estudiantes:', error)
    return NextResponse.json(
      { error: 'Error al asignar estudiantes al curso' },
      { status: 500 }
    )
  }
}
