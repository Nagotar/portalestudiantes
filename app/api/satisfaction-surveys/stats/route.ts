import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('surveyId')

    if (!surveyId) {
      return NextResponse.json(
        { success: false, error: 'surveyId es requerido' },
        { status: 400 }
      )
    }

    // Obtener todas las preguntas de la encuesta
    const questionsResult = await db.execute({
      sql: 'SELECT * FROM satisfaction_survey_questions WHERE survey_id = ? ORDER BY display_order',
      args: [surveyId]
    })

    const questions = questionsResult.rows

    // Obtener todas las respuestas
    const responsesResult = await db.execute({
      sql: 'SELECT * FROM satisfaction_survey_responses WHERE survey_id = ?',
      args: [surveyId]
    })

    const responses = responsesResult.rows

    // Calcular estadísticas por sección
    const sections = ['MÓDULOS Y CONTENIDOS', 'INSTRUCTOR-EXPOSITOR', 'INFRAESTRUCTURA', 'SATISFACCIÓN']
    const stats: any = {
      totalResponses: new Set(responses.map((r: any) => r.user_id)).size,
      sections: {}
    }

    for (const section of sections) {
      const sectionQuestions = questions.filter((q: any) => q.section === section)
      const sectionStats: any = {
        questions: []
      }

      for (const question of sectionQuestions) {
        const questionResponses = responses.filter((r: any) => r.question_id === question.id)
        
        if (question.question_type === 'scale') {
          const ratings = questionResponses.map((r: any) => r.rating).filter((r: any) => r !== null)
          const average = ratings.length > 0 
            ? parseFloat((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(2))
            : 0

          sectionStats.questions.push({
            id: question.id,
            questionNumber: question.question_number,
            questionText: question.question_text,
            average: average,
            totalResponses: ratings.length,
            distribution: {
              1: ratings.filter((r: number) => r === 1).length,
              2: ratings.filter((r: number) => r === 2).length,
              3: ratings.filter((r: number) => r === 3).length,
              4: ratings.filter((r: number) => r === 4).length,
              5: ratings.filter((r: number) => r === 5).length,
              6: ratings.filter((r: number) => r === 6).length,
              7: ratings.filter((r: number) => r === 7).length,
            }
          })
        } else if (question.question_type === 'boolean') {
          const yesCount = questionResponses.filter((r: any) => r.recommend_course === 1).length
          const noCount = questionResponses.filter((r: any) => r.recommend_course === 0).length

          sectionStats.questions.push({
            id: question.id,
            questionNumber: question.question_number,
            questionText: question.question_text,
            yes: yesCount,
            no: noCount,
            percentage: questionResponses.length > 0 
              ? parseFloat(((yesCount / questionResponses.length) * 100).toFixed(1))
              : 0
          })
        }
      }

      // Calcular promedio de la sección
      const scaleQuestions = sectionStats.questions.filter((q: any) => q.average !== undefined)
      if (scaleQuestions.length > 0) {
        const sectionAverage = scaleQuestions.reduce((sum: number, q: any) => sum + q.average, 0) / scaleQuestions.length
        sectionStats.average = parseFloat(sectionAverage.toFixed(2))
      }

      stats.sections[section] = sectionStats
    }

    // Obtener comentarios
    const commentsResult = await db.execute({
      sql: 'SELECT DISTINCT comments, submitted_at FROM satisfaction_survey_responses WHERE survey_id = ? AND comments IS NOT NULL AND comments != ""',
      args: [surveyId]
    })

    stats.comments = commentsResult.rows.map((row: any) => ({
      text: row.comments,
      submittedAt: row.submitted_at
    }))

    // Calcular promedio general
    const allAverages = Object.values(stats.sections)
      .filter((s: any) => s.average !== undefined)
      .map((s: any) => s.average)
    
    if (allAverages.length > 0) {
      stats.overallAverage = parseFloat(
        (allAverages.reduce((a: number, b: number) => a + b, 0) / allAverages.length).toFixed(2)
      )
    }

    return NextResponse.json({ success: true, stats })
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas', details: error.message },
      { status: 500 }
    )
  }
}
