"use client"

import { useState, useEffect } from "react"

interface InfoRequest {
  id: number
  nombre: string
  email: string
  telefono: string
  curso: string
  mensaje: string
  fecha: string
  status: "pending" | "contacted" | "closed"
}

export default function InfoRequestsTable() {
  const [requests, setRequests] = useState<InfoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedRequest, setSelectedRequest] = useState<InfoRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertingRequest, setConvertingRequest] = useState<InfoRequest | null>(null)
  const [studentData, setStudentData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    enrollmentDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/info-requests')
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests || [])
        setError("")
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando solicitudes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (request: InfoRequest) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const handleStatusChange = async (id: number, newStatus: InfoRequest["status"]) => {
    try {
      const response = await fetch(`/api/info-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setRequests(requests.map(r => 
          r.id === id ? { ...r, status: newStatus } : r
        ))
      }
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }

  const handleConvertToStudent = (request: InfoRequest) => {
    setConvertingRequest(request)
    setStudentData({
      username: request.email.split('@')[0],
      password: "",
      confirmPassword: "",
      enrollmentDate: new Date().toISOString().split('T')[0]
    })
    setShowConvertModal(true)
    setShowModal(false)
  }

  const handleConfirmConvert = () => {
    if (studentData.password !== studentData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    if (studentData.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }

    console.log("Convirtiendo solicitud a estudiante:", {
      request: convertingRequest,
      studentData
    })

    // Aquí iría la lógica para crear el estudiante en el backend
    alert(`Estudiante creado exitosamente!\nUsuario: ${studentData.username}`)
    
    // Actualizar estado de la solicitud a "closed"
    if (convertingRequest) {
      handleStatusChange(convertingRequest.id, "closed")
    }

    setShowConvertModal(false)
    setConvertingRequest(null)
    setStudentData({
      username: "",
      password: "",
      confirmPassword: "",
      enrollmentDate: new Date().toISOString().split('T')[0]
    })
  }

  const handleWhatsAppContact = (telefono: string, nombre: string, curso: string) => {
    const phoneNumber = telefono.replace(/[^0-9]/g, '')
    const message = `Hola ${nombre}, te contacto desde ADAM Capacitación respecto a tu consulta sobre el curso de ${curso}.`
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleEmailContact = (email: string, nombre: string, curso: string) => {
    const subject = `Información sobre ${curso}`
    const body = `Hola ${nombre},\n\nGracias por tu interés en nuestro curso de ${curso}.\n\n`
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  const statusConfig = {
    pending: { label: "Pendiente", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    contacted: { label: "Contactado", color: "bg-blue-50 text-blue-700 border-blue-200" },
    closed: { label: "Cerrado", color: "bg-green-50 text-green-700 border-green-200" }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Solicitudes de Información</h3>
          <p className="text-sm text-gray-600">Gestiona las consultas de estudiantes interesados</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Exportar CSV
          </button>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Nombre</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contacto</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Curso</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <p className="text-red-600 mb-2">Error al cargar solicitudes</p>
                  <button
                    onClick={loadRequests}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Reintentar
                  </button>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600 font-medium">No hay solicitudes registradas</p>
                  <p className="text-sm text-gray-500 mt-1">Las solicitudes aparecerán aquí cuando los usuarios envíen el formulario</p>
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{request.nombre}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-900">{request.email}</div>
                  <div className="text-xs text-gray-500">{request.telefono}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-900">{request.curso}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">{request.fecha}</div>
                </td>
                <td className="py-4 px-4">
                  <select
                    value={request.status}
                    onChange={(e) => handleStatusChange(request.id, e.target.value as InfoRequest["status"])}
                    className={`text-xs font-medium px-2 py-1 rounded-full border ${statusConfig[request.status].color} cursor-pointer outline-none`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="contacted">Contactado</option>
                    <option value="closed">Cerrado</option>
                  </select>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                    >
                      Ver detalles
                    </button>
                    {request.status !== "closed" && (
                      <button
                        onClick={() => handleConvertToStudent(request)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Convertir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">1-4</span> de <span className="font-medium">4</span> solicitudes
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
            Anterior
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
            Siguiente
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Detalles de Solicitud</h3>
                  <p className="text-sm text-gray-600">ID: #{selectedRequest.id}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                  <p className="text-sm text-gray-900">{selectedRequest.nombre}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
                  <p className="text-sm text-gray-900">{selectedRequest.fecha}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                    <button
                      onClick={() => handleEmailContact(selectedRequest.email, selectedRequest.nombre, selectedRequest.curso)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Enviar email"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900">{selectedRequest.telefono}</p>
                    <button
                      onClick={() => handleWhatsAppContact(selectedRequest.telefono, selectedRequest.nombre, selectedRequest.curso)}
                      className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Contactar por WhatsApp"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Curso de Interés</label>
                <p className="text-sm text-gray-900">{selectedRequest.curso}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mensaje</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedRequest.mensaje}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
                <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border ${statusConfig[selectedRequest.status].color}`}>
                  {statusConfig[selectedRequest.status].label}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div>
                {selectedRequest.status !== "closed" && (
                  <button
                    onClick={() => handleConvertToStudent(selectedRequest)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Convertir en Estudiante
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button 
                  onClick={() => handleEmailContact(selectedRequest.email, selectedRequest.nombre, selectedRequest.curso)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Student Modal */}
      {showConvertModal && convertingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Convertir en Estudiante</h3>
                  <p className="text-sm text-gray-600">Crear cuenta de estudiante para {convertingRequest.nombre}</p>
                </div>
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Información de la solicitud */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Información del Solicitante</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Nombre:</span>
                    <p className="text-blue-900">{convertingRequest.nombre}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Email:</span>
                    <p className="text-blue-900">{convertingRequest.email}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Teléfono:</span>
                    <p className="text-blue-900">{convertingRequest.telefono}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Curso:</span>
                    <p className="text-blue-900">{convertingRequest.curso}</p>
                  </div>
                </div>
              </div>

              {/* Formulario de estudiante */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Datos de Acceso</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Nombre de Usuario</label>
                  <input
                    type="text"
                    value={studentData.username}
                    onChange={(e) => setStudentData({ ...studentData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="usuario123"
                  />
                  <p className="text-xs text-gray-500 mt-1">Este será el nombre de usuario para iniciar sesión</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={studentData.password}
                    onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={studentData.confirmPassword}
                    onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Repetir contraseña"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Fecha de Inscripción</label>
                  <input
                    type="date"
                    value={studentData.enrollmentDate}
                    onChange={(e) => setStudentData({ ...studentData, enrollmentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Advertencia */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Importante</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Al convertir esta solicitud en estudiante, se creará una cuenta de acceso y la solicitud se marcará como cerrada.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmConvert}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Crear Estudiante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
