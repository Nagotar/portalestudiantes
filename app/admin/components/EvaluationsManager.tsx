"use client"

import { useState, useEffect } from "react"

interface Question {
  id: number
  type: "multiple" | "true-false" | "open"
  question: string
  options?: string[]
  correctAnswer?: string | number
  points: number
}

interface Course {
  id: number
  name: string
  category: string
  active: boolean
}

interface Evaluation {
  id: number
  title: string
  description: string
  category: string
  cursoId?: number
  tipoEvaluacion: "practica" | "final"
  fechaHabilitacion?: string
  fechaCierre?: string
  duration: number
  totalPoints: number
  questions: Question[]
  active: boolean
  createdDate: string
  attempts: number
}

export default function EvaluationsManager() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [showQuestionModal, setShowQuestionModal] = useState(false)

  useEffect(() => {
    loadEvaluations()
    loadCourses()
  }, [])

  const loadEvaluations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/evaluations?includeQuestions=true')
      const data = await response.json()

      if (response.ok) {
        setEvaluations(data.evaluations || [])
        setError("")
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando evaluaciones:', err)
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

  const handleNewEvaluation = () => {
    setEditingEvaluation({
      id: Date.now(),
      title: "",
      description: "",
      category: "",
      cursoId: undefined,
      tipoEvaluacion: "practica",
      fechaHabilitacion: undefined,
      fechaCierre: undefined,
      duration: 30,
      totalPoints: 0,
      questions: [],
      active: true,
      createdDate: new Date().toISOString().split('T')[0],
      attempts: 0
    })
    setShowModal(true)
  }

  const handleEdit = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation)
    setShowModal(true)
  }

  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: Date.now(),
      type: "multiple",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10
    })
    setShowQuestionModal(true)
  }

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question)
    setShowQuestionModal(true)
  }

  const handleSaveQuestion = () => {
    if (currentQuestion && editingEvaluation) {
      const existingIndex = editingEvaluation.questions.findIndex(q => q.id === currentQuestion.id)
      let updatedQuestions
      
      if (existingIndex >= 0) {
        updatedQuestions = editingEvaluation.questions.map(q => 
          q.id === currentQuestion.id ? currentQuestion : q
        )
      } else {
        updatedQuestions = [...editingEvaluation.questions, currentQuestion]
      }

      const totalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0)
      setEditingEvaluation({
        ...editingEvaluation,
        questions: updatedQuestions,
        totalPoints
      })
    }
    setShowQuestionModal(false)
    setCurrentQuestion(null)
  }

  const handleDeleteQuestion = (questionId: number) => {
    if (editingEvaluation) {
      const updatedQuestions = editingEvaluation.questions.filter(q => q.id !== questionId)
      const totalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0)
      setEditingEvaluation({
        ...editingEvaluation,
        questions: updatedQuestions,
        totalPoints
      })
    }
  }

  const handleSave = async () => {
    if (!editingEvaluation) return

    try {
      const isNew = editingEvaluation.id > 1000000
      const url = isNew ? '/api/evaluations' : `/api/evaluations/${editingEvaluation.id}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvaluation)
      })

      if (response.ok) {
        await loadEvaluations()
        setShowModal(false)
        setEditingEvaluation(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al guardar evaluación')
      }
    } catch (err: any) {
      console.error('Error guardando evaluación:', err)
      alert('Error al guardar evaluación')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      const evaluation = evaluations.find(e => e.id === id)
      if (!evaluation) return

      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...evaluation,
          active: !evaluation.active
        })
      })

      if (response.ok) {
        await loadEvaluations()
      }
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta evaluación?")) return

    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadEvaluations()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar evaluación')
      }
    } catch (err) {
      console.error('Error eliminando evaluación:', err)
      alert('Error al eliminar evaluación')
    }
  }

  const updateQuestionOption = (index: number, value: string) => {
    if (currentQuestion && currentQuestion.options) {
      const newOptions = [...currentQuestion.options]
      newOptions[index] = value
      setCurrentQuestion({ ...currentQuestion, options: newOptions })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Modelos de Evaluaciones</h3>
          <p className="text-sm text-gray-600">Crea y gestiona evaluaciones para los estudiantes</p>
        </div>
        <button 
          onClick={handleNewEvaluation}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Evaluación
        </button>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4">
            <p className="text-red-600 mb-2">Error al cargar evaluaciones</p>
            <button
              onClick={loadEvaluations}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Reintentar
            </button>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-medium mb-1">No hay evaluaciones creadas</p>
            <p className="text-sm text-gray-500">Haz clic en "Nueva Evaluación" para comenzar</p>
          </div>
        ) : (
          evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{evaluation.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    evaluation.active 
                      ? "bg-green-50 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {evaluation.active ? "Activa" : "Inactiva"}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    evaluation.tipoEvaluacion === "final"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-orange-50 text-orange-700"
                  }`}>
                    {evaluation.tipoEvaluacion === "final" ? "Evaluación Final" : "Práctica"}
                  </span>
                  {evaluation.cursoId && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {courses.find(c => c.id === evaluation.cursoId)?.name || 'Curso no encontrado'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{evaluation.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {evaluation.questions.length} preguntas
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {evaluation.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    {evaluation.totalPoints} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {evaluation.attempts} intentos
                  </span>
                </div>
                
                {evaluation.tipoEvaluacion === "final" && evaluation.fechaHabilitacion && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Habilitación: {new Date(evaluation.fechaHabilitacion).toLocaleString('es-ES')}
                      </span>
                      {evaluation.fechaCierre && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Cierre: {new Date(evaluation.fechaCierre).toLocaleString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(evaluation)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(evaluation.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    evaluation.active
                      ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                      : "text-green-700 bg-green-50 hover:bg-green-100"
                  }`}
                >
                  {evaluation.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleDelete(evaluation.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Main Modal - Evaluation Editor */}
      {showModal && editingEvaluation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {editingEvaluation.id > 1000000 ? "Nueva Evaluación" : "Editar Evaluación"}
                  </h3>
                  <p className="text-sm text-gray-600">Configura la evaluación y sus preguntas</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Información General</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Título</label>
                    <input
                      type="text"
                      value={editingEvaluation.title}
                      onChange={(e) => setEditingEvaluation({ ...editingEvaluation, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      placeholder="Ej: Evaluación de JavaScript"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Descripción</label>
                    <textarea
                      value={editingEvaluation.description}
                      onChange={(e) => setEditingEvaluation({ ...editingEvaluation, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                      placeholder="Describe el objetivo de la evaluación..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Curso <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingEvaluation.cursoId || ""}
                      onChange={(e) => {
                        const cursoId = e.target.value ? Number(e.target.value) : undefined
                        const selectedCourse = courses.find(c => c.id === cursoId)
                        setEditingEvaluation({ 
                          ...editingEvaluation, 
                          cursoId,
                          category: selectedCourse?.category || ""
                        })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Seleccionar curso</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      La evaluación será asignada a este curso
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Duración (minutos)</label>
                    <input
                      type="number"
                      value={editingEvaluation.duration}
                      onChange={(e) => setEditingEvaluation({ ...editingEvaluation, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      min="1"
                    />
                  </div>
                </div>

                {/* Tipo de Evaluación y Fechas */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tipo de Evaluación <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingEvaluation.tipoEvaluacion}
                      onChange={(e) => setEditingEvaluation({ 
                        ...editingEvaluation, 
                        tipoEvaluacion: e.target.value as "practica" | "final",
                        fechaHabilitacion: e.target.value === "practica" ? undefined : editingEvaluation.fechaHabilitacion,
                        fechaCierre: e.target.value === "practica" ? undefined : editingEvaluation.fechaCierre
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    >
                      <option value="practica">Evaluación de Práctica</option>
                      <option value="final">Evaluación Final</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {editingEvaluation.tipoEvaluacion === "practica" 
                        ? "Disponible siempre para los estudiantes" 
                        : "Se habilita en fecha específica para examen final"}
                    </p>
                  </div>

                  {editingEvaluation.tipoEvaluacion === "final" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Fecha de Habilitación <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editingEvaluation.fechaHabilitacion || ""}
                          onChange={(e) => setEditingEvaluation({ ...editingEvaluation, fechaHabilitacion: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Fecha y hora en que se habilitará la evaluación
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Fecha de Cierre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editingEvaluation.fechaCierre || ""}
                          onChange={(e) => setEditingEvaluation({ ...editingEvaluation, fechaCierre: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Fecha y hora límite para realizar la evaluación
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Questions Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Preguntas ({editingEvaluation.questions.length})</h4>
                    <p className="text-sm text-gray-600">Total: {editingEvaluation.totalPoints} puntos</p>
                  </div>
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Pregunta
                  </button>
                </div>

                {editingEvaluation.questions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 font-medium">No hay preguntas aún</p>
                    <p className="text-sm text-gray-500">Haz clic en "Agregar Pregunta" para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingEvaluation.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-900">Pregunta {index + 1}</span>
                              <span className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                                {question.type === "multiple" ? "Opción Múltiple" : question.type === "true-false" ? "Verdadero/Falso" : "Abierta"}
                              </span>
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                                {question.points} pts
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{question.question}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                Guardar Evaluación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && currentQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentQuestion.id > 1000000 ? "Nueva Pregunta" : "Editar Pregunta"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Pregunta</label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion({ 
                    ...currentQuestion, 
                    type: e.target.value as Question["type"],
                    options: e.target.value === "multiple" ? ["", "", "", ""] : undefined
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                >
                  <option value="multiple">Opción Múltiple</option>
                  <option value="true-false">Verdadero/Falso</option>
                  <option value="open">Respuesta Abierta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Pregunta</label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                  placeholder="Escribe la pregunta aquí..."
                />
              </div>

              {currentQuestion.type === "multiple" && currentQuestion.options && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Opciones</label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateQuestionOption(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          placeholder={`Opción ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Selecciona la respuesta correcta</p>
                </div>
              )}

              {currentQuestion.type === "true-false" && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Respuesta Correcta</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={currentQuestion.correctAnswer === "true"}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: "true" })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Verdadero</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={currentQuestion.correctAnswer === "false"}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: "false" })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Falso</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Puntos</label>
                <input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  min="1"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  setCurrentQuestion(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                Guardar Pregunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
