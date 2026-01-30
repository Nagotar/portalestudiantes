import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { surveyId, userId, courseId, responses, recommendCourse, comments } = body

    // Validar que no exista una respuesta previa
    const existingResponse = await db.execute({
      sql: 'SELECT id FROM satisfaction_survey_responses WHERE survey_id = ? AND user_id = ? LIMIT 1',
      args: [surveyId, userId]
    })

    if (existingResponse.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya has respondido esta encuesta' },
        { status: 400 }
      )
    }

    // Insertar respuestas
    for (const response of responses) {
      await db.execute({
        sql: `INSERT INTO satisfaction_survey_responses 
              (survey_id, user_id, course_id, question_id, rating, recommend_course, comments)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          surveyId,
          userId || null,
          courseId || null,
          response.questionId,
          response.rating || null,
          recommendCourse ? 1 : 0,
          comments || null
        ]
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Encuesta enviada exitosamente'
    })
  } catch (error: any) {
    console.error('Error guardando respuestas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar respuestas', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('surveyId')
    const userId = searchParams.get('userId')

    let sql = 'SELECT * FROM satisfaction_survey_responses WHERE 1=1'
    const args: any[] = []

    if (surveyId) {
      sql += ' AND survey_id = ?'
      args.push(surveyId)
    }

    if (userId) {
      sql += ' AND user_id = ?'
      args.push(userId)
    }

    const result = await db.execute({ sql, args })

    const responses = result.rows.map((row: any) => ({
      id: row.id,
      surveyId: row.survey_id,
      userId: row.user_id,
      courseId: row.course_id,
      questionId: row.question_id,
      rating: row.rating,
      textResponse: row.text_response,
      recommendCourse: Boolean(row.recommend_course),
      comments: row.comments,
      submittedAt: row.submitted_at,
    }))

    return NextResponse.json({ success: true, responses })
  } catch (error: any) {
    console.error('Error obteniendo respuestas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener respuestas', details: error.message },
      { status: 500 }
    )
  }
}
