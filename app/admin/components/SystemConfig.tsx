"use client"

import { useState, useEffect } from "react"
import { extractColorsFromImage } from "@/lib/color-extractor"
import { useConfig } from "@/contexts/ConfigContext"

interface SystemConfig {
  siteName: string
  logo: string | null
  logoLight: string | null
  favicon: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headerColor: string
  sidebarColor: string
  buttonColor: string
  linkColor: string
  whatsappNumber: string
  whatsappMessage: string
  whatsappEnabled: boolean
  companyName: string
  companyDescription: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  aboutTitle: string
  aboutDescription: string
  aboutMission: string
  aboutVision: string
  aboutHistory: string
  aboutImage1: string | null
  aboutImage2: string | null
  aboutImage3: string | null
  footerText: string
  footerShowCompanyInfo: boolean
  footerShowSocialMedia: boolean
  footerFacebookUrl: string | null
  footerInstagramUrl: string | null
  footerTwitterUrl: string | null
  footerLinkedinUrl: string | null
  footerYoutubeUrl: string | null
  footerLink1Text: string | null
  footerLink1Url: string | null
  footerLink2Text: string | null
  footerLink2Url: string | null
  footerLink3Text: string | null
  footerLink3Url: string | null
  footerLink4Text: string | null
  footerLink4Url: string | null
}

