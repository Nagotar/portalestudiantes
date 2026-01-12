/**
 * Extrae los colores dominantes de una imagen
 * Usa Canvas API para analizar los píxeles de la imagen
 */

interface ColorPalette {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headerColor: string
  buttonColor: string
  linkColor: string
}

/**
 * Convierte RGB a formato hexadecimal
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Calcula el brillo de un color (0-255)
 */
function getBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000
}

/**
 * Ajusta el brillo de un color
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent))
  return rgbToHex(r, g, b)
}

/**
 * Ajusta la saturación de un color
 */
function adjustSaturation(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16)
  const g = (num >> 8) & 0x00FF
  const b = num & 0x0000FF
  
  const gray = (r + g + b) / 3
  const newR = Math.min(255, Math.max(0, gray + (r - gray) * (1 + percent)))
  const newG = Math.min(255, Math.max(0, gray + (g - gray) * (1 + percent)))
  const newB = Math.min(255, Math.max(0, gray + (b - gray) * (1 + percent)))
  
  return rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB))
}

/**
 * Extrae colores dominantes de una imagen
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    img.onload = () => {
      try {
        // Crear canvas para analizar la imagen
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'))
          return
        }
        
        // Redimensionar para análisis más rápido
        const maxSize = 100
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Obtener datos de píxeles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        
        // Contar frecuencia de colores (agrupados)
        const colorMap = new Map<string, number>()
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const a = pixels[i + 3]
          
          // Ignorar píxeles transparentes y muy claros/oscuros
          if (a < 128) continue
          const brightness = getBrightness(r, g, b)
          if (brightness > 240 || brightness < 15) continue
          
          // Agrupar colores similares (reducir a 16 niveles por canal)
          const rGroup = Math.floor(r / 16) * 16
          const gGroup = Math.floor(g / 16) * 16
          const bGroup = Math.floor(b / 16) * 16
          
          const colorKey = `${rGroup},${gGroup},${bGroup}`
          colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
        }
        
        // Ordenar colores por frecuencia
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number)
            return { r, g, b, hex: rgbToHex(r, g, b) }
          })
        
        if (sortedColors.length === 0) {
          reject(new Error('No se pudieron extraer colores de la imagen'))
          return
        }
        
        // Seleccionar colores dominantes
        const primaryColor = sortedColors[0].hex
        const secondaryColor = sortedColors[Math.min(1, sortedColors.length - 1)].hex
        const accentColor = sortedColors[Math.min(2, sortedColors.length - 1)].hex
        
        // Generar paleta completa
        const palette: ColorPalette = {
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          accentColor: accentColor,
          backgroundColor: adjustBrightness(primaryColor, 60), // Más claro
          textColor: '#111827', // Texto oscuro por defecto
          headerColor: adjustBrightness(primaryColor, -20), // Más oscuro
          buttonColor: adjustSaturation(primaryColor, 0.2), // Más saturado
          linkColor: adjustBrightness(accentColor, -10)
        }
        
        resolve(palette)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
    }
    
    // Cargar imagen
    if (imageUrl.startsWith('data:')) {
      img.src = imageUrl
    } else {
      img.src = imageUrl
    }
  })
}

/**
 * Genera una paleta de colores complementaria
 */
export function generateComplementaryPalette(baseColor: string): Partial<ColorPalette> {
  return {
    primaryColor: baseColor,
    secondaryColor: adjustBrightness(baseColor, -30),
    accentColor: adjustSaturation(baseColor, 0.3),
    backgroundColor: adjustBrightness(baseColor, 80),
    buttonColor: adjustSaturation(baseColor, 0.2),
    linkColor: adjustBrightness(baseColor, -15)
  }
}
