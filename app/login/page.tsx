"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useConfig } from "@/contexts/ConfigContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const router = useRouter()
  const { config } = useConfig()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingRequest(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        // Mostrar mensaje de éxito y cerrar el modal después de 3 segundos
        setTimeout(() => {
          setShowForgotPasswordModal(false)
          setForgotPasswordEmail("")
          setIsSendingRequest(false)
        }, 3000)
      } else {
        setIsSendingRequest(false)
      }
    } catch (err) {
      console.error('Error al solicitar recuperación:', err)
      setIsSendingRequest(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    console.log('Frontend - Sending login with rememberMe:', rememberMe)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      console.log('Login successful, response:', data)
      console.log('RememberMe was:', rememberMe)

      // Redirigir según el rol del usuario
      if (data.redirectUrl) {
        router.push(data.redirectUrl)
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-slide-in-left">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            {config?.logo ? (
              <img 
                src={config.logo} 
                alt={config.siteName || "Logo"} 
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-lg font-bold">
                {(config?.siteName || "Portal Estudiante").charAt(0)}
              </div>
            )}
            <span className="text-xl font-semibold text-gray-900">{config?.siteName || "Portal Estudiante"}</span>
          </Link>

          {/* Title */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600">Ingresa tus credenciales para acceder</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-black focus:ring-black"
                />
                <span className="text-sm text-gray-600">Recordarme (30 días)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-gray-900 hover:text-gray-600 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                backgroundColor: config?.buttonColor || '#000000',
                color: '#ffffff'
              }}
              className="w-full px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Gradient */}
      <div 
        className="hidden lg:flex lg:flex-1 relative overflow-hidden animate-slide-in-right"
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${config?.primaryColor || '#1F2937'}, ${config?.secondaryColor || '#000000'})`
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <div className="max-w-md text-center">
            {config?.logoLight ? (
              <div className="mb-8 mx-auto flex items-center justify-center">
                <img 
                  src={config.logoLight} 
                  alt="Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 mx-auto">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
            <h2 className="text-3xl font-bold mb-4">{config?.siteName || "Bienvenido de vuelta"}</h2>
            <p className="text-lg text-gray-300 mb-8">
              Accede a tu portal educativo y continúa tu aprendizaje donde lo dejaste.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">15,000+</div>
                <div className="text-gray-400">Estudiantes</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-gray-400">Cursos</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">98%</div>
                <div className="text-gray-400">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Olvidaste tu Contraseña */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              {!isSendingRequest ? (
                <>
                  {/* Header con Logo */}
                  <div className="text-center mb-6">
                    {config?.logo ? (
                      <div className="mb-4 mx-auto flex items-center justify-center">
                        <img 
                          src={config.logo} 
                          alt={config.siteName || "Logo"} 
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        <span className="text-2xl font-bold text-white">
                          {(config?.siteName || "Portal").charAt(0)}
                        </span>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Olvidaste tu contraseña?</h2>
                    <p className="text-gray-600 text-sm">
                      Ingresa tu correo electrónico y contactaremos al administrador
                    </p>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-900 mb-2">
                        Correo Electrónico
                      </label>
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="tu@email.com"
                      />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPasswordModal(false)
                          setForgotPasswordEmail("")
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        style={{ 
                          backgroundColor: config?.buttonColor || '#000000',
                          color: '#ffffff'
                        }}
                        className="flex-1 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
                      >
                        Enviar Solicitud
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Mensaje de Confirmación */}
                  <div className="text-center">
                    {config?.logo ? (
                      <div className="mb-6 mx-auto flex items-center justify-center">
                        <img 
                          src={config.logo} 
                          alt={config.siteName || "Logo"} 
                          className="h-20 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <span className="text-3xl font-bold text-white">
                          {(config?.siteName || "Portal").charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Icono de éxito */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Solicitud Enviada!</h2>
                    <p className="text-gray-600 mb-6">
                      Ya contactamos al administrador para ayudarte con tu contraseña. 
                      Te responderemos a la brevedad.
                    </p>

                    {/* Animación de carga */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Cerrando...</span>
                    </div>
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
