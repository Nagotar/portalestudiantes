import { createClient } from '@libsql/client'
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'fs'
import * as path from 'path'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dnasabzs2',
  api_key: '783873333965672',
  api_secret: 'aVrf1nqdmvsbnacGpvcB7i2wlpo'
})

// Configurar base de datos
const db = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyNDYyMjAsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.mAItLY2fa8sY_axrngYz5SAhXVbe6170VyRyV5du94whSrv708gJBvcQ991f4b1p-COIDzcZKlikla-qy016CQ'
})

const imagesDir = path.join(process.cwd(), 'downloaded-images')

interface UploadResult {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

async function uploadToCloudinary(filePath: string, folder: string): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `portalestudiante/${folder}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function migrateImages() {
  try {
    console.log('🚀 Iniciando migración de imágenes a Cloudinary...\n')

    let totalMigrated = 0
    let totalErrors = 0

    // 1. MIGRAR BANNERS
    console.log('🎨 Migrando banners...')
    const bannersDir = path.join(imagesDir, 'banners')
    
    if (fs.existsSync(bannersDir)) {
      const bannerFiles = fs.readdirSync(bannersDir)
      
      for (const file of bannerFiles) {
        const filePath = path.join(bannersDir, file)
        const bannerId = file.match(/banner_(\d+)_/)?.[1]
        
        if (!bannerId) continue

        console.log(`  📤 Subiendo ${file}...`)
        const upload = await uploadToCloudinary(filePath, 'banners')

        if (upload.success && upload.url && upload.publicId) {
          // Actualizar en la base de datos
          await db.execute({
            sql: `UPDATE banners 
                  SET image = ?, 
                      cloudinary_public_id = ?,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`,
            args: [upload.url, upload.publicId, parseInt(bannerId)]
          })
          
          console.log(`  ✅ Banner ${bannerId} migrado exitosamente`)
          console.log(`     URL: ${upload.url}`)
          totalMigrated++
        } else {
          console.log(`  ❌ Error: ${upload.error}`)
          totalErrors++
        }
      }
    }

    // 2. MIGRAR LOGOS DE EMPRESAS
    console.log('\n🏢 Migrando logos de empresas...')
    const logosDir = path.join(imagesDir, 'logos')
    
    if (fs.existsSync(logosDir)) {
      const logoFiles = fs.readdirSync(logosDir)
      
      for (const file of logoFiles) {
        const filePath = path.join(logosDir, file)
        const companyId = file.match(/company_(\d+)_/)?.[1]
        
        if (!companyId) continue

        console.log(`  📤 Subiendo ${file}...`)
        const upload = await uploadToCloudinary(filePath, 'logos')

        if (upload.success && upload.url && upload.publicId) {
          // Actualizar en la base de datos
          await db.execute({
            sql: `UPDATE company_logos 
                  SET logo = ?, 
                      cloudinary_public_id = ?,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`,
            args: [upload.url, upload.publicId, parseInt(companyId)]
          })
          
          console.log(`  ✅ Logo ${companyId} migrado exitosamente`)
          totalMigrated++
        } else {
          console.log(`  ❌ Error: ${upload.error}`)
          totalErrors++
        }
      }
    }

    // 3. MIGRAR IMÁGENES DE CURSOS
    console.log('\n📚 Migrando imágenes de cursos...')
    const coursesDir = path.join(imagesDir, 'courses')
    
    if (fs.existsSync(coursesDir)) {
      const courseFiles = fs.readdirSync(coursesDir)
      
      for (const file of courseFiles) {
        const filePath = path.join(coursesDir, file)
        const courseId = file.match(/course_(\d+)_/)?.[1]
        
        if (!courseId) continue

        console.log(`  📤 Subiendo ${file}...`)
        const upload = await uploadToCloudinary(filePath, 'courses')

        if (upload.success && upload.url) {
          // Actualizar en la base de datos
          await db.execute({
            sql: `UPDATE courses 
                  SET image = ?,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`,
            args: [upload.url, parseInt(courseId)]
          })
          
          console.log(`  ✅ Curso ${courseId} migrado exitosamente`)
          totalMigrated++
        } else {
          console.log(`  ❌ Error: ${upload.error}`)
          totalErrors++
        }
      }
    }

    // 4. MIGRAR THUMBNAILS DE VIDEOS
    console.log('\n🎥 Migrando thumbnails de videos...')
    const videosDir = path.join(imagesDir, 'videos')
    
    if (fs.existsSync(videosDir)) {
      const videoFiles = fs.readdirSync(videosDir)
      
      for (const file of videoFiles) {
        const filePath = path.join(videosDir, file)
        const videoId = file.match(/video_(\d+)_/)?.[1]
        
        if (!videoId) continue

        console.log(`  📤 Subiendo ${file}...`)
        const upload = await uploadToCloudinary(filePath, 'videos')

        if (upload.success && upload.url) {
          // Actualizar en la base de datos
          await db.execute({
            sql: `UPDATE videos 
                  SET thumbnail = ?,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`,
            args: [upload.url, parseInt(videoId)]
          })
          
          console.log(`  ✅ Video ${videoId} migrado exitosamente`)
          totalMigrated++
        } else {
          console.log(`  ❌ Error: ${upload.error}`)
          totalErrors++
        }
      }
    }

    // RESUMEN FINAL
    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('='.repeat(70))
    console.log(`✅ Imágenes migradas exitosamente: ${totalMigrated}`)
    console.log(`❌ Errores: ${totalErrors}`)
    console.log(`📁 Todas las URLs ahora apuntan a Cloudinary`)
    console.log(`🌐 CDN global activado automáticamente`)
    console.log(`⚡ Optimización automática (WebP/AVIF) habilitada`)
    console.log('='.repeat(70))
    
    if (totalMigrated > 0) {
      console.log('\n💡 Próximos pasos:')
      console.log('   1. Verifica que las imágenes se vean correctamente en el sitio')
      console.log('   2. Puedes eliminar la carpeta "downloaded-images" si todo funciona')
      console.log('   3. Las nuevas imágenes se subirán directamente a Cloudinary')
    }

  } catch (error) {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  }
}

migrateImages()
