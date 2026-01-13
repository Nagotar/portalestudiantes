"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useConfig } from "@/contexts/ConfigContext"

interface Banner {
  id: number
  title: string
  subtitle: string
  description: string
  gradient: string
  icon: string
  image?: string
  useImage: boolean
  active: boolean
}

interface CompanyLogo {
  id: number
  name: string
  logo: string
  active: boolean
}

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
}

const IconComponent = ({ type, className = "" }: { type: string; className?: string }) => {
  const icons: { [key: string]: React.ReactElement } = {
    graduation: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    book: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    bookOpen: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    userGroup: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    trophy: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    sparkles: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  }
  
  return icons[type] || null
}

interface Course {
  id: number
  name: string
  description: string
  fullDescription?: string
  duration: string
  level: string
  price: number
  category: string
  gradient: string
  videoUrl?: string
  modules?: string[]
  benefits?: string[]
  image: string | null
  featured: boolean
  active: boolean
}

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
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    curso: "",
    mensaje: ""
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [banners, setBanners] = useState<Banner[]>([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [companyLogos, setCompanyLogos] = useState<CompanyLogo[]>([])
  const [loadingLogos, setLoadingLogos] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  
  // Usar configuración global desde el contexto
  const { config, loading: loadingConfig } = useConfig()
  
  // Valores por defecto si no hay configuración
  const whatsappNumber = config?.whatsappNumber || "+56912345678"
  const whatsappMessage = config?.whatsappMessage || "Hola, me gustaría obtener más información sobre los cursos disponibles."

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (banners.length || 1))
    }, 3000)
    return () => clearInterval(timer)
  }, [banners.length])

  // Cargar datos desde el backend
  useEffect(() => {
    loadCourses()
    loadDocuments()
    loadBanners()
    loadCompanyLogos()
    loadVideos()
  }, [])

  const loadCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await fetch('/api/courses?active=true&featured=true')
      const data = await response.json()

      if (response.ok) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error cargando cursos:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const response = await fetch('/api/documents?active=true')
      const data = await response.json()

      if (response.ok) {
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error cargando documentos:', error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const loadBanners = async () => {
    try {
      setLoadingBanners(true)
      const response = await fetch('/api/banners?active=true')
      const data = await response.json()

      if (response.ok) {
        setBanners(data.banners || [])
      }
    } catch (error) {
      console.error('Error cargando banners:', error)
    } finally {
      setLoadingBanners(false)
    }
  }

  const loadCompanyLogos = async () => {
    try {
      setLoadingLogos(true)
      const response = await fetch('/api/company-logos?active=true')
      const data = await response.json()

      if (response.ok) {
        setCompanyLogos(data.logos || [])
      }
    } catch (error) {
      console.error('Error cargando logos:', error)
    } finally {
      setLoadingLogos(false)
    }
  }

  const loadVideos = async () => {
    try {
      setLoadingVideos(true)
      const response = await fetch('/api/videos?active=true&type=informativo&featured=true')
      const data = await response.json()

      if (response.ok) {
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Error cargando videos:', error)
    } finally {
      setLoadingVideos(false)
    }
  }

  const handlePlayVideo = async (video: Video) => {
    setSelectedVideo(video)
    setShowVideoModal(true)
    
    // Incrementar contador de vistas
    try {
      await fetch(`/api/videos/${video.id}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error registrando vista:', error)
    }
  }

  const handleDownloadDocument = async (doc: Document) => {
    try {
      // Incrementar contador de descargas
      await fetch(`/api/documents/${doc.id}/download`, {
        method: 'POST'
      })

      // Descargar el PDF
      if (doc.fileData) {
        const link = document.createElement('a')
        link.href = doc.fileData
        link.download = doc.fileName || `${doc.title}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error descargando documento:', error)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(url, '_blank')
    
    // Registrar el lead (esto se conectará con el backend)
    console.log('Lead de WhatsApp registrado:', {
      timestamp: new Date().toISOString(),
      source: 'whatsapp_button',
      phone: whatsappNumber
    })
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/info-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormSubmitted(true)
        
        // Resetear formulario después de 3 segundos
        setTimeout(() => {
          setShowContactModal(false)
          setFormSubmitted(false)
          setFormData({
            nombre: "",
            email: "",
            telefono: "",
            curso: "",
            mensaje: ""
          })
        }, 3000)
      } else {
        alert('Error al enviar la solicitud. Por favor intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error)
      alert('Error al enviar la solicitud. Por favor intenta nuevamente.')
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            {config?.logo ? (
              <img 
                src={config.logo} 
                alt={config.siteName || "Logo"} 
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105 flex-shrink-0"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-transform group-hover:scale-105 flex-shrink-0"
                style={{ backgroundColor: config?.primaryColor || '#000000' }}
              >
                {(config?.siteName || "Portal Estudiante").charAt(0)}
              </div>
            )}
            <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {config?.siteName || "Portal Estudiante"}
            </span>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-6">
            <a 
              href="#nosotros" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden md:block"
            >
              Nosotros
            </a>
            <a 
              href="#cursos" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden md:block"
            >
              Cursos
            </a>
            <a 
              href="#documentos" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden md:block"
            >
              Documentación
            </a>
            <a 
              href="#videos" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden md:block"
            >
              Videos
            </a>
            <Link 
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Slider */}
      <section className="relative pt-20 overflow-hidden">
        <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
          {loadingBanners ? (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`
              }}
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          ) : banners.length === 0 ? (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`
              }}
            >
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">Bienvenido al Portal Estudiante</h2>
                <p className="text-xl">Tu plataforma educativa integral</p>
              </div>
            </div>
          ) : (
            banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                }`}
              >
                <div className={`h-full ${banner.useImage && banner.image ? '' : `bg-gradient-to-br ${banner.gradient}`} flex items-center justify-center relative`}>
                  {banner.useImage && banner.image ? (
                    <>
                      <img 
                        src={banner.image} 
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                    </>
                  )}
                
                <div className="container mx-auto px-4 relative z-10">
                  <div className="max-w-4xl mx-auto text-center text-white">
                    <div className="mb-6 flex justify-center">
                      <div className="w-24 h-24 animate-bounce">
                        <IconComponent type={banner.icon} className="w-full h-full" />
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                      <IconComponent type="sparkles" className="w-4 h-4" />
                      {banner.subtitle}
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
                      {banner.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                      {banner.description}
                    </p>
                    <Link 
                      href="/login"
                      style={{ backgroundColor: config?.buttonColor || '#000000' }}
                      className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium text-base hover:opacity-90 transition-all"
                    >
                      Comenzar Ahora
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center text-white text-2xl"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center text-white text-2xl"
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { number: "15,000+", label: "Estudiantes Activos" },
            { number: "500+", label: "Cursos Disponibles" },
            { number: "98%", label: "Satisfacción" },
            { number: "24/7", label: "Acceso Total" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className="text-5xl font-bold bg-clip-text text-transparent mb-2"
                style={{ 
                  backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 
              className="text-5xl font-bold mb-4 bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}
            >
              {config?.aboutTitle || "Sobre Nosotros"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {config?.aboutDescription || "Somos líderes en formación de operadores de maquinaria pesada con más de 15 años de experiencia en el sector."}
            </p>
          </div>

          {/* Images Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Imagen 1 */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
              {config?.aboutImage1 ? (
                <img src={config.aboutImage1} alt="Imagen 1" className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`
                  }}
                >
                  <svg className="w-20 h-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            </div>
            {/* Imagen 2 */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
              {config?.aboutImage2 ? (
                <img src={config.aboutImage2} alt="Imagen 2" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            </div>
            {/* Imagen 3 */}
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
              {config?.aboutImage3 ? (
                <img src={config.aboutImage3} alt="Imagen 3" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            </div>
          </div>

          {/* Mission and Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div 
              className="rounded-2xl p-8 border"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#3B82F6'}10, ${config?.accentColor || '#9333EA'}10)`,
                borderColor: `${config?.primaryColor || '#3B82F6'}30`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: config?.primaryColor || '#3B82F6' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Nuestra Misión</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {config?.aboutMission || "Formar operadores altamente calificados y certificados, brindando las mejores herramientas y conocimientos para su desarrollo profesional en la industria de la construcción y minería."}
              </p>
            </div>

            <div 
              className="rounded-2xl p-8 border"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${config?.accentColor || '#9333EA'}10, ${config?.secondaryColor || '#EC4899'}10)`,
                borderColor: `${config?.accentColor || '#9333EA'}30`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: config?.accentColor || '#9333EA' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Nuestra Visión</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {config?.aboutVision || "Ser el centro de capacitación líder en Chile, reconocido por la excelencia en la formación de operadores de maquinaria pesada y por contribuir al desarrollo de la industria."}
              </p>
            </div>
          </div>

          {/* History */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: config?.primaryColor || '#000000' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Nuestra Historia</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {config?.aboutHistory || "Fundado en 2010, nuestro centro ha capacitado a más de 5,000 operadores que hoy trabajan en las principales empresas del país. Contamos con instalaciones modernas, maquinaria de última generación y un equipo de instructores certificados con amplia experiencia en el campo."}
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
            Nuestros Cursos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra oferta educativa diseñada para impulsar tu carrera profesional
          </p>
        </div>

        {loadingCourses ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: config?.primaryColor || '#3B82F6' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Cargando cursos...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay cursos disponibles</h3>
            <p className="text-gray-600">Pronto agregaremos nuevos cursos</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {courses.map((course) => (
            <div 
              key={course.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-200"
            >
              <div className={`h-48 bg-gradient-to-br ${course.gradient} flex items-center justify-center relative overflow-hidden`}>
                {course.image ? (
                  <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/10" />
                    <svg className="w-20 h-20 text-white/80 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{course.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span 
                    className="text-xs font-medium px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${config?.primaryColor || '#3B82F6'}10`,
                      color: config?.primaryColor || '#3B82F6',
                      borderColor: `${config?.primaryColor || '#3B82F6'}30`
                    }}
                  >
                    {course.level}
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                    {course.category}
                  </span>
                  <span 
                    className="text-xs font-medium px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${config?.accentColor || '#9333EA'}10`,
                      color: config?.accentColor || '#9333EA',
                      borderColor: `${config?.accentColor || '#9333EA'}30`
                    }}
                  >
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    ${course.price.toLocaleString('es-CL')}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCourse(course)
                      setShowCourseModal(true)
                    }}
                    style={{ backgroundColor: config?.buttonColor || '#000000' }}
                    className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link 
            href="/login"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`
            }}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all"
          >
            Ver Todos los Cursos
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-20"
        style={{
          backgroundImage: `linear-gradient(to bottom right, #F9FAFB, ${config?.primaryColor || '#3B82F6'}10)`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 
              className="text-5xl font-bold mb-4 bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}
            >
              Testimonios de Nuestros Estudiantes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conoce las experiencias de quienes ya se han capacitado con nosotros
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "Carlos Muñoz",
                course: "Operador de Excavadoras",
                rating: 5,
                comment: "Excelente curso, los instructores son muy profesionales y la maquinaria está en perfectas condiciones. Conseguí trabajo apenas terminé la capacitación.",
                date: "Hace 2 semanas",
                avatar: "CM"
              },
              {
                name: "María González",
                course: "Operador de Grúas Torre",
                rating: 5,
                comment: "La mejor inversión que he hecho. El programa es completo y la certificación SEC me abrió muchas puertas. Totalmente recomendado.",
                date: "Hace 1 mes",
                avatar: "MG"
              },
              {
                name: "Roberto Silva",
                course: "Operador de Retroexcavadora",
                rating: 5,
                comment: "Instructores con mucha experiencia y paciencia. Las prácticas en terreno fueron fundamentales para mi aprendizaje. Muy satisfecho con el curso.",
                date: "Hace 3 semanas",
                avatar: "RS"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2"
                style={{
                  borderColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = config?.accentColor || '#9333EA'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                {/* Header con Avatar y Nombre */}
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`
                    }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.course}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                {/* Comentario */}
                <p className="text-gray-700 leading-relaxed mb-4">
                  "{testimonial.comment}"
                </p>

                {/* Fecha */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {testimonial.date}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">¿Quieres compartir tu experiencia?</p>
            <Link
              href="/login"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Inicia Sesión para Dejar tu Testimonio
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Companies Carousel */}
      <section className="bg-white py-16 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              Quiénes Han Confiado en Nosotros
            </h2>
            <p className="text-gray-600">
              Empresas líderes que confían en nuestros profesionales capacitados
            </p>
          </div>

          {loadingLogos ? (
            <div className="flex items-center justify-center py-12">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: config?.primaryColor || '#3B82F6' }}
              ></div>
            </div>
          ) : companyLogos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay logos de empresas disponibles</p>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll gap-16 items-center">
                {/* Logos de empresas - se repetirán para efecto infinito */}
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-16 items-center">
                    {companyLogos.map((company, index) => (
                      <div
                        key={`${setIndex}-${index}`}
                        className="flex-shrink-0 flex flex-col items-center gap-3 group"
                      >
                        <div className="w-56 h-32 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all flex items-center justify-center p-4">
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.name}
                              className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity">
                              <span className="text-white font-bold text-sm text-center px-2">
                                {company.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors text-center">
                          {company.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Documents Section */}
      <section id="documentos" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
            Documentos de Licencias
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descarga los requisitos necesarios para obtener tu licencia de conducir
          </p>
        </div>

        {loadingDocuments ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600">No hay documentos disponibles</p>
            <p className="text-sm text-gray-500 mt-2">Pronto agregaremos nuevos documentos</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2"
                style={{
                  borderColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = `${config?.primaryColor || '#3B82F6'}30`}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span 
                      className="px-3 py-1 text-xs font-bold rounded-full border"
                      style={{
                        backgroundColor: `${config?.primaryColor || '#3B82F6'}10`,
                        color: config?.primaryColor || '#3B82F6',
                        borderColor: `${config?.primaryColor || '#3B82F6'}30`
                      }}
                    >
                      {doc.licenseType}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{doc.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {doc.downloads} descargas
                    </span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </div>

                  <button 
                    onClick={() => handleDownloadDocument(doc)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 mb-4">¿Necesitas más información sobre licencias?</p>
          <Link 
            href="/login"
            style={{ backgroundColor: config?.buttonColor || '#000000' }}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all"
          >
            Ver Todos los Documentos
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="container mx-auto px-4 py-20 bg-gray-100">
        <div className="text-center mb-16">
          <h2 
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${config?.primaryColor || '#3B82F6'}, ${config?.accentColor || '#9333EA'})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
            Videos Informativos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conoce más sobre nuestra plataforma y cómo aprovechar al máximo tu experiencia
          </p>
        </div>

        {loadingVideos ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">No hay videos disponibles</p>
            <p className="text-sm text-gray-500 mt-2">Pronto agregaremos nuevos videos informativos</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {videos.map((video) => (
            <div 
              key={video.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-200"
            >
              <div className="relative h-56 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {video.thumbnail ? (
                  <>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-black/20" />
                )}
                
                {/* Play Button */}
                <div 
                  onClick={() => handlePlayVideo(video)}
                  className="relative z-10 w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer"
                >
                  <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/70 text-white text-xs font-bold rounded-full">
                  {video.duration}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {video.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{video.description}</p>
                <button 
                  onClick={() => handlePlayVideo(video)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Ver Video
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto p-16 rounded-2xl bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
          <div className="text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              ¿Listo para Comenzar?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Únete a miles de estudiantes que ya están transformando su educación
            </p>
            <button 
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-all"
            >
              Comenzar Ahora
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Tooltip */}
          {showWhatsAppTooltip && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-xl p-4 border border-gray-200 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">¿Necesitas ayuda?</p>
                  <p className="text-xs text-gray-600">Chatea con nosotros por WhatsApp</p>
                </div>
                <button
                  onClick={() => setShowWhatsAppTooltip(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            onMouseEnter={() => setShowWhatsAppTooltip(true)}
            onMouseLeave={() => setShowWhatsAppTooltip(false)}
            className="group relative w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center animate-bounce-slow"
          >
            {/* Pulse Animation */}
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
            
            {/* WhatsApp Icon */}
            <svg className="w-9 h-9 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>

            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              1
            </span>
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {!formSubmitted ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Solicita Información</h2>
                      <p className="text-gray-600 mt-2">Completa el formulario y nos pondremos en contacto contigo</p>
                    </div>
                    <button
                      onClick={() => setShowContactModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Juan Pérez"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="juan@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="+56 9 1234 5678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Curso de Interés *
                        </label>
                        <select
                          name="curso"
                          value={formData.curso}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          disabled={loadingCourses}
                        >
                          <option value="">
                            {loadingCourses ? "Cargando cursos..." : "Selecciona un curso"}
                          </option>
                          {courses
                            .filter(course => course.active)
                            .map((course) => (
                              <option key={course.id} value={course.name}>
                                {course.name}
                              </option>
                            ))}
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mensaje (Opcional)
                      </label>
                      <textarea
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleFormChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Cuéntanos más sobre tu interés en nuestros cursos..."
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-800">
                          Nos pondremos en contacto contigo en un plazo máximo de 24 horas para brindarte toda la información que necesites.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowContactModal(false)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        Enviar Consulta
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Consulta Enviada!</h3>
                  <p className="text-gray-600 mb-6">
                    Gracias por tu interés. Nos pondremos en contacto contigo muy pronto.
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cerrando automáticamente...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            {/* Header sin imagen */}
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6">
              <button
                onClick={() => setShowCourseModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg"
              >
                <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {selectedCourse.category}
                  </span>
                  {selectedCourse.featured && (
                    <span className="px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full text-sm font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Destacado
                    </span>
                  )}
                </div>
                <h2 className="text-4xl font-bold mb-2">{selectedCourse.name}</h2>
                <p className="text-white/90 text-lg">{selectedCourse.description}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Video de Introducción */}
              {(selectedCourse.video || selectedCourse.videoUrl || selectedCourse.video_url) && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Introducción
                  </h3>
                  {selectedCourse.video ? (
                    <div className="relative w-full rounded-xl overflow-hidden bg-black">
                      <video 
                        src={selectedCourse.video} 
                        controls 
                        className="w-full h-auto"
                        controlsList="nodownload"
                      >
                        Tu navegador no soporta el elemento de video.
                      </video>
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                        src={selectedCourse.videoUrl || selectedCourse.video_url}
                        title={`Video de ${selectedCourse.name}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Información del Curso */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-blue-900">Duración</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{selectedCourse.duration}</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-900">Nivel</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700">{selectedCourse.level}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-green-900">Inversión</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">${selectedCourse.price.toLocaleString('es-CL')}</p>
                </div>
              </div>

              {/* Descripción Completa */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Descripción del Curso
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedCourse.fullDescription || selectedCourse.full_description || selectedCourse.description}
                </p>
              </div>

              {/* Módulos del Curso */}
              {(() => {
                try {
                  const modules = typeof selectedCourse.modules === 'string' 
                    ? JSON.parse(selectedCourse.modules) 
                    : selectedCourse.modules || []
                  
                  if (modules.length > 0) {
                    return (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Módulos del Programa
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {modules.map((module: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition-colors">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">{idx + 1}</span>
                              </div>
                              <p className="text-sm text-gray-700 font-medium">{module}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                } catch (e) {
                  return null
                }
              })()}

              {/* Beneficios */}
              {(() => {
                try {
                  const benefits = typeof selectedCourse.benefits === 'string' 
                    ? JSON.parse(selectedCourse.benefits) 
                    : selectedCourse.benefits || []
                  
                  if (benefits.length > 0) {
                    return (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Beneficios Incluidos
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {benefits.map((benefit: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200 hover:border-green-300 transition-colors">
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-sm text-gray-700 font-medium">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                } catch (e) {
                  return null
                }
              })()}

              {/* Call to Action */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">¿Listo para comenzar?</h4>
                    <p className="text-sm text-gray-600">Solicita información y nos comunicaremos contigo</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCourseModal(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => {
                        setFormData({ ...formData, curso: selectedCourse.name })
                        setShowCourseModal(false)
                        setShowContactModal(true)
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Solicitar Información Ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
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

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-3 min-w-0">
              {config?.logo ? (
                <img 
                  src={config.logo} 
                  alt={config.siteName || "Logo"} 
                  className="w-10 h-10 object-contain flex-shrink-0"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: config?.primaryColor || '#000000' }}
                >
                  {config?.siteName?.[0] || 'P'}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{config?.companyName || "Centro de Capacitación ADAM"}</p>
                <p className="text-xs text-gray-600 truncate">{config?.companyDescription || "Formación en Maquinaria Pesada"}</p>
              </div>
            </div>

            {/* Información de Contacto */}
            {config?.footerShowCompanyInfo && (
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <h4 className="font-semibold text-gray-900 mb-1">Contacto</h4>
                {config?.companyEmail && (
                  <a href={`mailto:${config.companyEmail}`} className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{config.companyEmail}</span>
                  </a>
                )}
                {config?.companyPhone && (
                  <a href={`tel:${config.companyPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{config.companyPhone}</span>
                  </a>
                )}
                {config?.companyAddress && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{config.companyAddress}</span>
                  </span>
                )}
              </div>
            )}

            {/* Enlaces Personalizados */}
            {(config?.footerLink1Text || config?.footerLink2Text || config?.footerLink3Text || config?.footerLink4Text) && (
              <div className="flex flex-col gap-2 text-sm">
                <h4 className="font-semibold text-gray-900 mb-1">Enlaces</h4>
                {config?.footerLink1Text && config?.footerLink1Url && (
                  <a href={config.footerLink1Url} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {config.footerLink1Text}
                  </a>
                )}
                {config?.footerLink2Text && config?.footerLink2Url && (
                  <a href={config.footerLink2Url} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {config.footerLink2Text}
                  </a>
                )}
                {config?.footerLink3Text && config?.footerLink3Url && (
                  <a href={config.footerLink3Url} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {config.footerLink3Text}
                  </a>
                )}
                {config?.footerLink4Text && config?.footerLink4Url && (
                  <a href={config.footerLink4Url} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {config.footerLink4Text}
                  </a>
                )}
              </div>
            )}

            {/* Redes Sociales */}
            {config?.footerShowSocialMedia && (config?.footerFacebookUrl || config?.footerInstagramUrl || config?.footerTwitterUrl || config?.footerLinkedinUrl || config?.footerYoutubeUrl) && (
              <div className="flex flex-col gap-3">
                <h4 className="font-semibold text-gray-900">Síguenos</h4>
                <div className="flex gap-3">
                  {config?.footerFacebookUrl && (
                    <a 
                      href={config.footerFacebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-600 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {config?.footerInstagramUrl && (
                    <a 
                      href={config.footerInstagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {config?.footerTwitterUrl && (
                    <a 
                      href={config.footerTwitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-black flex items-center justify-center text-gray-600 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {config?.footerLinkedinUrl && (
                    <a 
                      href={config.footerLinkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-700 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {config?.footerYoutubeUrl && (
                    <a 
                      href={config.footerYoutubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-red-600 flex items-center justify-center text-gray-600 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
            <p className="text-xs text-gray-500">{config?.footerText || `© ${new Date().getFullYear()} ${config?.companyName || "Centro de Capacitación ADAM"}. Todos los derechos reservados.`}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
