import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const includeQuestions = searchParams.get('includeQuestions') === 'true'

    let sql = 'SELECT * FROM satisfaction_surveys WHERE 1=1'
    const args: any[] = []

    if (courseId) {
      sql += ' AND course_id = ?'
      args.push(courseId)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await db.execute({ sql, args })

    const surveys: any[] = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      courseId: row.course_id,
      active: Boolean(row.active),
      requiredForCertificate: Boolean(row.required_for_certificate),
      anonymous: Boolean(row.anonymous),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    if (includeQuestions) {
      for (const survey of surveys) {
        const questionsResult = await db.execute({
          sql: 'SELECT * FROM satisfaction_survey_questions WHERE survey_id = ? ORDER BY display_order',
          args: [survey.id]
        })

        survey.questions = questionsResult.rows.map((q: any) => ({
          id: q.id,
          surveyId: q.survey_id,
          section: q.section,
          questionNumber: q.question_number,
          questionText: q.question_text,
          questionType: q.question_type,
          scaleMin: q.scale_min,
          scaleMax: q.scale_max,
          displayOrder: q.display_order,
        }))
      }
    }

    return NextResponse.json({ success: true, surveys })
  } catch (error: any) {
    console.error('Error obteniendo encuestas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener encuestas', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, courseId, active, requiredForCertificate, anonymous } = body

    const result = await db.execute({
      sql: `INSERT INTO satisfaction_surveys 
            (title, description, course_id, active, required_for_certificate, anonymous)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        title,
        description || null,
        courseId || null,
        active ? 1 : 0,
        requiredForCertificate ? 1 : 0,
        anonymous ? 1 : 0
      ]
    })

    const surveyId = Number(result.lastInsertRowid)

    return NextResponse.json({
      success: true,
      survey: {
        id: surveyId,
        title,
        description,
        courseId,
        active,
        requiredForCertificate,
        anonymous,
      }
    })
  } catch (error: any) {
    console.error('Error creando encuesta:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear encuesta', details: error.message },
      { status: 500 }
    )
  }
}
