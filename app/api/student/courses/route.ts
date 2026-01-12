import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/student/courses - Obtener cursos asignados al estudiante
export async function GET(request: NextRequest) {
  try {
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

    // Obtener cursos asignados al estudiante
    const enrollmentsResult = await db.execute({
      sql: `SELECT 
        ce.id as enrollment_id,
        ce.course_id,
        ce.enrolled_at,
        ce.completed_at,
        ce.progress,
        c.name,
        c.description,
        c.duration,
        c.level,
        c.category,
        c.gradient,
        c.image,
        c.active
      FROM course_enrollments ce
      INNER JOIN courses c ON ce.course_id = c.id
      WHERE ce.student_id = ? AND c.active = 1
      ORDER BY ce.enrolled_at DESC`,
      args: [user.id]
    })

    const enrollments = enrollmentsResult.rows

    // Para cada curso, obtener estadísticas adicionales
    const coursesWithStats = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        // Contar videos del curso
        const videosResult = await db.execute({
          sql: 'SELECT COUNT(*) as total FROM videos WHERE curso_id = ? AND active = 1',
          args: [enrollment.course_id]
        })
        const totalVideos = Number(videosResult.rows[0]?.total || 0)

        // Contar materiales del curso
        const materialsResult = await db.execute({
          sql: 'SELECT COUNT(*) as total FROM course_materials WHERE course_id = ?',
          args: [enrollment.course_id]
        })
        const totalMaterials = Number(materialsResult.rows[0]?.total || 0)

        // Contar evaluaciones del curso
        const evaluationsResult = await db.execute({
          sql: `SELECT COUNT(*) as total 
           FROM course_evaluations ce
           INNER JOIN evaluations e ON ce.evaluation_id = e.id
           WHERE ce.course_id = ? AND e.active = 1`,
          args: [enrollment.course_id]
        })
        const totalEvaluations = Number(evaluationsResult.rows[0]?.total || 0)

        // Contar evaluaciones completadas (aprobadas)
        const completedEvaluationsResult = await db.execute({
          sql: `SELECT COUNT(*) as total 
           FROM student_evaluations se
           INNER JOIN course_evaluations ce ON se.evaluation_id = ce.evaluation_id
           WHERE se.student_id = ? AND ce.course_id = ? AND se.passed = 1`,
          args: [user.id, enrollment.course_id]
        })
        const completedEvaluations = Number(completedEvaluationsResult.rows[0]?.total || 0)

        // Verificar si completó la evaluación final
        const finalEvaluationResult = await db.execute({
          sql: `SELECT se.passed 
           FROM student_evaluations se
           INNER JOIN evaluations e ON se.evaluation_id = e.id
           INNER JOIN course_evaluations ce ON e.id = ce.evaluation_id
           WHERE se.student_id = ? AND ce.course_id = ? 
           AND (e.category LIKE '%final%' OR e.category LIKE '%Final%')
           AND se.passed = 1
           LIMIT 1`,
          args: [user.id, enrollment.course_id]
        })
        const passedFinalEvaluation = finalEvaluationResult.rows.length > 0

        // Contar materiales vistos
        const viewedMaterialsResult = await db.execute({
          sql: `SELECT COUNT(*) as total 
           FROM material_views 
           WHERE student_id = ? AND course_id = ?`,
          args: [user.id, enrollment.course_id]
        })
        const viewedMaterials = Number(viewedMaterialsResult.rows[0]?.total || 0)

        // Contar videos vistos
        const viewedVideosResult = await db.execute({
          sql: `SELECT COUNT(*) as total 
           FROM video_views 
           WHERE student_id = ? AND course_id = ?`,
          args: [user.id, enrollment.course_id]
        })
        const viewedVideos = Number(viewedVideosResult.rows[0]?.total || 0)

        // Calcular progreso dinámicamente
        let progress = 0
        let isCompleted = false

        // Si aprobó la evaluación final y completó todo, es 100%
        if (passedFinalEvaluation && 
            completedEvaluations === totalEvaluations &&
            viewedMaterials === totalMaterials &&
            viewedVideos === totalVideos) {
          progress = 100
          isCompleted = true
          
          // Actualizar en BD si no está marcado como completado
          if (!enrollment.completed_at) {
            await db.execute({
              sql: `UPDATE course_enrollments 
                SET progress = 100, completed_at = CURRENT_TIMESTAMP 
                WHERE id = ?`,
              args: [enrollment.enrollment_id]
            })
          }
        } else {
          // Calcular progreso parcial (ponderado)
          const totalItems = totalEvaluations + totalMaterials + totalVideos
          if (totalItems > 0) {
            // Evaluaciones valen 50%, materiales 30%, videos 20%
            const evalWeight = 0.5
            const materialWeight = 0.3
            const videoWeight = 0.2
            
            const evalProgress = totalEvaluations > 0 ? (completedEvaluations / totalEvaluations) * evalWeight : 0
            const materialProgress = totalMaterials > 0 ? (viewedMaterials / totalMaterials) * materialWeight : 0
            const videoProgress = totalVideos > 0 ? (viewedVideos / totalVideos) * videoWeight : 0
            
            progress = Math.round((evalProgress + materialProgress + videoProgress) * 100)
          }
          
          // Actualizar progreso en BD
          if (progress !== enrollment.progress) {
            await db.execute({
              sql: `UPDATE course_enrollments SET progress = ? WHERE id = ?`,
              args: [progress, enrollment.enrollment_id]
            })
          }
        }

        return {
          id: enrollment.course_id,
          enrollmentId: enrollment.enrollment_id,
          name: enrollment.name,
          description: enrollment.description,
          instructor: 'Instructor', // No existe en BD, valor por defecto
          duration: enrollment.duration,
          level: enrollment.level,
          category: enrollment.category,
          thumbnail: enrollment.gradient || 'from-gray-500 to-gray-600',
          image: enrollment.image, // Foto de portada del curso
          progress: progress,
          enrolledAt: enrollment.enrolled_at,
          completedAt: enrollment.completed_at,
          isCompleted: isCompleted,
          stats: {
            totalVideos: totalVideos,
            totalMaterials: totalMaterials,
            totalEvaluations: totalEvaluations,
            completedVideos: 0, // TODO: Implementar cuando tengamos video_progress
            completedEvaluations: 0 // TODO: Implementar cuando tengamos evaluation_attempts
          }
        }
      })
    )

    // Calcular estadísticas generales del estudiante
    const totalCourses = coursesWithStats.length
    const completedCourses = coursesWithStats.filter(c => c.isCompleted).length
    const activeCourses = coursesWithStats.filter(c => !c.isCompleted).length
    const averageProgress = totalCourses > 0 
      ? Math.round(coursesWithStats.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
      : 0

    return NextResponse.json({
      success: true,
      courses: coursesWithStats,
      stats: {
        totalCourses,
        activeCourses,
        completedCourses,
        averageProgress
      }
    })

  } catch (error: any) {
    console.error('Error obteniendo cursos del estudiante:', error)
    return NextResponse.json(
      { error: 'Error al obtener cursos', details: error.message },
      { status: 500 }
    )
  }
}
