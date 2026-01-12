"use client"

import { useState, useEffect } from "react"

interface Course {
  id: number
  name: string
  description: string
  duration: string
  level: "Principiante" | "Intermedio" | "Avanzado"
  price: number
  image: string | null
  video: string | null
  category: string
  featured: boolean
  active: boolean
}

export default function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoError, setVideoError] = useState<string>("")
  const [formData, setFormData] = useState<Partial<Course>>({
    name: "",
    description: "",
    duration: "",
    level: "Principiante",
    price: 0,
    category: "",
    featured: false,
    active: true
  })

  // Estados para gestión de estudiantes
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Estados para gestión de evaluaciones
  const [showEvaluationsModal, setShowEvaluationsModal] = useState(false)
  const [selectedCourseForEvaluations, setSelectedCourseForEvaluations] = useState<Course | null>(null)
  const [availableEvaluations, setAvailableEvaluations] = useState<any[]>([])
  const [assignedEvaluations, setAssignedEvaluations] = useState<any[]>([])
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)

  // Estados para gestión de materiales
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'pdf',
    content: ''
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  // Cargar cursos al montar el componente
  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar cursos')
      }

      setCourses(data.courses)
    } catch (err: any) {
      setError(err.message || 'Error al cargar cursos')
      console.error('Error cargando cursos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course)
      setFormData(course)
      setImagePreview(course.image)
    } else {
      setEditingCourse(null)
      setFormData({
        name: "",
        description: "",
        duration: "",
        level: "Principiante",
        price: 0,
        category: "",
        featured: false,
        active: true
      })
      setImagePreview(null)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCourse(null)
    setImagePreview(null)
    setVideoPreview(null)
    setVideoFile(null)
    setVideoError("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData({ ...formData, image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      setVideoError('Por favor selecciona un archivo de video válido')
      return
    }

    // Validar tamaño (máximo 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      setVideoError('El video es demasiado grande. Máximo 50MB')
      return
    }

    // Crear elemento de video para validar duración
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = video.duration

      // Validar duración (20-60 segundos)
      if (duration < 20) {
        setVideoError('El video debe durar al menos 20 segundos')
        setVideoFile(null)
        setVideoPreview(null)
        return
      }

      if (duration > 60) {
        setVideoError('El video no puede durar más de 60 segundos (1 minuto)')
        setVideoFile(null)
        setVideoPreview(null)
        return
      }

      // Video válido
      setVideoError('')
      setVideoFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setVideoPreview(result)
        setFormData({ ...formData, video: result })
      }
      reader.readAsDataURL(file)
    }

    video.onerror = () => {
      setVideoError('Error al cargar el video. Intenta con otro archivo')
      setVideoFile(null)
      setVideoPreview(null)
    }

    video.src = URL.createObjectURL(file)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.duration || !formData.category) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    try {
      setLoading(true)
      
      if (editingCourse) {
        // Actualizar curso existente
        const response = await fetch(`/api/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al actualizar curso')
        }

        // Actualizar en la lista local
        setCourses(courses.map(c => c.id === editingCourse.id ? data.course : c))
      } else {
        // Crear nuevo curso
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al crear curso')
        }

        // Agregar a la lista local
        setCourses([data.course, ...courses])
      }

      handleCloseModal()
    } catch (err: any) {
      alert(err.message || 'Error al guardar curso')
      console.error('Error guardando curso:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este curso?")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar curso')
      }

      // Eliminar de la lista local
      setCourses(courses.filter(c => c.id !== id))
    } catch (err: any) {
      alert(err.message || 'Error al eliminar curso')
      console.error('Error eliminando curso:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`/api/courses/${id}/toggle-active`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar estado')
      }

      // Actualizar en la lista local
      setCourses(courses.map(c => c.id === id ? { ...c, active: data.active } : c))
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado del curso')
      console.error('Error cambiando estado:', err)
    }
  }

  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await fetch(`/api/courses/${id}/toggle-featured`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar estado destacado')
      }

      // Actualizar en la lista local
      setCourses(courses.map(c => c.id === id ? { ...c, featured: data.featured } : c))
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado destacado del curso')
      console.error('Error cambiando estado destacado:', err)
    }
  }

  // Funciones para gestión de estudiantes
  const handleOpenStudentsModal = async (course: Course) => {
    setSelectedCourseForStudents(course)
    setShowStudentsModal(true)
    await loadStudentsData(course.id)
  }

  const loadStudentsData = async (courseId: number) => {
    try {
      setLoadingStudents(true)

      // Cargar estudiantes matriculados
      const enrolledResponse = await fetch(`/api/courses/${courseId}/students`)
      
      if (!enrolledResponse.ok) {
        console.error('Error en API students:', enrolledResponse.status, enrolledResponse.statusText)
        const text = await enrolledResponse.text()
        console.error('Respuesta:', text)
        throw new Error(`Error al cargar estudiantes matriculados: ${enrolledResponse.status}`)
      }
      
      const enrolledData = await enrolledResponse.json()
      setEnrolledStudents(enrolledData.students || [])

      // Cargar todos los estudiantes disponibles
      const usersResponse = await fetch('/api/users?role=estudiante')
      
      if (!usersResponse.ok) {
        console.error('Error en API users:', usersResponse.status, usersResponse.statusText)
        // Si no existe el endpoint de users, usar array vacío
        setAvailableStudents([])
        return
      }
      
      const usersData = await usersResponse.json()
      
      // Filtrar estudiantes que no están matriculados
      const enrolledIds = enrolledData.students?.map((s: any) => s.studentId) || []
      const available = usersData.users?.filter((u: any) => !enrolledIds.includes(u.id)) || []
      setAvailableStudents(available)

    } catch (err: any) {
      console.error('Error cargando estudiantes:', err)
      alert(`Error al cargar estudiantes: ${err.message}`)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleAssignStudents = async (studentIds: number[]) => {
    if (!selectedCourseForStudents) return

    try {
      setLoadingStudents(true)
      const response = await fetch(`/api/courses/${selectedCourseForStudents.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al asignar estudiantes')
      }

      alert(`✅ Estudiantes asignados:\n${data.results.success.length} exitosos\n${data.results.alreadyEnrolled.length} ya matriculados\n${data.results.errors.length} errores`)
      
      // Recargar datos
      await loadStudentsData(selectedCourseForStudents.id)

    } catch (err: any) {
      alert(err.message || 'Error al asignar estudiantes')
      console.error('Error asignando estudiantes:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleUnassignStudent = async (studentId: number) => {
    if (!selectedCourseForStudents) return
    if (!confirm('¿Estás seguro de desasignar este estudiante del curso?')) return

    try {
      setLoadingStudents(true)
      const response = await fetch(`/api/courses/${selectedCourseForStudents.id}/students/${studentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al desasignar estudiante')
      }

      alert('✅ Estudiante desasignado exitosamente')
      
      // Recargar datos
      await loadStudentsData(selectedCourseForStudents.id)

    } catch (err: any) {
      alert(err.message || 'Error al desasignar estudiante')
      console.error('Error desasignando estudiante:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Funciones para gestión de evaluaciones
  const handleOpenEvaluationsModal = async (course: Course) => {
    setSelectedCourseForEvaluations(course)
    setShowEvaluationsModal(true)
    await loadEvaluationsData(course.id)
  }

  const loadEvaluationsData = async (courseId: number) => {
    try {
      setLoadingEvaluations(true)

      // Cargar evaluaciones asignadas
      const assignedResponse = await fetch(`/api/courses/${courseId}/evaluations`)
      const assignedData = await assignedResponse.json()
      
      if (assignedResponse.ok) {
        setAssignedEvaluations(assignedData.evaluations || [])
      }

      // Cargar todas las evaluaciones disponibles
      const allResponse = await fetch('/api/evaluations?active=true')
      const allData = await allResponse.json()
      
      if (allResponse.ok) {
        // Filtrar evaluaciones que no están asignadas
        const assignedIds = assignedData.evaluations?.map((e: any) => e.evaluationId) || []
        const available = allData.evaluations?.filter((e: any) => !assignedIds.includes(e.id)) || []
        setAvailableEvaluations(available)
      }

    } catch (err: any) {
      console.error('Error cargando evaluaciones:', err)
      alert('Error al cargar evaluaciones')
    } finally {
      setLoadingEvaluations(false)
    }
  }

  const handleAssignEvaluations = async (evaluationIds: number[]) => {
    if (!selectedCourseForEvaluations) return

    try {
      setLoadingEvaluations(true)
      const response = await fetch(`/api/courses/${selectedCourseForEvaluations.id}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationIds, required: true })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al asignar evaluaciones')
      }

      alert(`✅ Evaluaciones asignadas:\n${data.results.success.length} exitosas\n${data.results.alreadyAssigned.length} ya asignadas\n${data.results.errors.length} errores`)
      
      // Recargar datos
      await loadEvaluationsData(selectedCourseForEvaluations.id)

    } catch (err: any) {
      alert(err.message || 'Error al asignar evaluaciones')
      console.error('Error asignando evaluaciones:', err)
    } finally {
      setLoadingEvaluations(false)
    }
  }

  const handleUnassignEvaluation = async (evaluationId: number) => {
    if (!selectedCourseForEvaluations) return
    if (!confirm('¿Estás seguro de desasignar esta evaluación del curso?')) return

    try {
      setLoadingEvaluations(true)
      const response = await fetch(`/api/courses/${selectedCourseForEvaluations.id}/evaluations/${evaluationId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al desasignar evaluación')
      }

      alert('✅ Evaluación desasignada exitosamente')
      
      // Recargar datos
      await loadEvaluationsData(selectedCourseForEvaluations.id)

    } catch (err: any) {
      alert(err.message || 'Error al desasignar evaluación')
      console.error('Error desasignando evaluación:', err)
    } finally {
      setLoadingEvaluations(false)
    }
  }

  // Funciones para gestión de materiales
  const handleOpenMaterialsModal = async (course: Course) => {
    setSelectedCourseForMaterials(course)
    setShowMaterialsModal(true)
    await loadMaterialsData(course.id)
  }

  const loadMaterialsData = async (courseId: number) => {
    try {
      setLoadingMaterials(true)
      const response = await fetch(`/api/courses/${courseId}/materials`)
      const data = await response.json()
      
      if (response.ok) {
        setMaterials(data.materials || [])
      }
    } catch (err: any) {
      console.error('Error cargando materiales:', err)
      alert('Error al cargar materiales')
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF válido')
      return
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB')
      return
    }

    setPdfFile(file)
  }

  const handleAddMaterial = async () => {
    if (!selectedCourseForMaterials) return
    
    if (!newMaterial.title) {
      alert('Por favor completa el título')
      return
    }

    // Validar según el tipo
    if (newMaterial.type === 'pdf' && !pdfFile) {
      alert('Por favor selecciona un archivo PDF')
      return
    }

    if (newMaterial.type === 'youtube' && !newMaterial.content) {
      alert('Por favor ingresa la URL de YouTube')
      return
    }

    try {
      setLoadingMaterials(true)
      setUploadingPdf(true)

      let contentToSave = newMaterial.content

      // Si es PDF, convertir a base64
      if (newMaterial.type === 'pdf' && pdfFile) {
        const reader = new FileReader()
        contentToSave = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(pdfFile)
        })
      }

      const response = await fetch(`/api/courses/${selectedCourseForMaterials.id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMaterial,
          content: contentToSave
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al agregar material')
      }

      alert('✅ Material agregado exitosamente')
      
      // Limpiar formulario
      setNewMaterial({
        title: '',
        description: '',
        type: 'pdf',
        content: ''
      })
      setPdfFile(null)
      setShowAddMaterialForm(false)
      
      // Recargar datos
      await loadMaterialsData(selectedCourseForMaterials.id)

    } catch (err: any) {
      alert(err.message || 'Error al agregar material')
      console.error('Error agregando material:', err)
    } finally {
      setLoadingMaterials(false)
      setUploadingPdf(false)
    }
  }

  const handleDeleteMaterial = async (materialId: number) => {
    if (!selectedCourseForMaterials) return
    if (!confirm('¿Estás seguro de eliminar este material?')) return

    try {
      setLoadingMaterials(true)
      const response = await fetch(`/api/courses/${selectedCourseForMaterials.id}/materials/${materialId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar material')
      }

      alert('✅ Material eliminado exitosamente')
      
      // Recargar datos
      await loadMaterialsData(selectedCourseForMaterials.id)

    } catch (err: any) {
      alert(err.message || 'Error al eliminar material')
      console.error('Error eliminando material:', err)
    } finally {
      setLoadingMaterials(false)
    }
  }

  const levelColors = {
    "Principiante": "bg-green-50 text-green-700 border-green-200",
    "Intermedio": "bg-blue-50 text-blue-700 border-blue-200",
    "Avanzado": "bg-purple-50 text-purple-700 border-purple-200"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Gestión de Cursos</h3>
            <p className="text-sm text-gray-600">Administra los cursos disponibles en la plataforma</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && courses.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-600">Cargando cursos...</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay cursos disponibles</h3>
          <p className="text-sm text-gray-600 mb-4">Comienza creando tu primer curso</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Primer Curso
          </button>
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Course Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
              {course.image ? (
                <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {course.featured && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                    ⭐ Destacado
                  </span>
                )}
                {!course.active && (
                  <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                    Inactivo
                  </span>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-900 flex-1">{course.name}</h4>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${levelColors[course.level]}`}>
                  {course.level}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                  {course.category}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  {course.duration}
                </span>
              </div>

              {/* Botones de Gestión */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    ${course.price.toLocaleString('es-CL')}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFeatured(course.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        course.featured
                          ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Destacar curso"
                    >
                      <svg className="w-4 h-4" fill={course.featured ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleActive(course.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        course.active
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                      title={course.active ? "Desactivar" : "Activar"}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={course.active ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenModal(course)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Botones de Gestión de Estudiantes, Evaluaciones y Materiales */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleOpenStudentsModal(course)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Estudiantes
                  </button>
                  <button
                    onClick={() => handleOpenEvaluationsModal(course)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Evaluaciones
                  </button>
                  <button
                    onClick={() => handleOpenMaterialsModal(course)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Materiales
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {editingCourse ? "Editar Curso" : "Nuevo Curso"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {editingCourse ? "Modifica la información del curso" : "Completa los datos del nuevo curso"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Imagen del Curso</label>
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setImagePreview(null)
                        setFormData({ ...formData, image: null })
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">Subir imagen del curso</p>
                    <p className="text-xs text-gray-500">PNG, JPG (recomendado 800x450px)</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Video del Curso (Opcional)
                  <span className="text-xs text-gray-500 ml-2">Duración: 20-60 segundos | Máx: 50MB</span>
                </label>
                {videoPreview ? (
                  <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-200">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full h-64 object-cover bg-black"
                    />
                    <button
                      onClick={() => {
                        setVideoPreview(null)
                        setVideoFile(null)
                        setFormData({ ...formData, video: null })
                        setVideoError("")
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">Subir video del curso</p>
                    <p className="text-xs text-gray-500">MP4, MOV, AVI (20-60 segundos)</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoUpload}
                    />
                  </label>
                )}
                {videoError && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {videoError}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Nombre del Curso *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Ej: Desarrollo Web Full Stack"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Descripción *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    placeholder="Describe el curso y lo que aprenderán los estudiantes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Categoría *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Ej: Programación, Diseño, Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Duración *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Ej: 6 meses, 40 horas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Nivel</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as Course["level"] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Precio (CLP)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="299990"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-900">Curso Destacado</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-900">Curso Activo</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                {editingCourse ? "Guardar Cambios" : "Crear Curso"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Estudiantes */}
      {showStudentsModal && selectedCourseForStudents && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Gestionar Estudiantes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Curso: {selectedCourseForStudents.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-600">Cargando estudiantes...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Estudiantes Matriculados */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Estudiantes Matriculados ({enrolledStudents.length})
                    </h4>
                    {enrolledStudents.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">No hay estudiantes matriculados en este curso</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {enrolledStudents.map((student: any) => (
                          <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.email}</p>
                              <p className="text-xs text-gray-500">Matriculado: {new Date(student.enrolledAt).toLocaleDateString('es-CL')}</p>
                            </div>
                            <button
                              onClick={() => handleUnassignStudent(student.studentId)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              Desasignar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Estudiantes Disponibles */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Estudiantes Disponibles ({availableStudents.length})
                    </h4>
                    {availableStudents.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Todos los estudiantes están matriculados</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableStudents.map((student: any) => (
                          <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.email}</p>
                            </div>
                            <button
                              onClick={() => handleAssignStudents([student.id])}
                              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                            >
                              Asignar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Evaluaciones */}
      {showEvaluationsModal && selectedCourseForEvaluations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Gestionar Evaluaciones
                  </h3>
                  <p className="text-sm text-gray-600">
                    Curso: {selectedCourseForEvaluations.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowEvaluationsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {loadingEvaluations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-600">Cargando evaluaciones...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Evaluaciones Asignadas */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Evaluaciones Asignadas ({assignedEvaluations.length})
                    </h4>
                    {assignedEvaluations.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">No hay evaluaciones asignadas a este curso</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {assignedEvaluations.map((evaluation: any) => (
                          <div key={evaluation.evaluationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{evaluation.title}</p>
                              <p className="text-sm text-gray-600">{evaluation.description}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-gray-500">Duración: {evaluation.duration} min</span>
                                <span className="text-xs text-gray-500">Nota mínima: {evaluation.passingScore}%</span>
                                {evaluation.required && (
                                  <span className="text-xs font-medium text-red-600">Obligatoria</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnassignEvaluation(evaluation.evaluationId)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              Desasignar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Evaluaciones Disponibles */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Evaluaciones Disponibles ({availableEvaluations.length})
                    </h4>
                    {availableEvaluations.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Todas las evaluaciones están asignadas</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableEvaluations.map((evaluation: any) => (
                          <div key={evaluation.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{evaluation.title}</p>
                              <p className="text-sm text-gray-600">{evaluation.description}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-gray-500">Duración: {evaluation.duration} min</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAssignEvaluations([evaluation.id])}
                              className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                            >
                              Asignar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Materiales */}
      {showMaterialsModal && selectedCourseForMaterials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Material de Estudio
                  </h3>
                  <p className="text-sm text-gray-600">
                    Curso: {selectedCourseForMaterials.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMaterialsModal(false)
                    setShowAddMaterialForm(false)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {loadingMaterials ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-600">Cargando materiales...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Botón Agregar Material */}
                  {!showAddMaterialForm && (
                    <button
                      onClick={() => setShowAddMaterialForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border-2 border-dashed border-emerald-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar Material
                    </button>
                  )}

                  {/* Formulario Agregar Material */}
                  {showAddMaterialForm && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900">Nuevo Material</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Material</label>
                        <select
                          value={newMaterial.type}
                          onChange={(e) => {
                            setNewMaterial({ ...newMaterial, type: e.target.value, content: '' })
                            setPdfFile(null)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="pdf">PDF (desde tu equipo)</option>
                          <option value="youtube">Video de YouTube</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                        <input
                          type="text"
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          placeholder="Ej: Introducción al curso"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                        <textarea
                          value={newMaterial.description}
                          onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                          placeholder="Descripción del material"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        {newMaterial.type === 'pdf' ? (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Archivo PDF * (Máximo 10MB)
                            </label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfUpload}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                              />
                              {pdfFile && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-emerald-50 px-3 py-2 rounded-lg">
                                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">{pdfFile.name}</span>
                                  <span className="text-gray-500">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL de YouTube *
                            </label>
                            <input
                              type="url"
                              value={newMaterial.content}
                              onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAddMaterial}
                          disabled={uploadingPdf}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {uploadingPdf ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Subiendo...
                            </>
                          ) : (
                            'Guardar Material'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddMaterialForm(false)
                            setNewMaterial({ title: '', description: '', type: 'pdf', content: '' })
                            setPdfFile(null)
                          }}
                          disabled={uploadingPdf}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Materiales */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Materiales del Curso ({materials.length})
                    </h4>
                    {materials.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-sm text-gray-600">No hay materiales agregados</p>
                        <p className="text-xs text-gray-500 mt-1">Agrega PDFs o videos de YouTube para tus estudiantes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {materials.map((material: any) => (
                          <div key={material.id} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                              {material.type === 'pdf' ? (
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900">{material.title}</h5>
                              {material.description && (
                                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                  {material.type === 'pdf' ? 'PDF' : 'YouTube'}
                                </span>
                                {material.type === 'pdf' ? (
                                  <button
                                    onClick={() => {
                                      // Crear un blob del PDF y abrirlo en nueva pestaña
                                      const byteCharacters = atob(material.content.split(',')[1])
                                      const byteNumbers = new Array(byteCharacters.length)
                                      for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                                      }
                                      const byteArray = new Uint8Array(byteNumbers)
                                      const blob = new Blob([byteArray], { type: 'application/pdf' })
                                      const url = URL.createObjectURL(blob)
                                      window.open(url, '_blank')
                                    }}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                  >
                                    Ver PDF →
                                  </button>
                                ) : (
                                  <a
                                    href={material.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                  >
                                    Ver video →
                                  </a>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
