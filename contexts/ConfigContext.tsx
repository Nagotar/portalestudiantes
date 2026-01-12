"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

interface ConfigContextType {
  config: SystemConfig | null
  loading: boolean
  error: string | null
  reloadConfig: () => Promise<void>
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

// Caché en memoria (más rápido que localStorage)
let configCache: SystemConfig | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutos

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SystemConfig | null>(configCache)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadConfig = async (forceReload = false) => {
    try {
      // Si hay caché válido en memoria y no es recarga forzada, usarlo
      if (!forceReload && configCache && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        setConfig(configCache)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      // Cargar desde API
      const response = await fetch('/api/config', {
        cache: 'no-store' // Evitar caché del navegador
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar configuración')
      }

      // Guardar en caché de memoria
      configCache = data.config
      cacheTimestamp = Date.now()
      
      setConfig(data.config)

    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando configuración:', err)
    } finally {
      setLoading(false)
    }
  }

  const reloadConfig = async () => {
    // Limpiar caché y recargar
    configCache = null
    cacheTimestamp = 0
    await loadConfig(true)
  }

  useEffect(() => {
    // Solo cargar si no hay caché
    if (!configCache) {
      loadConfig()
    }
  }, [])

  return (
    <ConfigContext.Provider value={{ config, loading, error, reloadConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider')
  }
  return context
}
