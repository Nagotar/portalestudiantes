"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Video {
  id: number
  title: string
  description: string
  category: string
  type: string
  duration: string
  thumbnail?: string
  videoUrl?: string
  uploadDate: string
  views: number
  active: boolean
  featured: boolean
  cursoId?: number
  completed?: boolean
  locked?: boolean
}

interface Material {
  id: number
  title: string
  type: "pdf" | "doc" | "ppt"
  size: string
  downloadUrl?: string
  content?: string
}

export default function CursoDetalle() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<"videos" | "material" | "info">("videos")
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)

  const courseInfo = {
    id: params.id,
    name: "Operador de Excavadoras",
    instructor: "Carlos Muñoz",
    description: "Curso presencial de formación para operador certificado de excavadoras hidráulicas. Aquí encontrarás videos de repaso y material de estudio complementario para reforzar lo aprendido en clases.",
    category: "Excavadoras",
    duration: "3 meses",
    level: "Principiante",
    progress: 65,
    totalVideos: 20,
    completedVideos: 13,
    nextClass: "Jueves 10:00 AM - Técnicas de excavación profunda"
  }

  useEffect(() => {
    loadVideos()
    loadMaterials()
  }, [])

  const loadVideos = async () => {
    try {
      setLoadingVideos(true)
      const cursoId = params.id
      const response = await fetch('/api/videos?active=true&type=didactico')
      const data = await response.json()

      if (response.ok) {
        // Filtrar videos por curso_id
        const videosDelCurso = (data.videos || []).filter((video: Video) => 
          video.cursoId && video.cursoId.toString() === cursoId
        )
        setVideos(videosDelCurso)
      }
    } catch (error) {
      console.error('Error cargando videos:', error)
    } finally {
      setLoadingVideos(false)
    }
  }

  const loadMaterials = async () => {
    try {
      setLoadingMaterials(true)
      const cursoId = params.id
      const response = await fetch(`/api/student/courses/${cursoId}/materials`)
      const data = await response.json()

      if (response.ok) {
        const mappedMaterials = data.materials.map((material: any) => ({
          id: material.id,
          title: material.title,
          type: material.type === 'pdf' ? 'pdf' : 'doc',
          size: material.size ? `${material.size} MB` : 'N/A',
          downloadUrl: material.url,
          content: material.content
        }))
        setMaterials(mappedMaterials)
      }
    } catch (error) {
      console.error('Error cargando materiales:', error)
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handlePlayVideo = async (video: Video) => {
    setSelectedVideo(video)
    setShowVideoModal(true)
    
    // Marcar video como visto
    try {
      await fetch(`/api/student/videos/${video.id}/view`, {
        method: 'POST'
      })
      // Recargar videos para actualizar estado
      loadVideos()
    } catch (error) {
      console.error('Error marcando video como visto:', error)
    }
  }

  const handleDownloadMaterial = async (material: Material) => {
    // Marcar material como visto
    try {
      await fetch(`/api/student/materials/${material.id}/view`, {
        method: 'POST'
      })
      // Recargar materiales para actualizar estado
      loadMaterials()
    } catch (error) {
      console.error('Error marcando material como visto:', error)
    }

    if (material.type === 'pdf' && material.content) {
      // Crear blob desde base64
      const byteCharacters = atob(material.content.split(',')[1] || material.content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      
      // Crear URL y descargar
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${material.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (material.downloadUrl) {
      // Abrir URL externa
      window.open(material.downloadUrl, '_blank')
    }
  }

  const handleVideoSelect = (video: Video) => {
    if (!video.locked) {
      handlePlayVideo(video)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
      case "doc":
        return (
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
      case "ppt":
        return (
          <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/estudiante"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{courseInfo.name}</h1>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm text-gray-600">Material de Repaso y Estudio</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Tu progreso</p>
                <p className="text-lg font-bold text-gray-900">{courseInfo.progress}%</p>
              </div>
              <div className="w-16 h-16">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - courseInfo.progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player / Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {selectedVideo ? (
                <>
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Reproductor de Video</p>
                      <p className="text-sm text-gray-400 mt-2">El video se reproducirá aquí</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {selectedVideo.duration}
                          </span>
                          {selectedVideo.completed && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Completado
                            </span>
                          )}
                        </div>
                      </div>
                      {!selectedVideo.completed && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                          Marcar como Completado
                        </button>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                      <p className="text-gray-600">{selectedVideo.description}</p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        Video Anterior
                      </button>
                      <button className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Siguiente Video
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <svg className="w-20 h-20 mx-auto mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-2">Videos de Repaso</h3>
                    <p className="text-blue-100">Selecciona un video para repasar el contenido de tus clases presenciales</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs for Material and Info */}
            <div className="bg-white rounded-xl border border-gray-200 mt-6">
              <nav className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("material")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "material"
                      ? "border-black text-gray-900"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Material de Apoyo
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "info"
                      ? "border-black text-gray-900"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Información del Curso
                </button>
              </nav>

              <div className="p-6">
                {activeTab === "material" && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-4">Material de Estudio</h3>
                    <p className="text-sm text-gray-600 mb-4">Descarga manuales, guías y presentaciones para complementar tu aprendizaje</p>
                    
                    {loadingMaterials ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : materials.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-600">No hay materiales disponibles para este curso</p>
                      </div>
                    ) : (
                      materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            {getFileIcon(material.type)}
                            <div>
                              <h4 className="font-medium text-gray-900">{material.title}</h4>
                              <p className="text-sm text-gray-600">{material.size}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDownloadMaterial(material)}
                            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "info" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Descripción del Curso</h3>
                      <p className="text-gray-600">{courseInfo.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Duración</p>
                        <p className="font-semibold text-gray-900">{courseInfo.duration}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Nivel</p>
                        <p className="font-semibold text-gray-900">{courseInfo.level}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Categoría</p>
                        <p className="font-semibold text-gray-900">{courseInfo.category}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Videos</p>
                        <p className="font-semibold text-gray-900">{courseInfo.totalVideos} lecciones</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Instructor</h3>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {courseInfo.instructor.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{courseInfo.instructor}</p>
                          <p className="text-sm text-gray-600">Instructor Certificado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Video List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Videos de Repaso</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {courseInfo.completedVideos} de {courseInfo.totalVideos} videos vistos
                </p>
                {courseInfo.nextClass && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-3.5 h-3.5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs font-medium text-blue-900">Próxima clase presencial:</p>
                    </div>
                    <p className="text-xs text-blue-700">{courseInfo.nextClass}</p>
                  </div>
                )}
              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {loadingVideos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">No hay videos disponibles</p>
                    <p className="text-xs text-gray-500 mt-1">Los videos se agregarán pronto</p>
                  </div>
                ) : (
                  videos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      disabled={video.locked}
                      className={`w-full text-left p-4 border-b border-gray-200 transition-all ${
                        selectedVideo?.id === video.id
                          ? "bg-blue-50 border-l-4 border-l-blue-600"
                          : video.locked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                    >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {video.completed ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : video.locked ? (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium mb-1 ${
                          selectedVideo?.id === video.id ? "text-blue-600" : "text-gray-900"
                        }`}>
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{video.duration}</span>
                          {video.locked && (
                            <span className="px-2 py-0.5 bg-gray-200 rounded text-gray-700">
                              Bloqueado
                            </span>
                          )}
                        </div>
                      </div>

                      {!video.locked && (
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedVideo.category}</p>
              </div>
              <button
                onClick={() => {
                  setShowVideoModal(false)
                  setSelectedVideo(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Video Player */}
              {selectedVideo.videoUrl ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  {selectedVideo.videoUrl.startsWith('data:video') || selectedVideo.videoUrl.startsWith('blob:') ? (
                    <video 
                      controls 
                      autoPlay
                      className="w-full h-full"
                      src={selectedVideo.videoUrl}
                    >
                      Tu navegador no soporta el elemento de video.
                    </video>
                  ) : (
                    <iframe
                      src={selectedVideo.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : selectedVideo.thumbnail ? (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 flex items-center justify-center relative">
                  <img 
                    src={selectedVideo.thumbnail} 
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Video no disponible</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Video no disponible</p>
                  </div>
                </div>
              )}

              {/* Video Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600">{selectedVideo.description}</p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Duración: {selectedVideo.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{selectedVideo.views.toLocaleString()} vistas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
