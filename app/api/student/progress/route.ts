import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (user.role !== 'estudiante') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo estudiantes pueden acceder.' },
        { status: 403 }
      )
    }

    // Obtener cursos del estudiante con progreso
    const coursesResult = await db.execute({
      sql: `SELECT 
        c.id,
        c.name,
        ce.progress,
        ce.enrolled_at,
        ce.completed_at
      FROM course_enrollments ce
      INNER JOIN courses c ON ce.course_id = c.id
      WHERE ce.student_id = ? AND c.active = 1
      ORDER BY ce.enrolled_at DESC`,
      args: [user.id]
    })

    const courses = coursesResult.rows

    // Calcular estadísticas generales
    const totalCourses = courses.length
    const completedCourses = courses.filter((c: any) => c.completed_at !== null).length
    const averageProgress = courses.length > 0
      ? Math.round(courses.reduce((sum: number, c: any) => sum + Number(c.progress || 0), 0) / courses.length)
      : 0

    // Contar videos vistos
    const videosViewedResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM video_views WHERE student_id = ?`,
      args: [user.id]
    })
    const totalVideosViewed = Number(videosViewedResult.rows[0]?.total || 0)

    // Contar materiales vistos
    const materialsViewedResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM material_views WHERE student_id = ?`,
      args: [user.id]
    })
    const totalMaterialsViewed = Number(materialsViewedResult.rows[0]?.total || 0)

    // Obtener evaluaciones completadas
    const evaluationsResult = await db.execute({
      sql: `SELECT 
        e.id,
        e.title,
        e.category,
        se.score,
        se.passed,
        se.completed_at,
        c.name as course_name
      FROM student_evaluations se
      INNER JOIN evaluations e ON se.evaluation_id = e.id
      INNER JOIN course_evaluations ce ON e.id = ce.evaluation_id
      INNER JOIN courses c ON ce.course_id = c.id
      WHERE se.student_id = ?
      ORDER BY se.completed_at DESC`,
      args: [user.id]
    })

    const evaluations = evaluationsResult.rows

    // Contar evaluaciones aprobadas
    const totalEvaluations = evaluations.length
    const passedEvaluations = evaluations.filter((e: any) => e.passed === 1).length

    // Calcular promedio de calificaciones
    const averageScore = evaluations.length > 0
      ? Math.round(evaluations.reduce((sum: number, e: any) => sum + Number(e.score || 0), 0) / evaluations.length)
      : 0

    // Obtener actividad reciente (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    const recentActivityResult = await db.execute({
      sql: `SELECT 
        'video' as type,
        v.title as title,
        vv.viewed_at as date,
        c.name as course_name
      FROM video_views vv
      INNER JOIN videos v ON vv.video_id = v.id
      INNER JOIN courses c ON vv.course_id = c.id
      WHERE vv.student_id = ? AND vv.viewed_at >= ?
      UNION ALL
      SELECT 
        'material' as type,
        cm.title as title,
        mv.viewed_at as date,
        c.name as course_name
      FROM material_views mv
      INNER JOIN course_materials cm ON mv.material_id = cm.id
      INNER JOIN courses c ON mv.course_id = c.id
      WHERE mv.student_id = ? AND mv.viewed_at >= ?
      UNION ALL
      SELECT 
        'evaluation' as type,
        e.title as title,
        se.completed_at as date,
        c.name as course_name
      FROM student_evaluations se
      INNER JOIN evaluations e ON se.evaluation_id = e.id
      INNER JOIN course_evaluations ce ON e.id = ce.evaluation_id
      INNER JOIN courses c ON ce.course_id = c.id
      WHERE se.student_id = ? AND se.completed_at >= ?
      ORDER BY date DESC
      LIMIT 10`,
      args: [user.id, thirtyDaysAgoStr, user.id, thirtyDaysAgoStr, user.id, thirtyDaysAgoStr]
    })

    const recentActivity = recentActivityResult.rows

    // Progreso por curso con detalles
    const courseProgress = await Promise.all(
      courses.map(async (course: any) => {
        // Contar total de items del curso
        const videosResult = await db.execute({
          sql: 'SELECT COUNT(*) as total FROM videos WHERE curso_id = ? AND active = 1',
          args: [course.id]
        })
        const totalVideos = Number(videosResult.rows[0]?.total || 0)

        const materialsResult = await db.execute({
          sql: 'SELECT COUNT(*) as total FROM course_materials WHERE course_id = ? AND active = 1',
          args: [course.id]
        })
        const totalMaterials = Number(materialsResult.rows[0]?.total || 0)

        const evaluationsResult = await db.execute({
          sql: `SELECT COUNT(*) as total 
           FROM course_evaluations ce
           INNER JOIN evaluations e ON ce.evaluation_id = e.id
           WHERE ce.course_id = ? AND e.active = 1`,
          args: [course.id]
        })
        const totalEvaluations = Number(evaluationsResult.rows[0]?.total || 0)

        // Contar completados
        const viewedVideosResult = await db.execute({
          sql: 'SELECT COUNT(*) as total FROM video_views WHERE student_id = ? AND course_id = ?',
          args: [user.id, course.id]
        })
        const viewedVideos = Number(viewedVideosResult.rows[0]?.total || 0)

        const viewedMaterialsResult = await db.execute({
          sql: 'SELECT COUNT(*) as total FROM material_views WHERE student_id = ? AND course_id = ?',
          args: [user.id, course.id]
        })
        const viewedMaterials = Number(viewedMaterialsResult.rows[0]?.total || 0)

        const completedEvaluationsResult = await db.execute({
          sql: `SELECT COUNT(*) as total 
           FROM student_evaluations se
           INNER JOIN course_evaluations ce ON se.evaluation_id = ce.evaluation_id
           WHERE se.student_id = ? AND ce.course_id = ? AND se.passed = 1`,
          args: [user.id, course.id]
        })
        const completedEvaluations = Number(completedEvaluationsResult.rows[0]?.total || 0)

        return {
          id: course.id,
          name: course.name,
          progress: Number(course.progress || 0),
          enrolledAt: course.enrolled_at,
          completedAt: course.completed_at,
          stats: {
            videos: { completed: viewedVideos, total: totalVideos },
            materials: { completed: viewedMaterials, total: totalMaterials },
            evaluations: { completed: completedEvaluations, total: totalEvaluations }
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      summary: {
        totalCourses,
        completedCourses,
        averageProgress,
        totalVideosViewed,
        totalMaterialsViewed,
        totalEvaluations,
        passedEvaluations,
        averageScore
      },
      courseProgress,
      recentActivity: recentActivity.map((activity: any) => ({
        type: activity.type,
        title: activity.title,
        courseName: activity.course_name,
        date: activity.date
      })),
      evaluations: evaluations.map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        courseName: e.course_name,
        score: Number(e.score || 0),
        passed: e.passed === 1,
        completedAt: e.completed_at
      }))
    })

  } catch (error) {
    console.error('Error obteniendo progreso del estudiante:', error)
    return NextResponse.json(
      { error: 'Error al obtener el progreso' },
      { status: 500 }
    )
  }
}
