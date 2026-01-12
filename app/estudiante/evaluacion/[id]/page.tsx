"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface Question {
  id: number
  type: "multiple" | "true-false" | "open"
  question: string
  options?: string[]
  correctAnswer?: string | number
  points: number
}

interface Answer {
  questionId: number
  answer: string | number
}

export default function EvaluacionPage() {
  const params = useParams()
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(1800)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [evaluationInfo, setEvaluationInfo] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    loadEvaluationData()
  }, [])

  const loadEvaluationData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/evaluations/${params.id}/questions`)
      const data = await response.json()

      if (response.ok) {
        setEvaluationInfo({
          id: data.evaluation.id,
          title: data.evaluation.title,
          type: data.evaluation.category.toLowerCase().includes('final') ? 'final' : 'practica',
          course: data.evaluation.course,
          duration: data.evaluation.duration,
          totalQuestions: data.evaluation.totalQuestions,
          passingScore: 70,
          attempts: 0,
          maxAttempts: 999
        })
        setQuestions(data.questions)
        setTimeRemaining(data.evaluation.duration * 60)
      } else {
        console.error('Error cargando evaluación:', data.error)
        router.push('/estudiante')
      }
    } catch (error) {
      console.error('Error cargando evaluación:', error)
      router.push('/estudiante')
    } finally {
      setLoading(false)
    }
  }

  const questionsHardcoded: Question[] = [
    {
      id: 1,
      type: "multiple",
      question: "¿Cuál es el primer paso antes de arrancar una excavadora?",
      options: [
        "Encender el motor directamente",
        "Revisar los niveles de fluidos y realizar inspección visual",
        "Subir a la cabina y arrancar",
        "Probar los controles"
      ],
      correctAnswer: 1,
      points: 10
    },
    {
      id: 2,
      type: "multiple",
      question: "¿Qué sistema de seguridad debe verificarse antes de operar?",
      options: [
        "Sistema de audio",
        "Sistema de aire acondicionado",
        "Sistema de frenos y alarma de retroceso",
        "Sistema de radio"
      ],
      correctAnswer: 2,
      points: 10
    },
    {
      id: 3,
      type: "true-false",
      question: "Es seguro operar una excavadora en terrenos con pendientes superiores a 30 grados sin precauciones especiales.",
      correctAnswer: "false",
      points: 10
    },
    {
      id: 4,
      type: "multiple",
      question: "¿Cuál es la función principal del brazo de la excavadora?",
      options: [
        "Sostener el cucharón y realizar movimientos de excavación",
        "Decoración de la máquina",
        "Almacenar herramientas",
        "Proteger al operador"
      ],
      correctAnswer: 0,
      points: 10
    },
    {
      id: 5,
      type: "true-false",
      question: "El operador debe usar siempre el cinturón de seguridad mientras opera la excavadora.",
      correctAnswer: "true",
      points: 10
    },
    {
      id: 6,
      type: "multiple",
      question: "¿Con qué frecuencia se debe realizar el mantenimiento preventivo básico?",
      options: [
        "Una vez al año",
        "Cada 6 meses",
        "Diariamente antes de iniciar operaciones",
        "Solo cuando hay fallas"
      ],
      correctAnswer: 2,
      points: 10
    },
    {
      id: 7,
      type: "multiple",
      question: "¿Qué debe hacer si detecta una fuga de aceite hidráulico?",
      options: [
        "Continuar trabajando",
        "Detener la máquina inmediatamente y reportar",
        "Agregar más aceite",
        "Ignorarlo si es pequeña"
      ],
      correctAnswer: 1,
      points: 10
    },
    {
      id: 8,
      type: "true-false",
      question: "Es permitido que personas no autorizadas suban a la excavadora mientras está en operación.",
      correctAnswer: "false",
      points: 10
    },
    {
      id: 9,
      type: "multiple",
      question: "¿Cuál es la distancia mínima de seguridad con líneas eléctricas aéreas?",
      options: [
        "1 metro",
        "3 metros",
        "5 metros o más según el voltaje",
        "No hay restricción"
      ],
      correctAnswer: 2,
      points: 10
    },
    {
      id: 10,
      type: "true-false",
      question: "El operador puede usar su teléfono móvil mientras opera la excavadora si es una llamada importante.",
      correctAnswer: "false",
      points: 10
    }
  ]

  useEffect(() => {
    if (started && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [started, showResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    setStarted(true)
    setTimeRemaining(evaluationInfo.duration * 60)
  }

  const handleAnswer = (questionId: number, answer: string | number) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId)
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingAnswerIndex] = { questionId, answer }
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, { questionId, answer }])
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    if (confirm("¿Estás seguro de enviar tu evaluación? No podrás modificar tus respuestas después.")) {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    let correct = 0
    let totalPoints = 0

    questions.forEach((question) => {
      const userAnswer = answers.find(a => a.questionId === question.id)
      if (userAnswer && question.correctAnswer !== undefined) {
        // Normalizar respuestas para comparación
        const userAnswerNormalized = String(userAnswer.answer).toLowerCase().trim()
        const correctAnswerNormalized = String(question.correctAnswer).toLowerCase().trim()
        
        console.log('Pregunta:', question.question)
        console.log('Respuesta usuario:', userAnswerNormalized)
        console.log('Respuesta correcta:', correctAnswerNormalized)
        console.log('¿Correcta?:', userAnswerNormalized === correctAnswerNormalized)
        console.log('---')
        
        if (userAnswerNormalized === correctAnswerNormalized) {
          correct++
          totalPoints += question.points
        }
      }
    })

    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      points: totalPoints,
      maxPoints: questions.reduce((sum, q) => sum + q.points, 0)
    }
  }

  const getCurrentAnswer = () => {
    const answer = answers.find(a => a.questionId === questions[currentQuestion].id)
    return answer?.answer
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 mx-auto mb-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 text-lg">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  if (!evaluationInfo || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se pudo cargar la evaluación</h3>
          <p className="text-gray-600 mb-4">Por favor, intenta nuevamente más tarde</p>
          <Link href="/estudiante" className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-block">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{evaluationInfo.title}</h1>
            <p className="text-gray-600">{evaluationInfo.course}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Duración</span>
              <span className="text-gray-900 font-bold">{evaluationInfo.duration} minutos</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Total de Preguntas</span>
              <span className="text-gray-900 font-bold">{evaluationInfo.totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Puntaje para Aprobar</span>
              <span className="text-gray-900 font-bold">{evaluationInfo.passingScore}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Intentos Disponibles</span>
              <span className="text-gray-900 font-bold">
                {evaluationInfo.maxAttempts === 999 ? "Ilimitados" : `${evaluationInfo.maxAttempts - evaluationInfo.attempts}`}
              </span>
            </div>
          </div>

          {evaluationInfo.type === "final" && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold text-red-900 mb-1">Evaluación Final</p>
                  <p className="text-sm text-red-700">
                    Esta es tu evaluación final. Solo tienes {evaluationInfo.maxAttempts} intento. Asegúrate de estar preparado antes de comenzar.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Lee cada pregunta cuidadosamente antes de responder</li>
              <li>Puedes navegar entre preguntas usando los botones</li>
              <li>El tiempo comenzará cuando hagas clic en "Comenzar Evaluación"</li>
              <li>Asegúrate de responder todas las preguntas antes de enviar</li>
              <li>Una vez enviada, no podrás modificar tus respuestas</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link
              href="/estudiante"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Volver
            </Link>
            <button
              onClick={handleStart}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Comenzar Evaluación
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const results = calculateScore()
    const passed = results.percentage >= evaluationInfo.passingScore

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 ${passed ? "bg-green-500" : "bg-red-500"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {passed ? (
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? "¡Felicitaciones!" : "Evaluación No Aprobada"}
            </h1>
            <p className="text-gray-600">
              {passed 
                ? "Has aprobado la evaluación exitosamente" 
                : "No alcanzaste el puntaje mínimo requerido"}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Tu Puntuación</p>
              <p className={`text-5xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}>
                {results.percentage}%
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Correctas</p>
                <p className="text-2xl font-bold text-gray-900">{results.correct}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Incorrectas</p>
                <p className="text-2xl font-bold text-gray-900">{results.total - results.correct}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Puntos</p>
                <p className="text-2xl font-bold text-gray-900">{results.points}/{results.maxPoints}</p>
              </div>
            </div>
          </div>

          {!passed && evaluationInfo.type === "practica" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Consejo:</span> Revisa el material del curso y vuelve a intentarlo. Las evaluaciones de práctica tienen intentos ilimitados.
              </p>
            </div>
          )}

          {!passed && evaluationInfo.type === "final" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Importante:</span> Has agotado tu intento en la evaluación final. Contacta con tu instructor para más información.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/estudiante"
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
            >
              Volver al Dashboard
            </Link>
            {!passed && evaluationInfo.type === "practica" && (
              <button
                onClick={() => {
                  setStarted(false)
                  setCurrentQuestion(0)
                  setAnswers([])
                  setShowResults(false)
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const currentAnswer = getCurrentAnswer()
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{evaluationInfo.title}</h1>
              <p className="text-sm text-gray-600">
                Pregunta {currentQuestion + 1} de {questions.length}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Tiempo Restante</p>
                <p className={`text-2xl font-bold ${timeRemaining < 300 ? "text-red-600" : "text-gray-900"}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">Respondidas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {answers.length}/{questions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {question.type === "multiple" ? "Opción Múltiple" : "Verdadero/Falso"}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
                  {question.points} puntos
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{question.question}</h2>
            </div>

            <div className="space-y-3">
              {question.type === "multiple" && question.options && (
                <>
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        currentAnswer === index
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          currentAnswer === index
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}>
                          {currentAnswer === index && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{option}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {question.type === "true-false" && (
                <>
                  <button
                    onClick={() => handleAnswer(question.id, "true")}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      currentAnswer === "true"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        currentAnswer === "true"
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300"
                      }`}>
                        {currentAnswer === "true" && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Verdadero</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAnswer(question.id, "false")}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      currentAnswer === "false"
                        ? "border-red-600 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        currentAnswer === "false"
                          ? "border-red-600 bg-red-600"
                          : "border-gray-300"
                      }`}>
                        {currentAnswer === "false" && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Falso</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            <div className="flex-1"></div>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Enviar Evaluación
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Siguiente →
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Navegador de Preguntas</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers.some(a => a.questionId === q.id)
                const isCurrent = index === currentQuestion

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isAnswered
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-gray-600">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-gray-600">Respondida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                <span className="text-gray-600">Sin responder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
