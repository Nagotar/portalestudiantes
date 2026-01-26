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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Redimensionar si es muy grande
          const maxDimension = 1920
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Comprimir a JPEG con calidad 0.8
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. Por favor, selecciona una imagen menor a 10MB.')
        return
      }

      try {
        // Comprimir imagen localmente primero
        const compressedImage = await compressImage(file)
        setThumbnailPreview(compressedImage)

        // Subir a Cloudinary
        const response = await fetch('/api/upload-cloudinary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: compressedImage,
            folder: 'videos'
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // Usar URL de Cloudinary
          if (editingVideo) {
            setEditingVideo({ ...editingVideo, thumbnail: data.url })
          }
          alert('✅ Thumbnail subido exitosamente a Cloudinary')
        } else {
          throw new Error(data.error || 'Error al subir thumbnail')
        }
      } catch (error) {
        console.error('Error subiendo thumbnail:', error)
        alert('Error al subir el thumbnail. Intenta con otra imagen.')
      }
    }
  }

  const convertToEmbedUrl = (url: string): string => {
    if (!url) return url
    
    const trimmedUrl = url.trim()
    
    // Detectar URLs inválidas (páginas principales sin video)
    if (trimmedUrl === 'https://vimeo.com' || trimmedUrl === 'https://vimeo.com/' || 
        trimmedUrl === 'https://www.vimeo.com' || trimmedUrl === 'https://www.vimeo.com/') {
      alert('❌ URL inválida\n\nEsto es la página principal de Vimeo, no un video específico.\n\nPor favor:\n1. Abre el video que quieres usar en Vimeo\n2. Copia la URL completa (ej: https://vimeo.com/123456789)\n3. Pégala aquí')
      return ''
    }
    
    if (trimmedUrl === 'https://youtube.com' || trimmedUrl === 'https://youtube.com/' ||
        trimmedUrl === 'https://www.youtube.com' || trimmedUrl === 'https://www.youtube.com/') {
      alert('❌ URL inválida\n\nEsto es la página principal de YouTube, no un video específico.\n\nPor favor:\n1. Abre el video que quieres usar en YouTube\n2. Copia la URL completa (ej: https://www.youtube.com/watch?v=ABC123)\n3. Pégala aquí')
      return ''
    }
    
    // YouTube: convertir watch?v= a embed
    if (trimmedUrl.includes('youtube.com/watch')) {
      const videoId = trimmedUrl.split('v=')[1]?.split('&')[0]
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }
    
    // YouTube: convertir youtu.be a embed
    if (trimmedUrl.includes('youtu.be/')) {
      const videoId = trimmedUrl.split('youtu.be/')[1]?.split('?')[0]
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Vimeo: convertir vimeo.com/VIDEO_ID a player.vimeo.com/video/VIDEO_ID
    if (trimmedUrl.includes('vimeo.com/') && !trimmedUrl.includes('player.vimeo.com')) {
      // Extraer el ID del video (puede tener parámetros después)
      const afterVimeo = trimmedUrl.split('vimeo.com/')[1]
      if (afterVimeo) {
        // Remover parámetros de query y paths adicionales
        const videoId = afterVimeo.split('?')[0].split('/')[0].split('#')[0]
        
        // Validar que sea un número válido
        if (videoId && !isNaN(Number(videoId)) && videoId.length > 0) {
          console.log('✅ Vimeo ID extraído:', videoId)
          return `https://player.vimeo.com/video/${videoId}`
        }
        
        // Si no se pudo extraer un ID válido
        alert('❌ URL de Vimeo inválida\n\nNo se pudo encontrar el ID del video.\n\nAsegúrate de copiar la URL completa del video, por ejemplo:\nhttps://vimeo.com/123456789')
        return ''
      }
    }
    
    // Google Drive: convertir URLs de compartir a formato preview
    if (trimmedUrl.includes('drive.google.com')) {
      // Formato 1: https://drive.google.com/file/d/FILE_ID/view
      if (trimmedUrl.includes('/file/d/')) {
        const fileId = trimmedUrl.split('/file/d/')[1]?.split('/')[0]?.split('?')[0]
        if (fileId) {
          console.log('✅ Google Drive ID extraído:', fileId)
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      
      // Formato 2: https://drive.google.com/open?id=FILE_ID
      if (trimmedUrl.includes('open?id=')) {
        const fileId = trimmedUrl.split('open?id=')[1]?.split('&')[0]
        if (fileId) {
          console.log('✅ Google Drive ID extraído:', fileId)
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      
      // Si ya está en formato preview, dejarlo como está
      if (trimmedUrl.includes('/preview')) {
        return trimmedUrl
      }
      
      // Si no se pudo convertir
      alert('❌ URL de Google Drive inválida\n\nAsegúrate de:\n1. El video esté configurado como "Cualquiera con el enlace puede ver"\n2. Copiar el enlace completo del archivo\n\nEjemplo: https://drive.google.com/file/d/ABC123/view')
      return ''
    }
    
    return trimmedUrl
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 4MB para videos debido a limitaciones de Vercel)
      const maxSize = 4 * 1024 * 1024
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        alert(`El video es demasiado grande (${sizeMB}MB). Máximo 4MB debido a limitaciones de Vercel.\n\n⚠️ Para videos más grandes:\n1. Sube el video a YouTube o Vimeo\n2. Copia el enlace de embed\n3. Pégalo en el campo "URL Externa" abajo`)
        return
      }

      setVideoFile(file)
      
      // Convertir video a Base64 para persistencia
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const videoBase64 = e.target?.result as string
          if (editingVideo) {
            setEditingVideo({ ...editingVideo, videoUrl: videoBase64 })
          }
        }
        reader.onerror = () => {
          alert('Error al cargar el video. Intenta con otro archivo.')
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error procesando video:', error)
        alert('Error al procesar el video. Intenta con otro archivo.')
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
              {/* Warning for invalid video URLs */}
              {video.videoUrl && video.videoUrl.startsWith('blob:') && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-red-700 font-medium">Video no disponible. Vuelve a subirlo.</p>
                  </div>
                </div>
              )}
              
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
              {/* URL Externa (YouTube/Vimeo/Google Drive) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">URL Externa (YouTube/Vimeo/Google Drive)</label>
                <input
                  type="text"
                  value={editingVideo.videoUrl?.startsWith('http') ? editingVideo.videoUrl : ''}
                  onChange={(e) => {
                    const convertedUrl = convertToEmbedUrl(e.target.value)
                    console.log('URL Original:', e.target.value)
                    console.log('URL Convertida:', convertedUrl)
                    setEditingVideo({ ...editingVideo, videoUrl: convertedUrl })
                  }}
                  onBlur={(e) => {
                    const convertedUrl = convertToEmbedUrl(e.target.value)
                    if (convertedUrl) {
                      console.log('URL Final guardada:', convertedUrl)
                    }
                    setEditingVideo({ ...editingVideo, videoUrl: convertedUrl })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="Pega cualquier URL de YouTube, Vimeo o Google Drive"
                />
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 font-semibold mb-2">✅ Ejemplos de URLs válidas:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-blue-900 font-medium">YouTube:</p>
                      <ul className="text-xs text-blue-700 ml-4">
                        <li>• https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                        <li>• https://youtu.be/dQw4w9WgXcQ</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-blue-900 font-medium">Vimeo (debe ser público):</p>
                      <ul className="text-xs text-blue-700 ml-4">
                        <li>• https://vimeo.com/123456789</li>
                        <li>• https://player.vimeo.com/video/123456789</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-blue-900 font-medium">Google Drive:</p>
                      <ul className="text-xs text-blue-700 ml-4">
                        <li>• https://drive.google.com/file/d/ABC123/view</li>
                        <li>• https://drive.google.com/open?id=ABC123</li>
                      </ul>
                      <p className="text-xs text-orange-700 mt-1 ml-4">⚠️ Configura como "Cualquiera con el enlace"</p>
                    </div>
                  </div>
                  {editingVideo.videoUrl && editingVideo.videoUrl.startsWith('http') && (
                    <div className="mt-2 pt-2 border-t border-blue-300">
                      <p className="text-xs text-green-700 font-semibold">✓ URL actual:</p>
                      <p className="text-xs text-green-600 break-all">{editingVideo.videoUrl}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O sube un archivo pequeño</span>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Archivo de Video (Máx 4MB)</label>
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
                    <p className="text-xs text-gray-500">MP4, WEBM, MOV hasta 4MB (limitación de Vercel)</p>
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
