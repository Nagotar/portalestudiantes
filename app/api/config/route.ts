import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'
export const maxDuration = 60

// Caché en memoria del servidor (persiste entre requests)
let serverConfigCache: any = null
let serverCacheTimestamp: number = 0
const SERVER_CACHE_DURATION = 60 * 1000 // 1 minuto

// GET /api/config - Obtener configuración del sistema
export async function GET(request: NextRequest) {
  try {
    // Usar caché del servidor si es válido
    const now = Date.now()
    if (serverConfigCache && (now - serverCacheTimestamp < SERVER_CACHE_DURATION)) {
      return NextResponse.json({
        success: true,
        config: serverConfigCache,
        cached: true
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      })
    }

    const result = await db.execute('SELECT * FROM system_config LIMIT 1')
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró configuración del sistema' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    
    const config = {
      siteName: row.site_name,
      logo: row.logo,
      logoLight: row.logo_light,
      favicon: row.favicon,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      accentColor: row.accent_color,
      backgroundColor: row.background_color,
      textColor: row.text_color,
      headerColor: row.header_color,
      sidebarColor: row.sidebar_color,
      buttonColor: row.button_color,
      linkColor: row.link_color,
      whatsappNumber: row.whatsapp_number,
      whatsappMessage: row.whatsapp_message,
      whatsappEnabled: row.whatsapp_enabled === 1,
      companyName: row.company_name,
      companyDescription: row.company_description,
      companyEmail: row.company_email,
      companyPhone: row.company_phone,
      companyAddress: row.company_address,
      aboutTitle: row.about_title,
      aboutDescription: row.about_description,
      aboutMission: row.about_mission,
      aboutVision: row.about_vision,
      aboutHistory: row.about_history,
      aboutImage1: row.about_image1,
      aboutImage2: row.about_image2,
      aboutImage3: row.about_image3,
      footerText: row.footer_text,
      footerShowCompanyInfo: row.footer_show_company_info === 1,
      footerShowSocialMedia: row.footer_show_social_media === 1,
      footerFacebookUrl: row.footer_facebook_url,
      footerInstagramUrl: row.footer_instagram_url,
      footerTwitterUrl: row.footer_twitter_url,
      footerLinkedinUrl: row.footer_linkedin_url,
      footerYoutubeUrl: row.footer_youtube_url,
      footerLink1Text: row.footer_link1_text,
      footerLink1Url: row.footer_link1_url,
      footerLink2Text: row.footer_link2_text,
      footerLink2Url: row.footer_link2_url,
      footerLink3Text: row.footer_link3_text,
      footerLink3Url: row.footer_link3_url,
      footerLink4Text: row.footer_link4_text,
      footerLink4Url: row.footer_link4_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    // Guardar en caché del servidor
    serverConfigCache = config
    serverCacheTimestamp = Date.now()

    return NextResponse.json({
      success: true,
      config
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('Error obteniendo configuración:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PUT /api/config - Actualizar configuración del sistema (actualización parcial)
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere rol de administrador' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Limpiar caché del servidor antes de actualizar
    serverConfigCache = null
    serverCacheTimestamp = 0

    // Construir query dinámico solo con los campos enviados
    const updates: string[] = []
    const values: any[] = []

    // Mapeo de campos del body a columnas de la base de datos
    const fieldMapping: { [key: string]: string } = {
      siteName: 'site_name',
      logo: 'logo',
      logoLight: 'logo_light',
      favicon: 'favicon',
      primaryColor: 'primary_color',
      secondaryColor: 'secondary_color',
      accentColor: 'accent_color',
      backgroundColor: 'background_color',
      textColor: 'text_color',
      headerColor: 'header_color',
      sidebarColor: 'sidebar_color',
      buttonColor: 'button_color',
      linkColor: 'link_color',
      whatsappNumber: 'whatsapp_number',
      whatsappMessage: 'whatsapp_message',
      whatsappEnabled: 'whatsapp_enabled',
      companyName: 'company_name',
      companyDescription: 'company_description',
      companyEmail: 'company_email',
      companyPhone: 'company_phone',
      companyAddress: 'company_address',
      aboutTitle: 'about_title',
      aboutDescription: 'about_description',
      aboutMission: 'about_mission',
      aboutVision: 'about_vision',
      aboutHistory: 'about_history',
      aboutImage1: 'about_image1',
      aboutImage2: 'about_image2',
      aboutImage3: 'about_image3',
      footerText: 'footer_text',
      footerShowCompanyInfo: 'footer_show_company_info',
      footerShowSocialMedia: 'footer_show_social_media',
      footerFacebookUrl: 'footer_facebook_url',
      footerInstagramUrl: 'footer_instagram_url',
      footerTwitterUrl: 'footer_twitter_url',
      footerLinkedinUrl: 'footer_linkedin_url',
      footerYoutubeUrl: 'footer_youtube_url',
      footerLink1Text: 'footer_link1_text',
      footerLink1Url: 'footer_link1_url',
      footerLink2Text: 'footer_link2_text',
      footerLink2Url: 'footer_link2_url',
      footerLink3Text: 'footer_link3_text',
      footerLink3Url: 'footer_link3_url',
      footerLink4Text: 'footer_link4_text',
      footerLink4Url: 'footer_link4_url'
    }

    // Construir actualizaciones solo para campos presentes en el body
    for (const [bodyField, dbColumn] of Object.entries(fieldMapping)) {
      if (body.hasOwnProperty(bodyField)) {
        updates.push(`${dbColumn} = ?`)
        // Convertir booleanos a 0/1 para SQLite
        if (typeof body[bodyField] === 'boolean') {
          values.push(body[bodyField] ? 1 : 0)
        } else {
          values.push(body[bodyField])
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      )
    }

    // Agregar updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP')

    // Ejecutar actualización
    await db.execute({
      sql: `UPDATE system_config SET ${updates.join(', ')} WHERE id = 1`,
      args: values
    })

    // Obtener configuración actualizada
    const result = await db.execute('SELECT * FROM system_config WHERE id = 1')
    const row = result.rows[0]

    const config = {
      siteName: row.site_name,
      logo: row.logo,
      logoLight: row.logo_light,
      favicon: row.favicon,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      accentColor: row.accent_color,
      backgroundColor: row.background_color,
      textColor: row.text_color,
      headerColor: row.header_color,
      sidebarColor: row.sidebar_color,
      buttonColor: row.button_color,
      linkColor: row.link_color,
      whatsappNumber: row.whatsapp_number,
      whatsappMessage: row.whatsapp_message,
      whatsappEnabled: row.whatsapp_enabled === 1,
      companyName: row.company_name,
      companyDescription: row.company_description,
      companyEmail: row.company_email,
      companyPhone: row.company_phone,
      companyAddress: row.company_address,
      aboutTitle: row.about_title,
      aboutDescription: row.about_description,
      aboutMission: row.about_mission,
      aboutVision: row.about_vision,
      aboutHistory: row.about_history,
      aboutImage1: row.about_image1,
      aboutImage2: row.about_image2,
      aboutImage3: row.about_image3,
      footerText: row.footer_text,
      footerShowCompanyInfo: row.footer_show_company_info === 1,
      footerShowSocialMedia: row.footer_show_social_media === 1,
      footerFacebookUrl: row.footer_facebook_url,
      footerInstagramUrl: row.footer_instagram_url,
      footerTwitterUrl: row.footer_twitter_url,
      footerLinkedinUrl: row.footer_linkedin_url,
      footerYoutubeUrl: row.footer_youtube_url,
      footerLink1Text: row.footer_link1_text,
      footerLink1Url: row.footer_link1_url,
      footerLink2Text: row.footer_link2_text,
      footerLink2Url: row.footer_link2_url,
      footerLink3Text: row.footer_link3_text,
      footerLink3Url: row.footer_link3_url,
      footerLink4Text: row.footer_link4_text,
      footerLink4Url: row.footer_link4_url,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      config
    })

  } catch (error) {
    console.error('Error actualizando configuración:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
