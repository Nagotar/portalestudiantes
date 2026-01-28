import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getUserFromRequest } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { file, folder = 'banners', resourceType } = body

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo requerido' },
        { status: 400 }
      )
    }

    // Detectar tipo de recurso (image o raw para PDFs)
    const detectedResourceType = resourceType || (file.startsWith('data:application/pdf') ? 'raw' : 'image')
    
    // Configuración base para la subida
    const uploadConfig: any = {
      folder: `portalestudiante/${folder}`,
      resource_type: detectedResourceType,
    }

    // Solo agregar transformaciones para imágenes
    if (detectedResourceType === 'image') {
      uploadConfig.transformation = [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    }

    // Subir archivo a Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(file, uploadConfig)

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
      resourceType: uploadResponse.resource_type,
      bytes: uploadResponse.bytes
    })

  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error)
    return NextResponse.json(
      { error: 'Error al subir archivo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId requerido' },
        { status: 400 }
      )
    }

    // Eliminar imagen de Cloudinary
    await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada'
    })

  } catch (error) {
    console.error('Error eliminando de Cloudinary:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}
