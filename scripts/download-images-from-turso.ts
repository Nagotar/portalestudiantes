import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyNDYyMjAsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.mAItLY2fa8sY_axrngYz5SAhXVbe6170VyRyV5du94whSrv708gJBvcQ991f4b1p-COIDzcZKlikla-qy016CQ'
})

// Crear carpetas si no existen
const outputDir = path.join(process.cwd(), 'downloaded-images')
const bannersDir = path.join(outputDir, 'banners')
const coursesDir = path.join(outputDir, 'courses')
const logosDir = path.join(outputDir, 'logos')
const configDir = path.join(outputDir, 'config')
const videosDir = path.join(outputDir, 'videos')

function ensureDirectories() {
  [outputDir, bannersDir, coursesDir, logosDir, configDir, videosDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

function base64ToFile(base64String: string, filePath: string) {
  // Extraer el tipo de imagen y los datos
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) {
    console.warn(`⚠️  Formato Base64 inválido para ${filePath}`)
    return false
  }

  const extension = matches[1]
  const data = matches[2]
  
  // Agregar extensión al archivo
  const fullPath = `${filePath}.${extension}`
  
  // Convertir Base64 a buffer y guardar
  const buffer = Buffer.from(data, 'base64')
  fs.writeFileSync(fullPath, buffer)
  
  return fullPath
}

async function downloadImages() {
  try {
    console.log('📦 Descargando imágenes de Turso...\n')
    ensureDirectories()

    let totalImages = 0
    let totalSize = 0

    // 1. Descargar imágenes de BANNERS
    console.log('🎨 Descargando banners...')
    const banners = await db.execute('SELECT id, title, image FROM banners WHERE image IS NOT NULL AND image != ""')
    
    for (const banner of banners.rows) {
      if (banner.image && typeof banner.image === 'string' && banner.image.startsWith('data:image')) {
        const fileName = `banner_${banner.id}_${(banner.title as string).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
        const filePath = path.join(bannersDir, fileName)
        const savedPath = base64ToFile(banner.image as string, filePath)
        
        if (savedPath) {
          const stats = fs.statSync(savedPath)
          totalSize += stats.size
          totalImages++
          console.log(`  ✅ ${path.basename(savedPath)} (${(stats.size / 1024).toFixed(2)} KB)`)
        }
      }
    }

    // 2. Descargar logos de COMPANY_LOGOS
    console.log('\n🏢 Descargando logos de empresas...')
    const companyLogos = await db.execute('SELECT id, name, logo FROM company_logos WHERE logo IS NOT NULL AND logo != ""')
    
    for (const company of companyLogos.rows) {
      if (company.logo && typeof company.logo === 'string' && company.logo.startsWith('data:image')) {
        const fileName = `company_${company.id}_${(company.name as string).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
        const filePath = path.join(logosDir, fileName)
        const savedPath = base64ToFile(company.logo as string, filePath)
        
        if (savedPath) {
          const stats = fs.statSync(savedPath)
          totalSize += stats.size
          totalImages++
          console.log(`  ✅ ${path.basename(savedPath)} (${(stats.size / 1024).toFixed(2)} KB)`)
        }
      }
    }

    // 3. Descargar imágenes de COURSES
    console.log('\n📚 Descargando imágenes de cursos...')
    const courses = await db.execute('SELECT id, name, image FROM courses WHERE image IS NOT NULL AND image != ""')
    
    for (const course of courses.rows) {
      if (course.image && typeof course.image === 'string' && course.image.startsWith('data:image')) {
        const fileName = `course_${course.id}_${(course.name as string).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
        const filePath = path.join(coursesDir, fileName)
        const savedPath = base64ToFile(course.image as string, filePath)
        
        if (savedPath) {
          const stats = fs.statSync(savedPath)
          totalSize += stats.size
          totalImages++
          console.log(`  ✅ ${path.basename(savedPath)} (${(stats.size / 1024).toFixed(2)} KB)`)
        }
      }
    }

    // 4. Descargar thumbnails de VIDEOS
    console.log('\n🎥 Descargando thumbnails de videos...')
    const videos = await db.execute('SELECT id, title, thumbnail FROM videos WHERE thumbnail IS NOT NULL AND thumbnail != ""')
    
    for (const video of videos.rows) {
      if (video.thumbnail && typeof video.thumbnail === 'string' && video.thumbnail.startsWith('data:image')) {
        const fileName = `video_${video.id}_${(video.title as string).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
        const filePath = path.join(videosDir, fileName)
        const savedPath = base64ToFile(video.thumbnail as string, filePath)
        
        if (savedPath) {
          const stats = fs.statSync(savedPath)
          totalSize += stats.size
          totalImages++
          console.log(`  ✅ ${path.basename(savedPath)} (${(stats.size / 1024).toFixed(2)} KB)`)
        }
      }
    }

    // 5. Descargar imágenes de CONFIGURACIÓN (omitido - tabla no existe)
    console.log('\n⚙️  Imágenes de configuración: tabla no encontrada (omitido)')

    // Resumen
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE DESCARGA')
    console.log('='.repeat(60))
    console.log(`✅ Total de imágenes descargadas: ${totalImages}`)
    console.log(`💾 Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📁 Ubicación: ${outputDir}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error descargando imágenes:', error)
    process.exit(1)
  }
}

downloadImages()
