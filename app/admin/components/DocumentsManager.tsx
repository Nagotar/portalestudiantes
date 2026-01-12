"use client"

import { useState, useEffect } from "react"

interface Document {
  id: number
  title: string
  description: string
  licenseType: string
  fileData?: string
  fileName?: string
  fileSize?: number
  downloads: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export default function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar documentos')
      }

      setDocuments(data.documents || [])
      setError("")
    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando documentos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewDocument = () => {
    setEditingDocument({
      id: 0,
      title: "",
      description: "",
      licenseType: "",
      downloads: 0,
      active: true
    })
    setFilePreview(null)
    setShowModal(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo (solo PDFs)
    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF')
      return
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB')
      return
    }

    // Leer archivo como base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setFilePreview(result)
      if (editingDocument) {
        setEditingDocument({
          ...editingDocument,
          fileData: result,
          fileName: file.name,
          fileSize: file.size
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!editingDocument) return

    if (!editingDocument.title || !editingDocument.description || !editingDocument.licenseType) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    try {
      setLoading(true)

      const isEditing = editingDocument.id > 0

      const response = await fetch(
        isEditing ? `/api/documents/${editingDocument.id}` : '/api/documents',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingDocument.title,
            description: editingDocument.description,
            licenseType: editingDocument.licenseType,
            fileData: editingDocument.fileData,
            fileName: editingDocument.fileName,
            fileSize: editingDocument.fileSize,
            active: editingDocument.active
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar documento')
      }

      await loadDocuments()
      setShowModal(false)
      setEditingDocument(null)
      setFilePreview(null)
    } catch (err: any) {
      alert(err.message)
      console.error('Error guardando documento:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar documento?")) return

    try {
      setLoading(true)
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar documento')
      }

      await loadDocuments()
    } catch (err: any) {
      alert(err.message)
      console.error('Error eliminando documento:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDocument(null)
    setFilePreview(null)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Documentos de Licencias</h3>
          <p className="text-sm text-gray-600">Gestiona requisitos para obtener licencias</p>
        </div>
        <button 
          onClick={handleNewDocument}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Subir Documento
        </button>
      </div>

      {loading && documents.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button onClick={loadDocuments} className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm">Reintentar</button>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600">No hay documentos disponibles</p>
          <p className="text-sm text-gray-500 mt-2">Comienza subiendo tu primer documento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
          <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">{doc.licenseType}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📄 {doc.fileName}</span>
                  <span>📥 {doc.downloads} descargas</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {showModal && editingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Nuevo Documento</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editingDocument.title}
                onChange={(e) => setEditingDocument({ ...editingDocument, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Título"
              />
              <select
                value={editingDocument.licenseType}
                onChange={(e) => setEditingDocument({ ...editingDocument, licenseType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Seleccionar licencia</option>
                <option value="Clase A">Clase A</option>
                <option value="Clase B">Clase B</option>
                <option value="Clase D">Clase D</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="A3">A3</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
              </select>
              <textarea
                value={editingDocument.description}
                onChange={(e) => setEditingDocument({ ...editingDocument, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Descripción"
                rows={3}
              />
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Archivo PDF</label>
                {filePreview ? (
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">{editingDocument.fileName}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(editingDocument.fileSize)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFilePreview(null)
                          setEditingDocument({ ...editingDocument, fileData: undefined, fileName: undefined, fileSize: undefined })
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                    <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">Subir archivo PDF</p>
                    <p className="text-xs text-gray-500">Máximo 10MB</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