export default function SystemConfig() {
  const { reloadConfig } = useConfig()
  const [config, setConfig] = useState<SystemConfig>({
    siteName: "Portal Estudiante",
    logo: null,
    logoLight: null,
    favicon: null,
    primaryColor: "#000000",
    secondaryColor: "#6B7280",
    accentColor: "#3B82F6",
    backgroundColor: "#F9FAFB",
    textColor: "#111827",
    headerColor: "#FFFFFF",
    sidebarColor: "#1F2937",
    buttonColor: "#000000",
    linkColor: "#3B82F6",
    whatsappNumber: "+56912345678",
    whatsappMessage: "Hola, me gustaría obtener más información sobre los cursos disponibles.",
    whatsappEnabled: true,
    companyName: "Centro de Capacitación ADAM",
    companyDescription: "Formación en Maquinaria Pesada",
    companyEmail: "contacto@adam.cl",
    companyPhone: "+56 9 1234 5678",
    companyAddress: "Santiago, Chile",
    aboutTitle: "Sobre Nosotros",
    aboutDescription: "Somos líderes en formación de operadores de maquinaria pesada con más de 15 años de experiencia en el sector.",
    aboutMission: "Formar operadores altamente calificados y certificados, brindando las mejores herramientas y conocimientos para su desarrollo profesional en la industria de la construcción y minería.",
    aboutVision: "Ser el centro de capacitación líder en Chile, reconocido por la excelencia en la formación de operadores de maquinaria pesada y por contribuir al desarrollo de la industria.",
    aboutHistory: "Fundado en 2010, nuestro centro ha capacitado a más de 5,000 operadores que hoy trabajan en las principales empresas del país. Contamos con instalaciones modernas, maquinaria de última generación y un equipo de instructores certificados con amplia experiencia en el campo.",
    aboutImage1: null,
    aboutImage2: null,
    aboutImage3: null,
    footerText: "© 2024 Centro de Capacitación ADAM. Todos los derechos reservados.",
    footerShowCompanyInfo: true,
    footerShowSocialMedia: true,
    footerFacebookUrl: null,
    footerInstagramUrl: null,
    footerTwitterUrl: null,
    footerLinkedinUrl: null,
    footerYoutubeUrl: null,
    footerLink1Text: null,
    footerLink1Url: null,
    footerLink2Text: null,
    footerLink2Url: null,
    footerLink3Text: null,
    footerLink3Url: null,
    footerLink4Text: null,
    footerLink4Url: null
  })

  const [activeSection, setActiveSection] = useState<"general" | "logos" | "colors" | "about" | "footer">("general")
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoLightPreview, setLogoLightPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [aboutImage1Preview, setAboutImage1Preview] = useState<string | null>(null)
  const [aboutImage2Preview, setAboutImage2Preview] = useState<string | null>(null)
  const [aboutImage3Preview, setAboutImage3Preview] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoConfiguring, setAutoConfiguring] = useState(false)

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Agregar timestamp para evitar caché
      const timestamp = Date.now()
      const response = await fetch(`/api/config?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar configuración')
      }

      setConfig(data.config)
      
      // Establecer previews de imágenes si existen
      if (data.config.logo) setLogoPreview(data.config.logo)
      if (data.config.logoLight) setLogoLightPreview(data.config.logoLight)
      if (data.config.favicon) setFaviconPreview(data.config.favicon)
      if (data.config.aboutImage1) setAboutImage1Preview(data.config.aboutImage1)
      if (data.config.aboutImage2) setAboutImage2Preview(data.config.aboutImage2)
      if (data.config.aboutImage3) setAboutImage3Preview(data.config.aboutImage3)

    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando configuración:', err)
    } finally {
      setLoading(false)
    }
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "logoLight" | "favicon") => {
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
        
        // Mostrar preview inmediatamente
        if (type === "logo") {
          setLogoPreview(compressedImage)
        } else if (type === "logoLight") {
          setLogoLightPreview(compressedImage)
        } else {
          setFaviconPreview(compressedImage)
        }

        // Subir a Cloudinary
        const response = await fetch('/api/upload-cloudinary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: compressedImage,
            folder: 'config'
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // Usar URL de Cloudinary
          if (type === "logo") {
            setConfig({ ...config, logo: data.url })
          } else if (type === "logoLight") {
            setConfig({ ...config, logoLight: data.url })
          } else {
            setConfig({ ...config, favicon: data.url })
          }
          alert(`✅ ${type === 'logo' ? 'Logo' : type === 'logoLight' ? 'Logo claro' : 'Favicon'} subido exitosamente a Cloudinary`)
        } else {
          throw new Error(data.error || 'Error al subir imagen')
        }
      } catch (error) {
        console.error('Error subiendo imagen:', error)
        alert('Error al subir la imagen. Intenta con otra imagen.')
      }
    }
  }

  const handleRemoveLogo = (type: "logo" | "logoLight" | "favicon") => {
    if (type === "logo") {
      setLogoPreview(null)
      setConfig({ ...config, logo: null })
    } else if (type === "logoLight") {
      setLogoLightPreview(null)
      setConfig({ ...config, logoLight: null })
    } else {
      setFaviconPreview(null)
      setConfig({ ...config, favicon: null })
    }
  }

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2 | 3) => {
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
        
        // Mostrar preview inmediatamente
        if (imageNumber === 1) {
          setAboutImage1Preview(compressedImage)
        } else if (imageNumber === 2) {
          setAboutImage2Preview(compressedImage)
        } else {
          setAboutImage3Preview(compressedImage)
        }

        // Subir a Cloudinary
        const response = await fetch('/api/upload-cloudinary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: compressedImage,
            folder: 'about'
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // Usar URL de Cloudinary
          if (imageNumber === 1) {
            setConfig({ ...config, aboutImage1: data.url })
          } else if (imageNumber === 2) {
            setConfig({ ...config, aboutImage2: data.url })
          } else {
            setConfig({ ...config, aboutImage3: data.url })
          }
          alert(`✅ Imagen ${imageNumber} de About subida exitosamente a Cloudinary`)
        } else {
          throw new Error(data.error || 'Error al subir imagen')
        }
      } catch (error) {
        console.error('Error subiendo imagen:', error)
        alert('Error al subir la imagen. Intenta con otra imagen.')
      }
    }
  }

  const handleRemoveAboutImage = (imageNumber: 1 | 2 | 3) => {
    if (imageNumber === 1) {
      setAboutImage1Preview(null)
      setConfig({ ...config, aboutImage1: null })
    } else if (imageNumber === 2) {
      setAboutImage2Preview(null)
      setConfig({ ...config, aboutImage2: null })
    } else {
      setAboutImage3Preview(null)
      setConfig({ ...config, aboutImage3: null })
    }
  }

  const handleColorChange = (field: keyof SystemConfig, value: string) => {
    setConfig({ ...config, [field]: value })
  }

  const handleAutoConfigureColors = async () => {
    if (!logoPreview && !config.logo) {
      setError('Por favor, sube un logo primero para auto-configurar los colores')
      return
    }

    try {
      setAutoConfiguring(true)
      setError(null)

      const logoUrl = logoPreview || config.logo
      if (!logoUrl) return

      const palette = await extractColorsFromImage(logoUrl)

      setConfig({
        ...config,
        primaryColor: palette.primaryColor,
        secondaryColor: palette.secondaryColor,
        accentColor: palette.accentColor,
        backgroundColor: palette.backgroundColor,
        textColor: palette.textColor,
        headerColor: palette.headerColor,
        buttonColor: palette.buttonColor,
        linkColor: palette.linkColor
      })

      setSaved(false)
      alert('✅ ¡Colores auto-configurados desde el logo!\n\n⚠️ IMPORTANTE: Después de guardar, recarga la portada (/) para ver los cambios aplicados.')
    } catch (err: any) {
      setError('Error al extraer colores del logo: ' + err.message)
      console.error('Error en auto-configuración:', err)
    } finally {
      setAutoConfiguring(false)
    }
  }

  const handleSave = async () => {
    try {
      setError(null)
      
      // Preparar solo los datos de la sección activa
      let dataToSend: any = {}
      
      switch (activeSection) {
        case 'general':
          dataToSend = {
            siteName: config.siteName,
            whatsappNumber: config.whatsappNumber,
            whatsappMessage: config.whatsappMessage,
            whatsappEnabled: config.whatsappEnabled,
            companyName: config.companyName,
            companyDescription: config.companyDescription,
            companyEmail: config.companyEmail,
            companyPhone: config.companyPhone,
            companyAddress: config.companyAddress
          }
          break
        
        case 'logos':
          dataToSend = {
            logo: config.logo,
            logoLight: config.logoLight,
            favicon: config.favicon
          }
          break
        
        case 'colors':
          dataToSend = {
            primaryColor: config.primaryColor,
            secondaryColor: config.secondaryColor,
            accentColor: config.accentColor,
            backgroundColor: config.backgroundColor,
            textColor: config.textColor,
            headerColor: config.headerColor,
            sidebarColor: config.sidebarColor,
            buttonColor: config.buttonColor,
            linkColor: config.linkColor
          }
          break
        
        case 'about':
          dataToSend = {
            aboutTitle: config.aboutTitle,
            aboutDescription: config.aboutDescription,
            aboutMission: config.aboutMission,
            aboutVision: config.aboutVision,
            aboutHistory: config.aboutHistory,
            aboutImage1: config.aboutImage1,
            aboutImage2: config.aboutImage2,
            aboutImage3: config.aboutImage3
          }
          break
        
        case 'footer':
          dataToSend = {
            footerText: config.footerText,
            footerShowCompanyInfo: config.footerShowCompanyInfo,
            footerShowSocialMedia: config.footerShowSocialMedia,
            footerFacebookUrl: config.footerFacebookUrl,
            footerInstagramUrl: config.footerInstagramUrl,
            footerTwitterUrl: config.footerTwitterUrl,
            footerLinkedinUrl: config.footerLinkedinUrl,
            footerYoutubeUrl: config.footerYoutubeUrl,
            footerLink1Text: config.footerLink1Text,
            footerLink1Url: config.footerLink1Url,
            footerLink2Text: config.footerLink2Text,
            footerLink2Url: config.footerLink2Url,
            footerLink3Text: config.footerLink3Text,
            footerLink3Url: config.footerLink3Url,
            footerLink4Text: config.footerLink4Text,
            footerLink4Url: config.footerLink4Url
          }
          break
      }

      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar configuración')
      }

      // Recargar configuración global inmediatamente
      await reloadConfig()
      
      setSaved(true)
      setTimeout(() => setSaved(false), 5000)
      
      alert('✅ Configuración guardada y aplicada correctamente.\n\nLos cambios se reflejarán automáticamente en todas las páginas.')
    } catch (err: any) {
      setError(err.message)
      console.error('Error guardando configuración:', err)
    }
  }

  const handleReset = async () => {
    if (confirm("¿Estás seguro de restaurar la configuración por defecto?")) {
      try {
        setError(null)
        const response = await fetch('/api/config/reset', {
          method: 'POST'
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al restaurar configuración')
        }

        // Actualizar estado con configuración restaurada
      setConfig({
        siteName: "Portal Estudiante",
        logo: null,
        logoLight: null,
        favicon: null,
        primaryColor: "#000000",
        secondaryColor: "#6B7280",
        accentColor: "#3B82F6",
        backgroundColor: "#F9FAFB",
        textColor: "#111827",
        headerColor: "#FFFFFF",
        sidebarColor: "#1F2937",
        buttonColor: "#000000",
        linkColor: "#3B82F6",
        companyName: "Centro de Capacitación ADAM",
        companyDescription: "Formación en Maquinaria Pesada",
        companyEmail: "contacto@adam.cl",
        companyPhone: "+56 9 1234 5678",
        companyAddress: "Santiago, Chile",
        whatsappNumber: "+56912345678",
        whatsappMessage: "Hola, me gustaría obtener más información sobre los cursos disponibles.",
        whatsappEnabled: true,
        aboutTitle: "Sobre Nosotros",
        aboutDescription: "Somos líderes en formación de operadores de maquinaria pesada con más de 15 años de experiencia en el sector.",
        aboutMission: "Formar operadores altamente calificados y certificados, brindando las mejores herramientas y conocimientos para su desarrollo profesional en la industria de la construcción y minería.",
        aboutVision: "Ser el centro de capacitación líder en Chile, reconocido por la excelencia en la formación de operadores de maquinaria pesada y por contribuir al desarrollo de la industria.",
        aboutHistory: "Fundado en 2010, nuestro centro ha capacitado a más de 5,000 operadores que hoy trabajan en las principales empresas del país. Contamos con instalaciones modernas, maquinaria de última generación y un equipo de instructores certificados con amplia experiencia en el campo.",
        aboutImage1: null,
        aboutImage2: null,
        aboutImage3: null,
        footerText: "© 2024 Centro de Capacitación ADAM. Todos los derechos reservados.",
        footerShowCompanyInfo: true,
        footerShowSocialMedia: true,
        footerFacebookUrl: null,
        footerInstagramUrl: null,
        footerTwitterUrl: null,
        footerLinkedinUrl: null,
        footerYoutubeUrl: null,
        footerLink1Text: null,
        footerLink1Url: null,
        footerLink2Text: null,
        footerLink2Url: null,
        footerLink3Text: null,
        footerLink3Url: null,
        footerLink4Text: null,
        footerLink4Url: null
      })
      setLogoPreview(null)
      setLogoLightPreview(null)
      setFaviconPreview(null)
      setAboutImage1Preview(null)
      setAboutImage2Preview(null)
      setAboutImage3Preview(null)

        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err: any) {
        setError(err.message)
        console.error('Error restaurando configuración:', err)
      }
    }
  }

  const colorPresets = [
    { name: "Clásico Negro", primary: "#000000", secondary: "#6B7280", accent: "#3B82F6" },
    { name: "Azul Profesional", primary: "#1E40AF", secondary: "#3B82F6", accent: "#60A5FA" },
    { name: "Verde Moderno", primary: "#047857", secondary: "#10B981", accent: "#34D399" },
    { name: "Púrpura Elegante", primary: "#7C3AED", secondary: "#8B5CF6", accent: "#A78BFA" },
    { name: "Rojo Dinámico", primary: "#DC2626", secondary: "#EF4444", accent: "#F87171" },
    { name: "Naranja Vibrante", primary: "#EA580C", secondary: "#F97316", accent: "#FB923C" }
  ]

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setConfig({
      ...config,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      buttonColor: preset.primary,
      linkColor: preset.accent
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header with Save Button */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Configuración del Sistema</h3>
            <p className="text-sm text-gray-600">Personaliza la apariencia y configuración general del portal</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Restaurar por Defecto
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {saved ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardado
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-6">
            <button
              onClick={() => setActiveSection("general")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "general"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveSection("logos")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "logos"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Logos e Iconos
            </button>
            <button
              onClick={() => setActiveSection("colors")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "colors"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Colores del Sistema
            </button>
            <button
              onClick={() => setActiveSection("about")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "about"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Sobre Nosotros
            </button>
            <button
              onClick={() => setActiveSection("footer")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "footer"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Footer
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* General Section */}
          {activeSection === "general" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Nombre del Sitio</label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="Portal Estudiante"
                />
                <p className="text-xs text-gray-500 mt-1">Este nombre aparecerá en el header y en el título del navegador</p>
              </div>

              {/* WhatsApp Configuration */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Configuración de WhatsApp</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="whatsappEnabled"
                      checked={config.whatsappEnabled}
                      onChange={(e) => setConfig({ ...config, whatsappEnabled: e.target.checked })}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="whatsappEnabled" className="text-sm font-medium text-gray-900">
                      Habilitar botón flotante de WhatsApp
                    </label>
                  </div>

                  {config.whatsappEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Número de WhatsApp</label>
                        <input
                          type="text"
                          value={config.whatsappNumber}
                          onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          placeholder="+56912345678"
                        />
                        <p className="text-xs text-gray-500 mt-1">Incluye el código de país (ej: +56 para Chile)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Mensaje Predeterminado</label>
                        <textarea
                          value={config.whatsappMessage || ''}
                          onChange={(e) => setConfig({ ...config, whatsappMessage: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                          placeholder="Hola, me gustaría obtener más información..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Este mensaje se enviará automáticamente al abrir WhatsApp</p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-900">Captura de Leads Automática</p>
                            <p className="text-sm text-green-700 mt-1">
                              Cada clic en el botón de WhatsApp se registrará como un lead en el sistema para seguimiento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Información de la Empresa</h4>
                <p className="text-sm text-gray-600 mb-4">Esta información se mostrará en el footer del portal</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Nombre de la Empresa</label>
                    <input
                      type="text"
                      value={config.companyName}
                      onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      placeholder="Centro de Capacitación ADAM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Descripción Breve</label>
                    <input
                      type="text"
                      value={config.companyDescription}
                      onChange={(e) => setConfig({ ...config, companyDescription: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      placeholder="Formación en Maquinaria Pesada"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Correo Electrónico</label>
                      <input
                        type="email"
                        value={config.companyEmail}
                        onChange={(e) => setConfig({ ...config, companyEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="contacto@adam.cl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Teléfono</label>
                      <input
                        type="text"
                        value={config.companyPhone}
                        onChange={(e) => setConfig({ ...config, companyPhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Dirección</label>
                    <input
                      type="text"
                      value={config.companyAddress}
                      onChange={(e) => setConfig({ ...config, companyAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      placeholder="Santiago, Chile"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Vista Previa</h4>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-8 w-auto" />
                    ) : (
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        P
                      </div>
                    )}
                    <span className="text-lg font-semibold" style={{ color: config.textColor }}>
                      {config.siteName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logos Section */}
          {activeSection === "logos" && (
            <div className="space-y-8">
              {/* Main Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Logo Principal (Fondo Claro)</label>
                <p className="text-xs text-gray-500 mb-3">Se mostrará en el header y áreas con fondo claro</p>
                
                {logoPreview ? (
                  <div className="relative w-full max-w-md h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-24 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo("logo")}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600">Subir logo principal</p>
                      <p className="text-xs text-gray-500">PNG, SVG (recomendado 200x50px)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "logo")}
                    />
                  </label>
                )}
              </div>

              {/* Light Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Logo Claro (Fondo Oscuro)</label>
                <p className="text-xs text-gray-500 mb-3">Se mostrará en áreas con fondo oscuro</p>
                
                {logoLightPreview ? (
                  <div className="relative w-full max-w-md h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-900 flex items-center justify-center">
                    <img
                      src={logoLightPreview}
                      alt="Logo light preview"
                      className="max-h-24 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo("logoLight")}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-900 hover:bg-gray-800">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-300">Subir logo claro</p>
                      <p className="text-xs text-gray-400">PNG, SVG (recomendado 200x50px)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "logoLight")}
                    />
                  </label>
                )}
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Favicon</label>
                <p className="text-xs text-gray-500 mb-3">Icono que aparece en la pestaña del navegador</p>
                
                {faviconPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center">
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="w-16 h-16 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo("favicon")}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                    <svg className="w-8 h-8 mb-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-600 text-center px-2">Subir favicon</p>
                    <p className="text-xs text-gray-500">32x32px</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "favicon")}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Colors Section */}
          {activeSection === "colors" && (
            <div className="space-y-8">
              {/* Color Presets */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Paletas Predefinidas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors text-left"
                    >
                      <div className="flex gap-2 mb-2">
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: preset.primary }}></div>
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: preset.secondary }}></div>
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: preset.accent }}></div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Colores Personalizados</h4>
                  <button
                    onClick={handleAutoConfigureColors}
                    disabled={autoConfiguring || (!logoPreview && !config.logo)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {autoConfiguring ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extrayendo colores...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Auto-configurar desde Logo
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color Primario</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color Secundario</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.secondaryColor}
                        onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color de Acento</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => handleColorChange("accentColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.accentColor}
                        onChange={(e) => handleColorChange("accentColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color de Fondo</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color de Texto</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => handleColorChange("textColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => handleColorChange("textColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color de Header</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.headerColor}
                        onChange={(e) => handleColorChange("headerColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.headerColor}
                        onChange={(e) => handleColorChange("headerColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color de Botones</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.buttonColor}
                        onChange={(e) => handleColorChange("buttonColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.buttonColor}
                        onChange={(e) => handleColorChange("buttonColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color de Enlaces</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.linkColor}
                        onChange={(e) => handleColorChange("linkColor", e.target.value)}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.linkColor}
                        onChange={(e) => handleColorChange("linkColor", e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Vista Previa de Colores</h4>
                <div className="border-2 border-gray-200 rounded-lg p-6" style={{ backgroundColor: config.backgroundColor }}>
                  <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    <h3 className="text-xl font-bold" style={{ color: config.primaryColor }}>
                      Título Principal
                    </h3>
                    <p style={{ color: config.textColor }}>
                      Este es un texto de ejemplo para mostrar cómo se verán los colores en el sistema.
                    </p>
                    <div className="flex gap-3">
                      <button
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: config.buttonColor }}
                      >
                        Botón Principal
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: config.secondaryColor, color: "white" }}
                      >
                        Botón Secundario
                      </button>
                    </div>
                    <a href="#" className="font-medium" style={{ color: config.linkColor }}>
                      Enlace de ejemplo
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          {activeSection === "about" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Título de la Sección</label>
                <input
                  type="text"
                  value={config.aboutTitle}
                  onChange={(e) => setConfig({ ...config, aboutTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="Sobre Nosotros"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Descripción Principal</label>
                <textarea
                  value={config.aboutDescription || ''}
                  onChange={(e) => setConfig({ ...config, aboutDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                  placeholder="Descripción breve de la empresa..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Misión</label>
                  <textarea
                    value={config.aboutMission || ''}
                    onChange={(e) => setConfig({ ...config, aboutMission: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    placeholder="Nuestra misión..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Visión</label>
                  <textarea
                    value={config.aboutVision || ''}
                    onChange={(e) => setConfig({ ...config, aboutVision: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    placeholder="Nuestra visión..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Historia de la Empresa</label>
                <textarea
                  value={config.aboutHistory || ''}
                  onChange={(e) => setConfig({ ...config, aboutHistory: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                  placeholder="Nuestra historia..."
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Imágenes de la Sección</h4>
                <p className="text-sm text-gray-600 mb-4">Sube hasta 3 imágenes que se mostrarán en la sección Sobre Nosotros</p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Imagen 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Imagen 1</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {(aboutImage1Preview || config.aboutImage1) ? (
                        <div className="relative">
                          <img
                            src={aboutImage1Preview || config.aboutImage1 || ""}
                            alt="Preview 1"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveAboutImage(1)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Click para subir</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAboutImageUpload(e, 1)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Imagen 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Imagen 2</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {(aboutImage2Preview || config.aboutImage2) ? (
                        <div className="relative">
                          <img
                            src={aboutImage2Preview || config.aboutImage2 || ""}
                            alt="Preview 2"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveAboutImage(2)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Click para subir</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAboutImageUpload(e, 2)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Imagen 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Imagen 3</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {(aboutImage3Preview || config.aboutImage3) ? (
                        <div className="relative">
                          <img
                            src={aboutImage3Preview || config.aboutImage3 || ""}
                            alt="Preview 3"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveAboutImage(3)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Click para subir</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAboutImageUpload(e, 3)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Section */}
          {activeSection === "footer" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Texto del Copyright</label>
                <input
                  type="text"
                  value={config.footerText}
                  onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="© 2024 Centro de Capacitación ADAM. Todos los derechos reservados."
                />
              </div>

              {/* Opciones de Visualización */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Opciones de Visualización</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="footerShowCompanyInfo"
                      checked={config.footerShowCompanyInfo}
                      onChange={(e) => setConfig({ ...config, footerShowCompanyInfo: e.target.checked })}
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <label htmlFor="footerShowCompanyInfo" className="text-sm font-medium text-gray-900">
                      Mostrar información de la empresa
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="footerShowSocialMedia"
                      checked={config.footerShowSocialMedia}
                      onChange={(e) => setConfig({ ...config, footerShowSocialMedia: e.target.checked })}
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <label htmlFor="footerShowSocialMedia" className="text-sm font-medium text-gray-900">
                      Mostrar redes sociales
                    </label>
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              {config.footerShowSocialMedia && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Redes Sociales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Facebook URL</label>
                      <input
                        type="url"
                        value={config.footerFacebookUrl || ''}
                        onChange={(e) => setConfig({ ...config, footerFacebookUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="https://facebook.com/tu-pagina"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Instagram URL</label>
                      <input
                        type="url"
                        value={config.footerInstagramUrl || ''}
                        onChange={(e) => setConfig({ ...config, footerInstagramUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="https://instagram.com/tu-perfil"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Twitter URL</label>
                      <input
                        type="url"
                        value={config.footerTwitterUrl || ''}
                        onChange={(e) => setConfig({ ...config, footerTwitterUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="https://twitter.com/tu-usuario"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        value={config.footerLinkedinUrl || ''}
                        onChange={(e) => setConfig({ ...config, footerLinkedinUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="https://linkedin.com/company/tu-empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">YouTube URL</label>
                      <input
                        type="url"
                        value={config.footerYoutubeUrl || ''}
                        onChange={(e) => setConfig({ ...config, footerYoutubeUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="https://youtube.com/@tu-canal"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Enlaces Personalizados */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Enlaces Personalizados del Footer</h4>
                <p className="text-sm text-gray-600 mb-4">Agrega hasta 4 enlaces personalizados en el footer</p>
                <div className="space-y-4">
                  {/* Link 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 1 - Texto</label>
                      <input
                        type="text"
                        value={config.footerLink1Text || ''}
                        onChange={(e) => setConfig({ ...config, footerLink1Text: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="Términos y Condiciones"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 1 - URL</label>
                      <input
                        type="url"
                        value={config.footerLink1Url || ''}
                        onChange={(e) => setConfig({ ...config, footerLink1Url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="/terminos"
                      />
                    </div>
                  </div>

                  {/* Link 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 2 - Texto</label>
                      <input
                        type="text"
                        value={config.footerLink2Text || ''}
                        onChange={(e) => setConfig({ ...config, footerLink2Text: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="Política de Privacidad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 2 - URL</label>
                      <input
                        type="url"
                        value={config.footerLink2Url || ''}
                        onChange={(e) => setConfig({ ...config, footerLink2Url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="/privacidad"
                      />
                    </div>
                  </div>

                  {/* Link 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 3 - Texto</label>
                      <input
                        type="text"
                        value={config.footerLink3Text || ''}
                        onChange={(e) => setConfig({ ...config, footerLink3Text: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="Contacto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 3 - URL</label>
                      <input
                        type="url"
                        value={config.footerLink3Url || ''}
                        onChange={(e) => setConfig({ ...config, footerLink3Url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="/contacto"
                      />
                    </div>
                  </div>

                  {/* Link 4 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 4 - Texto</label>
                      <input
                        type="text"
                        value={config.footerLink4Text || ''}
                        onChange={(e) => setConfig({ ...config, footerLink4Text: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="Preguntas Frecuentes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enlace 4 - URL</label>
                      <input
                        type="url"
                        value={config.footerLink4Url || ''}
                        onChange={(e) => setConfig({ ...config, footerLink4Url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="/faq"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
