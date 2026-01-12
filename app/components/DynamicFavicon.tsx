"use client"

import { useEffect } from 'react'

export default function DynamicFavicon() {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const response = await fetch('/api/config')
        const data = await response.json()

        if (response.ok && data.config?.favicon) {
          // Buscar el link del favicon existente o crear uno nuevo
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
          
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          
          // Actualizar el href del favicon
          link.href = data.config.favicon
        }
      } catch (error) {
        console.error('Error cargando favicon:', error)
      }
    }

    loadFavicon()
  }, [])

  return null
}
