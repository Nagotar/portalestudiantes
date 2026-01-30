"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useConfig } from "@/contexts/ConfigContext"

interface Course {
  id: number
  name: string
  progress: number
  instructor: string
  thumbnail: string
  image?: string
  totalVideos: number
  completedVideos: number
  nextLesson: string
  category: string
}

interface Evaluation {
  id: number
  title: string
  type: "practica" | "final"
  course: string
  duration: number
  questions: number
  attempts: number
  maxAttempts: number
  bestScore?: number
  status: "disponible" | "completada" | "bloqueada"
  dueDate?: string
}

export default function EstudianteDashboard() {
  const [activeTab, setActiveTab] = useState<"cursos" | "evaluaciones" | "progreso" | "encuestas">("cursos")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loadingEvaluations, setLoadingEvaluations] = useState(true)
  const [studentStats, setStudentStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    averageScore: 0
  })
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseMaterials, setCourseMaterials] = useState<any[]>([])
  const [loadingCourseMaterials, setLoadingCourseMaterials] = useState(false)
  const [progressData, setProgressData] = useState<any>(null)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const router = useRouter()
  const { config } = useConfig()

  useEffect(() => {
    loadStudentCourses()
    loadStudentEvaluations()
  }, [])

  useEffect(() => {
    if (activeTab === 'progreso') {
      loadProgressData()
    }
  }, [activeTab])

  const loadStudentCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await fetch('/api/student/courses')
      const data = await response.json()

      if (response.ok) {
        // Mapear los cursos de la BD al formato del componente
        const mappedCourses = data.courses.map((course: any) => ({
          id: course.id,
          name: course.name,
          progress: course.progress,
          instructor: course.instructor || "Instructor",
          thumbnail: getThumbnailGradient(course.category),
          image: course.image, // Foto de portada del curso
          totalVideos: course.stats.totalVideos,
          completedVideos: course.stats.completedVideos,
          nextLesson: course.isCompleted ? "Curso completado" : "Próxima clase presencial",
          category: course.category || "General"
        }))
        
        setCourses(mappedCourses)
        setStudentStats({
          enrolledCourses: data.stats.activeCourses,
          completedCourses: data.stats.completedCourses,
          averageScore: data.stats.averageProgress
        })
      }
    } catch (error) {
      console.error('Error cargando cursos:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const getThumbnailGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'Excavadoras': 'from-yellow-500 to-orange-600',
      'Grúas': 'from-blue-500 to-cyan-600',
      'Mantenimiento': 'from-green-500 to-emerald-600',
      'Retroexcavadoras': 'from-purple-500 to-pink-600',
      'Cargadores': 'from-red-500 to-orange-600'
    }
    return gradients[category] || 'from-gray-500 to-gray-600'
  }

  const loadStudentEvaluations = async () => {
    try {
      setLoadingEvaluations(true)
      const response = await fetch('/api/student/evaluations')
      const data = await response.json()

      if (response.ok) {
        setEvaluations(data.evaluations)
      }
    } catch (error) {
      console.error('Error cargando evaluaciones:', error)
    } finally {
      setLoadingEvaluations(false)
    }
  }

  const loadProgressData = async () => {
    try {
      setLoadingProgress(true)
      const response = await fetch('/api/student/progress')
      const data = await response.json()

      if (response.ok) {
        setProgressData(data)
      }
    } catch (error) {
      console.error('Error cargando progreso:', error)
    } finally {
      setLoadingProgress(false)
    }
  }

  const handleOpenMaterials = async (course: Course) => {
    setSelectedCourse(course)
    setShowMaterialsModal(true)
    setLoadingCourseMaterials(true)
    
    try {
      const response = await fetch(`/api/student/courses/${course.id}/materials`)
      const data = await response.json()
      
      if (response.ok) {
        setCourseMaterials(data.materials)
      }
    } catch (error) {
      console.error('Error cargando materiales:', error)
    } finally {
      setLoadingCourseMaterials(false)
    }
  }

  const handleDownloadMaterial = async (material: any) => {
    // Marcar material como visto
    try {
      await fetch(`/api/student/materials/${material.id}/view`, {
        method: 'POST'
      })
      // Recargar cursos para actualizar progreso
      loadStudentCourses()
    } catch (error) {
      console.error('Error marcando material como visto:', error)
    }

    // Descargar o abrir material
    if (material.type === 'pdf' && material.content) {
      const byteCharacters = atob(material.content.split(',')[1] || material.content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${material.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (material.url) {
      window.open(material.url, '_blank')
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
      case 'youtube':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.5 10.5l-5 3a.5.5 0 01-.75-.433v-6a.5.5 0 01.75-.433l5 3a.5.5 0 010 .866z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const studentInfo = {
    name: "Juan Pérez",
    email: "juan.perez@estudiante.cl",
    enrolledCourses: studentStats.enrolledCourses,
    completedCourses: studentStats.completedCourses,
    averageScore: studentStats.averageScore
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              {config?.logo ? (
                <img 
                  src={config.logo} 
                  alt={config.siteName || "Logo"} 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {(config?.siteName || "Portal Estudiante").charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900">{config?.siteName || "Portal Estudiante"}</h1>
                <p className="text-xs text-gray-600">Dashboard de Aprendizaje</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{studentInfo.name}</p>
                  <p className="text-xs text-gray-600">Estudiante</p>
                </div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold hover:opacity-90 transition-opacity"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`
                  }}
                >
                  {studentInfo.name.charAt(0)}
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Cursos Activos</h3>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config?.primaryColor || '#3B82F6'}15` }}
              >
                <svg className="w-5 h-5" style={{ color: config?.primaryColor || '#3B82F6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{studentInfo.enrolledCourses}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Completados</h3>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{studentInfo.completedCourses}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Promedio</h3>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config?.accentColor || '#9333EA'}15` }}
              >
                <svg className="w-5 h-5" style={{ color: config?.accentColor || '#9333EA' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{studentInfo.averageScore}%</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Evaluaciones</h3>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config?.buttonColor || '#F97316'}15` }}
              >
                <svg className="w-5 h-5" style={{ color: config?.buttonColor || '#F97316' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{evaluations.filter(e => e.status === "disponible").length}</p>
            <p className="text-xs text-gray-600 mt-1">Disponibles</p>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="container mx-auto px-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("cursos")}
              style={activeTab === "cursos" ? { borderColor: config?.primaryColor || '#000000' } : {}}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "cursos"
                  ? "text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Mis Cursos
            </button>
            <button
              onClick={() => setActiveTab("evaluaciones")}
              style={activeTab === "evaluaciones" ? { borderColor: config?.primaryColor || '#000000' } : {}}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "evaluaciones"
                  ? "text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Evaluaciones
            </button>
            <button
              onClick={() => setActiveTab("progreso")}
              style={activeTab === "progreso" ? { borderColor: config?.primaryColor || '#000000' } : {}}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "progreso"
                  ? "text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Mi Progreso
            </button>
            <button
              onClick={() => setActiveTab("encuestas")}
              style={activeTab === "encuestas" ? { borderColor: config?.primaryColor || '#000000' } : {}}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "encuestas"
                  ? "text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Encuestas
            </button>
          </nav>

          <div className="p-6">
            {/* Mis Cursos Tab */}
            {activeTab === "cursos" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Cursos Presenciales</h2>
                  <p className="text-gray-600">Accede a videos de repaso y material de estudio para complementar tus clases presenciales</p>
                </div>

                {loadingCourses ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: config?.primaryColor || '#3B82F6' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600">Cargando tus cursos...</p>
                    </div>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes cursos asignados</h3>
                    <p className="text-gray-600">Contacta con el administrador para inscribirte en un curso</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {courses.map((course) => {
                      return (
                        <div key={course.id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group">
                      {course.image ? (
                        <div className="h-48 overflow-hidden relative">
                          <img 
                            src={course.image} 
                            alt={course.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {course.progress === 100 && (
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Completado
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`h-48 bg-gradient-to-br ${course.thumbnail} flex items-center justify-center relative`}>
                          <svg className="w-20 h-20 text-white opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {course.progress === 100 && (
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Completado
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-bold text-gray-900 text-xl leading-tight flex-1">{course.name}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold ml-3 whitespace-nowrap">
                            {course.category}
                          </span>
                        </div>

                        <div className="mb-5">
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-gray-600 font-medium">Progreso del curso</span>
                            <span className="font-bold text-gray-900 text-lg">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenMaterials(course)}
                          className="block w-full text-center px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          {course.progress === 100 ? "Ver Material de Repaso" : "Acceder a Material"}
                        </button>
                      </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Evaluaciones Tab */}
            {activeTab === "evaluaciones" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Evaluaciones</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {evaluations.filter(e => e.status === "disponible").length} Disponibles
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {evaluations.filter(e => e.status === "completada").length} Completadas
                    </span>
                  </div>
                </div>

                {loadingEvaluations ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: config?.primaryColor || '#3B82F6' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600">Cargando evaluaciones...</p>
                    </div>
                  </div>
                ) : evaluations.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay evaluaciones disponibles</h3>
                    <p className="text-gray-600">Las evaluaciones aparecerán aquí cuando estén asignadas a tus cursos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className={`border-2 rounded-xl p-6 transition-all ${
                        evaluation.status === "disponible"
                          ? "border-blue-200 bg-blue-50/30 hover:border-blue-400 hover:shadow-md"
                          : evaluation.status === "completada"
                          ? "border-green-200 bg-green-50/30"
                          : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{evaluation.title}</h3>
                            {evaluation.type === "final" && (
                              <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-300">
                                EVALUACIÓN FINAL
                              </span>
                            )}
                            {evaluation.status === "completada" && (
                              <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                                ✓ Completada
                              </span>
                            )}
                            {evaluation.status === "bloqueada" && (
                              <span className="px-3 py-1 text-xs font-bold bg-gray-200 text-gray-700 rounded-full">
                                🔒 Bloqueada
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{evaluation.course}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {evaluation.duration} minutos
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {evaluation.questions} preguntas
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {evaluation.attempts}/{evaluation.maxAttempts === 999 ? "∞" : evaluation.maxAttempts} intentos
                            </span>
                            {evaluation.dueDate && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Vence: {new Date(evaluation.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {evaluation.bestScore !== undefined && (
                            <div className="mt-4 flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Mejor puntuación:</span>
                              <span className={`text-lg font-bold ${evaluation.bestScore >= 70 ? "text-green-600" : "text-red-600"}`}>
                                {evaluation.bestScore}%
                              </span>
                            </div>
                          )}

                          {evaluation.status === "bloqueada" && (
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                <span className="font-semibold">Requisito:</span> Debes completar todas las evaluaciones de práctica antes de acceder a la evaluación final.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="ml-6">
                          {evaluation.status === "disponible" && (
                            <Link
                              href={`/estudiante/evaluacion/${evaluation.id}`}
                              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-block"
                            >
                              Iniciar Evaluación
                            </Link>
                          )}
                          {evaluation.status === "completada" && (
                            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                              Ver Resultados
                            </button>
                          )}
                          {evaluation.status === "bloqueada" && (
                            <button disabled className="px-6 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                              No Disponible
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mi Progreso Tab */}
            {activeTab === "progreso" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Progreso</h2>

                {loadingProgress ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600">Cargando progreso...</p>
                    </div>
                  </div>
                ) : progressData ? (
                  <>
                    {/* Tarjetas de Resumen */}
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm opacity-90">Cursos Activos</span>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold">{progressData.summary.totalCourses}</p>
                        <p className="text-xs opacity-75 mt-1">{progressData.summary.completedCourses} completados</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm opacity-90">Videos Vistos</span>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold">{progressData.summary.totalVideosViewed}</p>
                        <p className="text-xs opacity-75 mt-1">Contenido multimedia</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm opacity-90">Materiales</span>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold">{progressData.summary.totalMaterialsViewed}</p>
                        <p className="text-xs opacity-75 mt-1">Documentos descargados</p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm opacity-90">Promedio</span>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold">{progressData.summary.averageScore}%</p>
                        <p className="text-xs opacity-75 mt-1">{progressData.summary.passedEvaluations}/{progressData.summary.totalEvaluations} aprobadas</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Progreso por Curso</h3>
                        <div className="space-y-4">
                          {progressData.courseProgress.map((course: any) => (
                            <div key={course.id}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{course.name}</span>
                                <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex gap-4 text-xs text-gray-600">
                                <span>📹 {course.stats.videos.completed}/{course.stats.videos.total}</span>
                                <span>📄 {course.stats.materials.completed}/{course.stats.materials.total}</span>
                                <span>✅ {course.stats.evaluations.completed}/{course.stats.evaluations.total}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
                        <div className="space-y-3">
                          {progressData.recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente</p>
                          ) : (
                            progressData.recentActivity.map((activity: any, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                  {activity.type === 'video' && (
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                      </svg>
                                    </div>
                                  )}
                                  {activity.type === 'material' && (
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  {activity.type === 'evaluation' && (
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                  <p className="text-xs text-gray-500">{activity.courseName}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(activity.date).toLocaleDateString('es-ES', { 
                                      day: 'numeric', 
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Excelente Progreso!</h3>
                  <p className="text-gray-600 mb-4">
                    Has completado el 65% de tus cursos activos. ¡Sigue así!
                  </p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Próximo objetivo:</span>
                    <span className="text-sm font-bold text-blue-600">Completar Operador de Excavadoras</span>
                  </div>
                </div>
              </div>
            )}

            {/* Encuestas Tab */}
            {activeTab === "encuestas" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Encuestas de Satisfacción</h2>
                  <p className="text-gray-600">Ayúdanos a mejorar compartiendo tu opinión sobre los cursos</p>
                </div>

                <div className="grid gap-6">
                  {/* Encuesta Disponible */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">Encuesta de Satisfacción RC-ES-01</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                            Disponible
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Evaluación de módulos, instructor, infraestructura y satisfacción general del curso
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>15 preguntas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>10-15 minutos</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="font-medium text-orange-600">Obligatoria</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Secciones:</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-700">Módulos y Contenidos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-700">Instructor-Expositor</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-gray-700">Infraestructura</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-gray-700">Satisfacción General</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href="/estudiante/encuesta/1"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          Responder Encuesta
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje informativo */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">¿Por qué son importantes las encuestas?</h4>
                        <p className="text-sm text-blue-800">
                          Tu opinión nos ayuda a mejorar continuamente la calidad de nuestros cursos, instalaciones y servicios. 
                          Las encuestas son anónimas y tus respuestas son confidenciales.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal de Materiales del Curso */}
      {showMaterialsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedCourse.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Material de Estudio y Recursos</p>
              </div>
              <button
                onClick={() => setShowMaterialsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingCourseMaterials ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Cargando materiales...</p>
                  </div>
                </div>
              ) : courseMaterials.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay materiales disponibles</h3>
                  <p className="text-sm text-gray-600">Los materiales se agregarán próximamente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Descarga manuales, guías y recursos complementarios para tu aprendizaje
                  </p>
                  {courseMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {getFileIcon(material.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">{material.title}</h4>
                          <p className="text-sm text-gray-600">{material.description || 'Material de estudio'}</p>
                          {material.size && (
                            <p className="text-xs text-gray-500 mt-1">{material.size} MB</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadMaterial(material)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {material.type === 'youtube' ? 'Ver Video' : 'Descargar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{courseMaterials.length}</span> material{courseMaterials.length !== 1 ? 'es' : ''} disponible{courseMaterials.length !== 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => setShowMaterialsModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
