"use client"

import { useState, useEffect } from "react"

interface Banner {
  id: number
  title: string
  subtitle: string
  description: string
  gradient: string
  icon: string
  active: boolean
  image?: string
  useImage: boolean
  displayOrder?: number
  cloudinaryPublicId?: string
}

interface CompanyLogo {
  id: number
  name: string
  logo: string
  active: boolean
  displayOrder?: number
  cloudinaryPublicId?: string
}

export default function BannersManager() {
  const [activeTab, setActiveTab] = useState<"banners" | "companies">("banners")
  const [banners, setBanners] = useState<Banner[]>([])
  const [companyLogos, setCompanyLogos] = useState<CompanyLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [editingCompany, setEditingCompany] = useState<CompanyLogo | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    loadBanners()
    loadCompanyLogos()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/banners')
      const data = await response.json()

      if (response.ok) {
        setBanners(data.banners || [])
        setError("")
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando banners:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCompanyLogos = async () => {
    try {
      const response = await fetch('/api/company-logos')
      const data = await response.json()

      if (response.ok) {
        setCompanyLogos(data.logos || [])
      }
    } catch (err: any) {
      console.error('Error cargando logos:', err)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setImagePreview(banner.image || null)
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
          
          // Detectar si es PNG para preservar transparencia
          const isPNG = file.type === 'image/png'
          
          if (!isPNG) {
            // Para JPEG, usar fondo blanco en lugar de negro
            ctx!.fillStyle = '#FFFFFF'
            ctx!.fillRect(0, 0, width, height)
          }
          
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Usar PNG para preservar transparencia, JPEG para otros
          const compressedDataUrl = isPNG 
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editingBanner) {
      // Validar tamaño de archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. Por favor, selecciona una imagen menor a 10MB.')
        return
      }

      try {
        // Comprimir imagen localmente primero
        const compressedImage = await compressImage(file)
        setImagePreview(compressedImage)

        // Subir a Cloudinary
        const response = await fetch('/api/upload-cloudinary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: compressedImage,
            folder: 'banners'
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // Usar URL de Cloudinary
          setEditingBanner({ 
            ...editingBanner, 
            image: data.url,
            cloudinaryPublicId: data.publicId,
            useImage: true 
          })
          alert('✅ Imagen subida exitosamente a Cloudinary')
        } else {
          throw new Error(data.error || 'Error al subir imagen')
        }
      } catch (error) {
        console.error('Error subiendo imagen:', error)
        alert('Error al subir la imagen. Intenta con otra imagen.')
      }
    }
  }

  const handleRemoveImage = () => {
    if (editingBanner) {
      setImagePreview(null)
      setEditingBanner({ ...editingBanner, image: undefined, useImage: false })
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      const banner = banners.find(b => b.id === id)
      if (!banner) return

      const response = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...banner,
          active: !banner.active
        })
      })

      if (response.ok) {
        await loadBanners()
      }
    } catch (err: any) {
      alert('Error al cambiar estado del banner')
      console.error('Error:', err)
    }
  }

  const handleSave = async () => {
    if (!editingBanner) return

    if (!editingBanner.title || !editingBanner.subtitle || !editingBanner.description) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      const isNew = editingBanner.id === 0

      const response = await fetch(
        isNew ? '/api/banners' : `/api/banners/${editingBanner.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingBanner.title,
            subtitle: editingBanner.subtitle,
            description: editingBanner.description,
            gradient: editingBanner.gradient,
            icon: editingBanner.icon,
            image: editingBanner.image,
            useImage: editingBanner.useImage,
            active: editingBanner.active,
            displayOrder: editingBanner.displayOrder || 0
          })
        }
      )

      // Verificar si la respuesta es JSON válida
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Respuesta no-JSON del servidor:', text)
        throw new Error('El servidor devolvió una respuesta inválida. La imagen podría ser demasiado grande o hay un error en el servidor.')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar banner')
      }

      await loadBanners()
      setShowModal(false)
      setEditingBanner(null)
      setImagePreview(null)
    } catch (err: any) {
      alert(err.message)
      console.error('Error guardando banner:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBanner = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadBanners()
      }
    } catch (err: any) {
      alert('Error al eliminar banner')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewBanner = () => {
    setEditingBanner({
      id: 0,
      title: "",
      subtitle: "",
      description: "",
      gradient: "from-blue-600 via-purple-600 to-pink-600",
      icon: "graduation",
      active: true,
      useImage: false
    })
    setImagePreview(null)
    setShowModal(true)
  }

  const handleEditCompany = (company: CompanyLogo) => {
    setEditingCompany(company)
    setLogoPreview(company.logo || null)
    setShowCompanyModal(true)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editingCompany) {
      // Validar tamaño de archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert('El logo es demasiado grande. Por favor, selecciona una imagen menor a 10MB.')
        return
      }

      try {
        // Comprimir imagen localmente primero
        const compressedImage = await compressImage(file)
        setLogoPreview(compressedImage)

        // Subir a Cloudinary
        const response = await fetch('/api/upload-cloudinary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: compressedImage,
            folder: 'logos'
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // Usar URL de Cloudinary
          setEditingCompany({ 
            ...editingCompany, 
            logo: data.url,
            cloudinaryPublicId: data.publicId
          })
          alert('✅ Logo subido exitosamente a Cloudinary')
        } else {
          throw new Error(data.error || 'Error al subir logo')
        }
      } catch (error) {
        console.error('Error subiendo logo:', error)
        alert('Error al subir el logo. Intenta con otra imagen.')
      }
    }
  }

  const handleRemoveLogo = () => {
    if (editingCompany) {
      setLogoPreview(null)
      setEditingCompany({ ...editingCompany, logo: "" })
    }
  }

  const handleToggleCompanyActive = async (id: number) => {
    try {
      const logo = companyLogos.find(c => c.id === id)
      if (!logo) return

      const response = await fetch(`/api/company-logos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...logo,
          active: !logo.active
        })
      })

      if (response.ok) {
        await loadCompanyLogos()
      }
    } catch (err: any) {
      alert('Error al cambiar estado del logo')
      console.error('Error:', err)
    }
  }

  const handleSaveCompany = async () => {
    if (!editingCompany) return

    if (!editingCompany.name || !editingCompany.logo) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      const isNew = editingCompany.id === 0

      const response = await fetch(
        isNew ? '/api/company-logos' : `/api/company-logos/${editingCompany.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingCompany.name,
            logo: editingCompany.logo,
            active: editingCompany.active,
            displayOrder: editingCompany.displayOrder || 0
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar logo')
      }

      await loadCompanyLogos()
      setShowCompanyModal(false)
      setEditingCompany(null)
      setLogoPreview(null)
    } catch (err: any) {
      alert(err.message)
      console.error('Error guardando logo:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCompany = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este logo?")) return

    try {
      setLoading(true)
      const response = await fetch(`/api/company-logos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadCompanyLogos()
      }
    } catch (err: any) {
      alert('Error al eliminar logo')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewCompany = () => {
    setEditingCompany({
      id: 0,
      name: "",
      logo: "",
      active: true
    })
    setLogoPreview(null)
    setShowCompanyModal(true)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Gestión de Banners y Logos</h3>
          <p className="text-sm text-gray-600">Administra los banners y logos de empresas de la portada</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("banners")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "banners"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Banners Principales
          </button>
          <button
            onClick={() => setActiveTab("companies")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "companies"
                ? "border-black text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Logos de Empresas
          </button>
        </nav>
      </div>

      {/* Banners Section */}
      {activeTab === "banners" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Gestiona los banners del carrusel principal</p>
            <button 
              onClick={handleNewBanner}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Banner
            </button>
          </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className={`w-32 h-20 rounded-lg flex-shrink-0 relative overflow-hidden ${
                banner.useImage && banner.image ? 'bg-gray-100' : `bg-gradient-to-br ${banner.gradient}`
              }`}>
                {banner.useImage && banner.image ? (
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                      Preview
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{banner.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{banner.subtitle}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{banner.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      banner.active 
                        ? "bg-green-50 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {banner.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(banner.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      banner.active
                        ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        : "text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {banner.active ? "Desactivar" : "Activar"}
                  </button>
                  <button 
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}

      {/* Companies Section */}
      {activeTab === "companies" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Gestiona los logos de empresas que confían en nosotros</p>
            <button 
              onClick={handleNewCompany}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Logo
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyLogos.map((company) => (
              <div
                key={company.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {/* Logo Preview */}
                <div className="w-full h-40 bg-white rounded-lg flex items-center justify-center mb-4 border-2 border-gray-200 p-4">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">Sin logo</p>
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-1">{company.name}</h4>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    company.active 
                      ? "bg-green-50 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {company.active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditCompany(company)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleCompanyActive(company.id)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      company.active
                        ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        : "text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {company.active ? "Desactivar" : "Activar"}
                  </button>
                  <button 
                    onClick={() => handleDeleteCompany(company.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showModal && editingBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingBanner.id === 0 ? 'Nuevo Banner' : 'Editar Banner'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Título</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Subtítulo</label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Descripción</label>
                <textarea
                  value={editingBanner.description}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Image Upload Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-900">Fondo del Banner</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, useImage: false })}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        !editingBanner.useImage
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Gradiente
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, useImage: true })}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        editingBanner.useImage
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Imagen
                    </button>
                  </div>
                </div>

                {editingBanner.useImage ? (
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-1 text-sm text-gray-600 font-medium">
                          <span className="text-black">Haz clic para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Gradiente</label>
                    <select
                      value={editingBanner.gradient}
                      onChange={(e) => setEditingBanner({ ...editingBanner, gradient: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    >
                      <option value="from-blue-600 via-purple-600 to-pink-600">Azul - Púrpura - Rosa</option>
                      <option value="from-emerald-500 via-teal-500 to-cyan-600">Verde - Teal - Cyan</option>
                      <option value="from-orange-500 via-red-500 to-pink-600">Naranja - Rojo - Rosa</option>
                      <option value="from-violet-600 via-purple-600 to-indigo-600">Violeta - Púrpura - Índigo</option>
                      <option value="from-pink-500 via-rose-500 to-red-500">Rosa - Rose - Rojo</option>
                    </select>
                    {/* Gradient Preview */}
                    <div className={`mt-3 w-full h-24 rounded-lg bg-gradient-to-br ${editingBanner.gradient}`}></div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingBanner(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Logo Modal */}
      {showCompanyModal && editingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCompany.id === 0 ? "Nuevo Logo de Empresa" : "Editar Logo de Empresa"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Nombre de la Empresa *</label>
                <input
                  type="text"
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="Ej: Constructora ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Logo de la Empresa *</label>
                <p className="text-xs text-gray-500 mb-3">Sube un logo en formato PNG con fondo transparente para mejor visualización</p>
                
                {/* Logo Preview */}
                {logoPreview && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200 bg-white mb-3 flex items-center justify-center p-4">
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-gray-600 font-medium">
                      <span className="text-black">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG hasta 2MB (recomendado PNG transparente)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCompanyModal(false)
                  setEditingCompany(null)
                  setLogoPreview(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCompany}
                disabled={!editingCompany.name || !editingCompany.logo}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingCompany.id === 0 ? "Crear Logo" : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
