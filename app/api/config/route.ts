import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

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

// PUT /api/config - Actualizar configuración del sistema
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
    const {
      siteName,
      logo,
      logoLight,
      favicon,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      headerColor,
      sidebarColor,
      buttonColor,
      linkColor,
      whatsappNumber,
      whatsappMessage,
      whatsappEnabled,
      companyName,
      companyDescription,
      companyEmail,
      companyPhone,
      companyAddress,
      aboutTitle,
      aboutDescription,
      aboutMission,
      aboutVision,
      aboutHistory,
      aboutImage1,
      aboutImage2,
      aboutImage3,
      footerText,
      footerShowCompanyInfo,
      footerShowSocialMedia,
      footerFacebookUrl,
      footerInstagramUrl,
      footerTwitterUrl,
      footerLinkedinUrl,
      footerYoutubeUrl,
      footerLink1Text,
      footerLink1Url,
      footerLink2Text,
      footerLink2Url,
      footerLink3Text,
      footerLink3Url,
      footerLink4Text,
      footerLink4Url
    } = body

    // Limpiar caché del servidor antes de actualizar
    serverConfigCache = null
    serverCacheTimestamp = 0

    // Actualizar configuración
    await db.execute({
      sql: `
        UPDATE system_config SET
          site_name = ?,
          logo = ?,
          logo_light = ?,
          favicon = ?,
          primary_color = ?,
          secondary_color = ?,
          accent_color = ?,
          background_color = ?,
          text_color = ?,
          header_color = ?,
          sidebar_color = ?,
          button_color = ?,
          link_color = ?,
          whatsapp_number = ?,
          whatsapp_message = ?,
          whatsapp_enabled = ?,
          company_name = ?,
          company_description = ?,
          company_email = ?,
          company_phone = ?,
          company_address = ?,
          about_title = ?,
          about_description = ?,
          about_mission = ?,
          about_vision = ?,
          about_history = ?,
          about_image1 = ?,
          about_image2 = ?,
          about_image3 = ?,
          footer_text = ?,
          footer_show_company_info = ?,
          footer_show_social_media = ?,
          footer_facebook_url = ?,
          footer_instagram_url = ?,
          footer_twitter_url = ?,
          footer_linkedin_url = ?,
          footer_youtube_url = ?,
          footer_link1_text = ?,
          footer_link1_url = ?,
          footer_link2_text = ?,
          footer_link2_url = ?,
          footer_link3_text = ?,
          footer_link3_url = ?,
          footer_link4_text = ?,
          footer_link4_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `,
      args: [
        siteName,
        logo,
        logoLight,
        favicon,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        headerColor,
        sidebarColor,
        buttonColor,
        linkColor,
        whatsappNumber,
        whatsappMessage,
        whatsappEnabled ? 1 : 0,
        companyName,
        companyDescription,
        companyEmail,
        companyPhone,
        companyAddress,
        aboutTitle,
        aboutDescription,
        aboutMission,
        aboutVision,
        aboutHistory,
        aboutImage1,
        aboutImage2,
        aboutImage3,
        footerText,
        footerShowCompanyInfo ? 1 : 0,
        footerShowSocialMedia ? 1 : 0,
        footerFacebookUrl,
        footerInstagramUrl,
        footerTwitterUrl,
        footerLinkedinUrl,
        footerYoutubeUrl,
        footerLink1Text,
        footerLink1Url,
        footerLink2Text,
        footerLink2Url,
        footerLink3Text,
        footerLink3Url,
        footerLink4Text,
        footerLink4Url
      ]
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
