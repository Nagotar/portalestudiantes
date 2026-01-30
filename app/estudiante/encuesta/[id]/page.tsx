"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

interface Question {
  id: number
  surveyId: number
  section: string
  questionNumber: number
  questionText: string
  questionType: string
  scaleMin?: number
  scaleMax?: number
  displayOrder: number
}

interface Survey {
  id: number
  title: string
  description: string
  courseId?: number
  active: boolean
  requiredForCertificate: boolean
  anonymous: boolean
  questions?: Question[]
}

export default function SatisfactionSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [responses, setResponses] = useState<{ [key: number]: number }>({})
  const [recommendCourse, setRecommendCourse] = useState<boolean | null>(null)
  const [comments, setComments] = useState("")
  const [error, setError] = useState("")
  const [currentSection, setCurrentSection] = useState(0)

  const sections = ['MÓDULOS Y CONTENIDOS', 'INSTRUCTOR-EXPOSITOR', 'INFRAESTRUCTURA', 'SATISFACCIÓN']

  useEffect(() => {
    loadSurvey()
  }, [params.id])

  const loadSurvey = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/satisfaction-surveys?includeQuestions=true`)
      const data = await response.json()

      if (response.ok && data.surveys) {
        const surveyData = data.surveys.find((s: Survey) => s.id === Number(params.id))
        if (surveyData) {
          setSurvey(surveyData)
        } else {
          setError("Encuesta no encontrada")
        }
      }
    } catch (err) {
      console.error('Error cargando encuesta:', err)
      setError("Error al cargar la encuesta")
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (questionId: number, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: rating
    }))
  }

  const getSectionQuestions = (section: string) => {
    return survey?.questions?.filter(q => q.section === section) || []
  }

  const isSectionComplete = (section: string) => {
    const sectionQuestions = getSectionQuestions(section)
    return sectionQuestions.every(q => responses[q.id] !== undefined)
  }

  const canSubmit = () => {
    if (!survey?.questions) return false
    
    const allScaleQuestions = survey.questions.filter(q => q.questionType === 'scale')
    const allAnswered = allScaleQuestions.every(q => responses[q.id] !== undefined)
    const recommendAnswered = recommendCourse !== null
    
    return allAnswered && recommendAnswered
  }

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError("Por favor responde todas las preguntas antes de enviar")
      return
    }

    try {
      setSubmitting(true)
      setError("")

      const userId = localStorage.getItem('userId')
      const responseData = {
        surveyId: survey?.id,
        userId: userId ? Number(userId) : null,
        courseId: survey?.courseId,
        responses: Object.entries(responses).map(([questionId, rating]) => ({
          questionId: Number(questionId),
          rating
        })),
        recommendCourse,
        comments: comments.trim() || null
      }

      const response = await fetch('/api/satisfaction-surveys/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('¡Gracias por completar la encuesta de satisfacción!')
        router.push('/estudiante')
      } else {
        setError(data.error || 'Error al enviar la encuesta')
      }
    } catch (err) {
      console.error('Error enviando encuesta:', err)
      setError('Error al enviar la encuesta')
    } finally {
      setSubmitting(false)
    }
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const getSectionColor = (section: string) => {
    const colors: { [key: string]: string } = {
      'MÓDULOS Y CONTENIDOS': 'from-blue-500 to-blue-600',
      'INSTRUCTOR-EXPOSITOR': 'from-green-500 to-green-600',
      'INFRAESTRUCTURA': 'from-purple-500 to-purple-600',
      'SATISFACCIÓN': 'from-orange-500 to-orange-600'
    }
    return colors[section] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando encuesta...</p>
        </div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/estudiante')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    )
  }

  if (!survey) return null

  const currentSectionName = sections[currentSection]
  const currentQuestions = getSectionQuestions(currentSectionName)
  const progress = ((currentSection + 1) / sections.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <p className="text-gray-600">{survey.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{currentSection + 1} de {sections.length} secciones</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Section Indicators */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => setCurrentSection(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  index === currentSection
                    ? 'bg-gradient-to-r ' + getSectionColor(section) + ' text-white shadow-lg scale-105'
                    : isSectionComplete(section)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}. {section}
                {isSectionComplete(section) && index !== currentSection && (
                  <span className="ml-2">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className={`bg-gradient-to-r ${getSectionColor(currentSectionName)} text-white rounded-xl p-6 mb-6`}>
            <h2 className="text-2xl font-bold mb-2">
              {currentSection + 1}. {currentSectionName}
            </h2>
            <p className="text-white/90">
              {currentSectionName === 'SATISFACCIÓN' 
                ? 'Evaluación general del curso'
                : 'Evalúa en una escala de 1 a 7 los siguientes ítems'}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {currentQuestions.map((question) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {question.questionNumber}
                  </span>
                  <p className="text-gray-800 font-medium text-lg flex-1">
                    {question.questionText}
                  </p>
                </div>

                {question.questionType === 'scale' && (
                  <div className="ml-11">
                    <div className="flex items-center gap-2 justify-between mb-2">
                      <span className="text-sm text-gray-500">Muy en desacuerdo</span>
                      <span className="text-sm text-gray-500">Muy de acuerdo</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingChange(question.id, rating)}
                          className={`flex-1 h-14 rounded-lg font-bold text-lg transition-all ${
                            responses[question.id] === rating
                              ? rating >= 6
                                ? 'bg-green-500 text-white shadow-lg scale-110'
                                : rating >= 4
                                ? 'bg-yellow-500 text-white shadow-lg scale-110'
                                : 'bg-red-500 text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Recommend Course (Satisfaction Section) */}
            {currentSectionName === 'SATISFACCIÓN' && (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-800 font-medium text-lg mb-4">
                  ¿Recomendaría el curso?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setRecommendCourse(true)}
                    className={`flex-1 h-16 rounded-xl font-bold text-lg transition-all ${
                      recommendCourse === true
                        ? 'bg-green-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
                    }`}
                  >
                    ✓ SÍ
                  </button>
                  <button
                    onClick={() => setRecommendCourse(false)}
                    className={`flex-1 h-16 rounded-xl font-bold text-lg transition-all ${
                      recommendCourse === false
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-102'
                    }`}
                  >
                    ✗ NO
                  </button>
                </div>
              </div>
            )}

            {/* Comments (Last Section) */}
            {currentSection === sections.length - 1 && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-gray-800 font-medium text-lg mb-3">
                  Comentarios y/o Sugerencias (Opcional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Comparte tus comentarios, sugerencias o cualquier observación que consideres importante..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {comments.length} / 500 caracteres
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={prevSection}
            disabled={currentSection === 0}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
              currentSection === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl'
            }`}
          >
            ← Anterior
          </button>

          {currentSection < sections.length - 1 ? (
            <button
              onClick={nextSection}
              className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || submitting}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                !canSubmit() || submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </span>
              ) : (
                '✓ Enviar Encuesta'
              )}
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {canSubmit() 
              ? '¡Todas las preguntas han sido respondidas! Puedes enviar la encuesta.'
              : 'Por favor responde todas las preguntas para poder enviar la encuesta.'}
          </p>
        </div>
      </div>
    </div>
  )
}
