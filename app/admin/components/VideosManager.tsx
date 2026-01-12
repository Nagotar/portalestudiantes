"use client"

import { useState, useEffect } from "react"

interface Video {
  id: number
  title: string
  description: string
  category: string
  type: "didactico" | "informativo"
  duration: string
  thumbnail?: string
  videoUrl?: string
  uploadDate: string
  views: number
  active: boolean
  featured: boolean
  cursoId?: number
}

interface Course {
  id: number
  name: string
  category: string
  active: boolean
}

export default function VideosManager() {
  const [videos, setVideos] = useState<Video[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  useEffect(() => {
    loadVideos()
    loadCourses()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/videos')
      const data = await response.json()

      if (response.ok) {
        setVideos(data.videos || [])
        setError("")
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando videos:', err)
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

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setThumbnailPreview(video.thumbnail || null)
    setShowModal(true)
  }

  const handleNewVideo = () => {
    setEditingVideo({
      id: Date.now(),
      title: "",
      description: "",
      category: "",
      type: "informativo",
      duration: "00:00",
      uploadDate: new Date().toISOString().split('T')[0],
      views: 0,
      active: true,
      featured: false,
      cursoId: undefined
    })
    setThumbnailPreview(null)
    setVideoFile(null)
    setShowModal(true)
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setThumbnailPreview(result)
        if (editingVideo) {
          setEditingVideo({ ...editingVideo, thumbnail: result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      if (editingVideo) {
        setEditingVideo({ ...editingVideo, videoUrl: URL.createObjectURL(file) })
      }
    }
  }

  const handleSave = async () => {
    if (!editingVideo) return

    if (!editingVideo.title || !editingVideo.description || !editingVideo.category) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      const isNew = editingVideo.id > 1000000

      const response = await fetch(
        isNew ? '/api/videos' : `/api/videos/${editingVideo.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingVideo.title,
            description: editingVideo.description,
            category: editingVideo.category,
            type: editingVideo.type,
            duration: editingVideo.duration,
            thumbnail: editingVideo.thumbnail,
            videoUrl: editingVideo.videoUrl,
            uploadDate: editingVideo.uploadDate,
            active: editingVideo.active,
            featured: editingVideo.featured
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar video')
      }

      await loadVideos()
      setShowModal(false)
      setEditingVideo(null)
      setVideoFile(null)
      setThumbnailPreview(null)
    } catch (err: any) {
      alert(err.message)
      console.error('Error guardando video:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      const video = videos.find(v => v.id === id)
      if (!video) return

      const response = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...video,
          active: !video.active
        })
      })

      if (response.ok) {
        await loadVideos()
      }
    } catch (err: any) {
      alert('Error al cambiar estado del video')
      console.error('Error:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este video?")) return

    try {
      setLoading(true)
      const response = await fetch(`/api/videos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadVideos()
      }
    } catch (err: any) {
      alert('Error al eliminar video')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Videos Didácticos</h3>
          <p className="text-sm text-gray-600">Gestiona el contenido educativo en video</p>
        </div>
        <button 
          onClick={handleNewVideo}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Subir Video
        </button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative h-40 bg-gray-900">
              {video.thumbnail ? (
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
                {video.duration}
              </div>
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${
                video.active ? "bg-green-500 text-white" : "bg-gray-500 text-white"
              }`}>
                {video.active ? "Activo" : "Inactivo"}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-2">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{video.title}</h4>
                <p className="text-xs text-gray-500 mb-2">{video.category}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {video.views.toLocaleString()}
                </span>
                <span>{video.uploadDate}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(video.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    video.active
                      ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                      : "text-green-700 bg-green-50 hover:bg-green-100"
                  }`}
                >
                  {video.active ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && editingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {editingVideo.id > 1000000 ? "Nuevo Video" : "Editar Video"}
                  </h3>
                  <p className="text-sm text-gray-600">Completa la información del video didáctico</p>
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

            <div className="p-6 space-y-4">
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Archivo de Video</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-gray-600 font-medium">
                      {videoFile ? (
                        <span className="text-green-600">{videoFile.name}</span>
                      ) : (
                        <>
                          <span className="text-black">Haz clic para subir video</span> o arrastra y suelta
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">MP4, WEBM, MOV hasta 500MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                </label>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Miniatura (Thumbnail)</label>
                {thumbnailPreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailPreview(null)
                        if (editingVideo) setEditingVideo({ ...editingVideo, thumbnail: undefined })
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">Subir imagen de portada</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Título del Video</label>
                  <input
                    type="text"
                    value={editingVideo.title}
                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Ej: Introducción a React"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tipo de Video</label>
                  <select
                    value={editingVideo.type}
                    onChange={(e) => setEditingVideo({ ...editingVideo, type: e.target.value as "didactico" | "informativo", cursoId: e.target.value === "informativo" ? undefined : editingVideo.cursoId })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  >
                    <option value="informativo">Informativo (Portada)</option>
                    <option value="didactico">Didáctico (Cursos)</option>
                  </select>
                </div>

                {editingVideo.type === "didactico" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Curso <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingVideo.cursoId || ""}
                      onChange={(e) => setEditingVideo({ ...editingVideo, cursoId: e.target.value ? Number(e.target.value) : undefined })}
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
                      El video se mostrará en el portal del estudiante dentro de este curso
                    </p>
                  </div>
                )}

                <div className={editingVideo.type === "didactico" ? "col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Categoría</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  >
                    <option value="">Seleccionar categoría</option>
                    <optgroup label="Videos Institucionales">
                      <option value="Institucional">Institucional</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Testimonios">Testimonios</option>
                      <option value="Seguridad">Seguridad Laboral</option>
                    </optgroup>
                    <optgroup label="Maquinaria Pesada">
                      <option value="Excavadoras">Excavadoras</option>
                      <option value="Retroexcavadoras">Retroexcavadoras</option>
                      <option value="Cargadores Frontales">Cargadores Frontales</option>
                      <option value="Bulldozers">Bulldozers</option>
                      <option value="Motoniveladoras">Motoniveladoras</option>
                      <option value="Rodillos Compactadores">Rodillos Compactadores</option>
                      <option value="Grúas">Grúas</option>
                      <option value="Camiones Tolva">Camiones Tolva</option>
                    </optgroup>
                    <optgroup label="Mantenimiento">
                      <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                      <option value="Mantenimiento Correctivo">Mantenimiento Correctivo</option>
                      <option value="Diagnóstico">Diagnóstico de Fallas</option>
                    </optgroup>
                    <optgroup label="Certificaciones">
                      <option value="Certificación Básica">Certificación Básica</option>
                      <option value="Certificación Avanzada">Certificación Avanzada</option>
                      <option value="Renovación">Renovación de Licencias</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Duración</label>
                  <input
                    type="text"
                    value={editingVideo.duration}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="00:00"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Descripción</label>
                  <textarea
                    value={editingVideo.description}
                    onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    placeholder="Describe el contenido del video..."
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingVideo.featured}
                    onChange={(e) => setEditingVideo({ ...editingVideo, featured: e.target.checked })}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                    Destacar en portada (solo para videos informativos)
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
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
                Guardar Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
