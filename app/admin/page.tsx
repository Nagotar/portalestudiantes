"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useConfig } from "@/contexts/ConfigContext"
import StatsCard from "./components/StatsCard"
import VisitsChart from "./components/VisitsChart"
import BannersManager from "./components/BannersManager"
import InfoRequestsTable from "./components/InfoRequestsTable"
import QuickActions from "./components/QuickActions"
import VideosManager from "./components/VideosManager"
import EvaluationsManager from "./components/EvaluationsManager"
import SatisfactionSurveysManager from "./components/SatisfactionSurveysManager"
import SystemConfig from "./components/SystemConfig"
import CoursesManager from "./components/CoursesManager"
import DocumentsManager from "./components/DocumentsManager"
import UsersManager from "./components/UsersManager"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()
  const { config } = useConfig()

  useEffect(() => {
    if (activeTab === "overview") {
      loadStats()
    }
  }, [activeTab])

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoadingStats(false)
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

  const tabs = [
    { id: "overview", label: "Resumen", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "users", label: "Usuarios", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: "courses", label: "Cursos", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { id: "documents", label: "Documentos", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "banners", label: "Banners", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "videos", label: "Videos", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "evaluations", label: "Evaluaciones", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { id: "satisfaction", label: "Encuestas", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "requests", label: "Solicitudes", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "config", label: "Configuración", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                {config?.logo ? (
                  <img 
                    src={config.logo} 
                    alt={config.siteName || "Logo"} 
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: config?.primaryColor || '#000000' }}
                  >
                    {(config?.siteName || "Portal Estudiante").charAt(0)}
                  </div>
                )}
                <span className="text-lg font-semibold text-gray-900">{config?.siteName || "Portal Estudiante"}</span>
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <span className="hidden sm:block text-sm text-gray-600">Panel de Administración</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 relative">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">Administrador</div>
                  <div className="text-xs text-gray-500">admin@portal.com</div>
                </div>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: config?.primaryColor || '#111827',
                    opacity: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  A
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

        {/* Tabs Navigation */}
        <div className="px-6 border-t border-gray-200">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={activeTab === tab.id ? { borderColor: config?.primaryColor || '#000000' } : {}}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumen General</h2>
              <p className="text-gray-600">Vista general de todas las métricas y actividades</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingStats ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                      <div className="h-12 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </>
              ) : stats ? (
                <>
                  <StatsCard
                    title="Visitas Totales"
                    value={stats.visits.total.toLocaleString()}
                    change={stats.visits.change}
                    trend={stats.visits.trend}
                    icon="chart"
                  />
                  <StatsCard
                    title="Solicitudes de Info"
                    value={stats.requests.total.toLocaleString()}
                    change={stats.requests.change}
                    trend={stats.requests.trend}
                    icon="mail"
                  />
                  <StatsCard
                    title="Banners Activos"
                    value={stats.banners.total.toString()}
                    change={stats.banners.change}
                    trend={stats.banners.trend}
                    icon="image"
                  />
                  <StatsCard
                    title="Tasa de Conversión"
                    value={stats.conversion.rate}
                    change={stats.conversion.change}
                    trend={stats.conversion.trend}
                    icon="percent"
                  />
                </>
              ) : (
                <>
                  <StatsCard
                    title="Visitas Totales"
                    value="0"
                    change="0%"
                    trend="neutral"
                    icon="chart"
                  />
                  <StatsCard
                    title="Solicitudes de Info"
                    value="0"
                    change="0%"
                    trend="neutral"
                    icon="mail"
                  />
                  <StatsCard
                    title="Banners Activos"
                    value="0"
                    change="0%"
                    trend="neutral"
                    icon="image"
                  />
                  <StatsCard
                    title="Tasa de Conversión"
                    value="0%"
                    change="0%"
                    trend="neutral"
                    icon="percent"
                  />
                </>
              )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VisitsChart />
              </div>
              <div>
                <QuickActions onTabChange={setActiveTab} />
              </div>
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Banners</h2>
              <p className="text-gray-600">Administra los banners de la portada principal</p>
            </div>
            <BannersManager />
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Videos Didácticos</h2>
              <p className="text-gray-600">Gestiona el contenido educativo en video</p>
            </div>
            <VideosManager />
          </div>
        )}

        {/* Evaluations Tab */}
        {activeTab === "evaluations" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Modelos de Evaluaciones</h2>
              <p className="text-gray-600">Crea y gestiona evaluaciones para los estudiantes</p>
            </div>
            <EvaluationsManager />
          </div>
        )}

        {/* Satisfaction Surveys Tab */}
        {activeTab === "satisfaction" && <SatisfactionSurveysManager />}

        {/* Users Tab */}
        {activeTab === "users" && <UsersManager />}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitudes de Información</h2>
              <p className="text-gray-600">Gestiona las consultas de estudiantes interesados</p>
            </div>
            <InfoRequestsTable />
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Cursos</h2>
              <p className="text-gray-600">Administra los cursos disponibles en la plataforma</p>
            </div>
            <CoursesManager />
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentos de Licencias</h2>
              <p className="text-gray-600">Gestiona los requisitos y documentación para obtener licencias de conducir</p>
            </div>
            <DocumentsManager />
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración del Sistema</h2>
              <p className="text-gray-600">Personaliza la apariencia y configuración general del portal</p>
            </div>
            <SystemConfig />
          </div>
        )}
      </main>
    </div>
  )
}
