"use client"

import { useState, useEffect } from "react"

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
  createdAt: string
  updatedAt: string
  questions?: Question[]
}

interface Course {
  id: number
  name: string
  category: string
  active: boolean
}

interface Stats {
  totalResponses: number
  overallAverage?: number
  sections: {
    [key: string]: {
      average?: number
      questions: any[]
    }
  }
  comments: Array<{ text: string; submittedAt: string }>
}

export default function SatisfactionSurveysManager() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    loadSurveys()
    loadCourses()
  }, [])

  const loadSurveys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/satisfaction-surveys?includeQuestions=true')
      const data = await response.json()

      if (response.ok) {
        setSurveys(data.surveys || [])
        setError("")
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando encuestas:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses?active=true')
      const data = await response.json()

      if (response.ok) {
        setCourses(data.courses || [])
      }
    } catch (err) {
      console.error('Error cargando cursos:', err)
    }
  }

  const loadStats = async (surveyId: number) => {
    try {
      setLoadingStats(true)
      const response = await fetch(`/api/satisfaction-surveys/stats?surveyId=${surveyId}`)
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleViewStats = async (survey: Survey) => {
    setSelectedSurvey(survey)
    setShowStatsModal(true)
    await loadStats(survey.id)
  }

  const handleToggleActive = async (survey: Survey) => {
    try {
      const response = await fetch(`/api/satisfaction-surveys/${survey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...survey, active: !survey.active })
      })

      if (response.ok) {
        await loadSurveys()
      }
    } catch (err) {
      console.error('Error actualizando encuesta:', err)
    }
  }

  const getSectionColor = (section: string) => {
    const colors: { [key: string]: string } = {
      'MÓDULOS Y CONTENIDOS': 'bg-blue-100 text-blue-800',
      'INSTRUCTOR-EXPOSITOR': 'bg-green-100 text-green-800',
      'INFRAESTRUCTURA': 'bg-purple-100 text-purple-800',
      'SATISFACCIÓN': 'bg-orange-100 text-orange-800'
    }
    return colors[section] || 'bg-gray-100 text-gray-800'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 6) return 'text-green-600 font-bold'
    if (rating >= 4) return 'text-yellow-600 font-bold'
    return 'text-red-600 font-bold'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Encuestas de Satisfacción</h2>
          <p className="text-gray-600 mt-1">Gestiona las encuestas de satisfacción de los cursos</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista de Encuestas */}
      <div className="grid gap-6">
        {surveys.map((survey) => (
          <div key={survey.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{survey.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    survey.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.active ? 'Activa' : 'Inactiva'}
                  </span>
                  {survey.requiredForCertificate && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Obligatoria
                    </span>
                  )}
                  {survey.anonymous && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Anónima
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{survey.description}</p>
                {survey.courseId && (
                  <p className="text-sm text-gray-500">
                    Curso: {courses.find(c => c.id === survey.courseId)?.name || 'N/A'}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewStats(survey)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Ver Resultados
                </button>
                <button
                  onClick={() => handleToggleActive(survey)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    survey.active
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {survey.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>

            {/* Preguntas por Sección */}
            {survey.questions && (
              <div className="space-y-4 mt-4">
                {['MÓDULOS Y CONTENIDOS', 'INSTRUCTOR-EXPOSITOR', 'INFRAESTRUCTURA', 'SATISFACCIÓN'].map((section) => {
                  const sectionQuestions = survey.questions?.filter(q => q.section === section) || []
                  if (sectionQuestions.length === 0) return null

                  return (
                    <div key={section} className="border-t pt-4">
                      <h4 className={`text-sm font-semibold px-3 py-1 rounded-lg inline-block mb-3 ${getSectionColor(section)}`}>
                        {section}
                      </h4>
                      <div className="space-y-2 ml-4">
                        {sectionQuestions.map((q) => (
                          <div key={q.id} className="text-sm text-gray-700">
                            <span className="font-medium">{q.questionNumber}.</span> {q.questionText}
                            {q.questionType === 'scale' && (
                              <span className="text-gray-500 ml-2">(Escala 1-7)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {surveys.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay encuestas</h3>
            <p className="mt-1 text-sm text-gray-500">La encuesta predefinida ya está creada en la base de datos</p>
          </div>
        )}
      </div>

      {/* Modal de Estadísticas */}
      {showStatsModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedSurvey.title}</h3>
                <p className="text-gray-600">Resultados y Estadísticas</p>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {loadingStats ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  {/* Resumen General */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600 font-medium">Total de Respuestas</div>
                      <div className="text-3xl font-bold text-blue-900 mt-1">{stats.totalResponses}</div>
                    </div>
                    {stats.overallAverage && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 font-medium">Promedio General</div>
                        <div className={`text-3xl font-bold mt-1 ${getRatingColor(stats.overallAverage)}`}>
                          {stats.overallAverage.toFixed(2)} / 7
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas por Sección */}
                  {Object.entries(stats.sections).map(([section, data]: [string, any]) => (
                    <div key={section} className="border rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className={`text-lg font-bold px-4 py-2 rounded-lg ${getSectionColor(section)}`}>
                          {section}
                        </h4>
                        {data.average && (
                          <div className={`text-2xl font-bold ${getRatingColor(data.average)}`}>
                            Promedio: {data.average.toFixed(2)} / 7
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {data.questions.map((q: any) => (
                          <div key={q.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <span className="font-semibold text-gray-900">{q.questionNumber}.</span>
                                <span className="text-gray-700 ml-2">{q.questionText}</span>
                              </div>
                              {q.average !== undefined && (
                                <div className={`text-xl font-bold ml-4 ${getRatingColor(q.average)}`}>
                                  {q.average.toFixed(2)}
                                </div>
                              )}
                              {q.percentage !== undefined && (
                                <div className="text-xl font-bold ml-4 text-green-600">
                                  {q.yes} Sí ({q.percentage}%)
                                </div>
                              )}
                            </div>

                            {q.distribution && (
                              <div className="mt-3">
                                <div className="flex gap-2 items-end h-24">
                                  {[1, 2, 3, 4, 5, 6, 7].map((rating) => {
                                    const count = q.distribution[rating] || 0
                                    const maxCount = Math.max(...Object.values(q.distribution))
                                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0

                                    return (
                                      <div key={rating} className="flex-1 flex flex-col items-center">
                                        <div className="text-xs font-medium text-gray-600 mb-1">{count}</div>
                                        <div
                                          className="w-full bg-blue-500 rounded-t transition-all"
                                          style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                                        ></div>
                                        <div className="text-xs font-medium text-gray-700 mt-1">{rating}</div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Comentarios */}
                  {stats.comments && stats.comments.length > 0 && (
                    <div className="border rounded-lg p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        Comentarios y Sugerencias ({stats.comments.length})
                      </h4>
                      <div className="space-y-3">
                        {stats.comments.map((comment, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(comment.submittedAt).toLocaleDateString('es-CL')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay respuestas disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
