import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/config/reset - Restaurar configuración por defecto
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere rol de administrador' },
        { status: 403 }
      )
    }

    // Restaurar valores por defecto
    await db.execute(`
      UPDATE system_config SET
        site_name = 'Portal Estudiante',
        logo = NULL,
        logo_light = NULL,
        favicon = NULL,
        primary_color = '#000000',
        secondary_color = '#6B7280',
        accent_color = '#3B82F6',
        background_color = '#F9FAFB',
        text_color = '#111827',
        header_color = '#FFFFFF',
        sidebar_color = '#1F2937',
        button_color = '#000000',
        link_color = '#3B82F6',
        whatsapp_number = '+56912345678',
        whatsapp_message = 'Hola, me gustaría obtener más información sobre los cursos disponibles.',
        whatsapp_enabled = 1,
        company_name = 'Centro de Capacitación ADAM',
        company_description = 'Formación en Maquinaria Pesada',
        company_email = 'contacto@adam.cl',
        company_phone = '+56 9 1234 5678',
        company_address = 'Santiago, Chile',
        about_title = 'Sobre Nosotros',
        about_description = 'Somos líderes en formación de operadores de maquinaria pesada con más de 15 años de experiencia en el sector.',
        about_mission = 'Formar operadores altamente calificados y certificados, brindando las mejores herramientas y conocimientos para su desarrollo profesional en la industria de la construcción y minería.',
        about_vision = 'Ser el centro de capacitación líder en Chile, reconocido por la excelencia en la formación de operadores de maquinaria pesada y por contribuir al desarrollo de la industria.',
        about_history = 'Fundado en 2010, nuestro centro ha capacitado a más de 5,000 operadores que hoy trabajan en las principales empresas del país. Contamos con instalaciones modernas, maquinaria de última generación y un equipo de instructores certificados con amplia experiencia en el campo.',
        about_image1 = NULL,
        about_image2 = NULL,
        about_image3 = NULL,
        footer_text = '© 2024 Centro de Capacitación ADAM. Todos los derechos reservados.',
        footer_show_company_info = 1,
        footer_show_social_media = 1,
        footer_facebook_url = NULL,
        footer_instagram_url = NULL,
        footer_twitter_url = NULL,
        footer_linkedin_url = NULL,
        footer_youtube_url = NULL,
        footer_link1_text = NULL,
        footer_link1_url = NULL,
        footer_link2_text = NULL,
        footer_link2_url = NULL,
        footer_link3_text = NULL,
        footer_link3_url = NULL,
        footer_link4_text = NULL,
        footer_link4_url = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `)

    // Obtener configuración restaurada
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
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración restaurada a valores por defecto',
      config
    })

  } catch (error) {
    console.error('Error restaurando configuración:', error)
    return NextResponse.json(
      { error: 'Error al restaurar configuración' },
      { status: 500 }
    )
  }
}
