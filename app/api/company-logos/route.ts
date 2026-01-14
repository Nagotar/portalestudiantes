import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

// Configuración para aumentar el límite de tamaño del body
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// GET - Listar todos los logos de empresas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let sql = 'SELECT * FROM company_logos'
    
    if (activeOnly) {
      sql += ' WHERE active = 1'
    }
    
    sql += ' ORDER BY display_order ASC, created_at DESC'

    const result = await db.execute(sql)

    const logos = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      logo: row.logo,
      active: row.active === 1,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return NextResponse.json({
      success: true,
      logos
    })

  } catch (error) {
    console.error('Error obteniendo logos:', error)
    return NextResponse.json(
      { error: 'Error al obtener logos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo logo (solo admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol de admin
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden crear logos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      logo,
      active,
      displayOrder
    } = body

    // Validar campos requeridos
    if (!name || !logo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, logo' },
        { status: 400 }
      )
    }

    // Insertar logo en la base de datos
    const result = await db.execute({
      sql: `INSERT INTO company_logos (name, logo, active, display_order)
            VALUES (?, ?, ?, ?)`,
      args: [
        name,
        logo,
        active !== false ? 1 : 0,
        displayOrder || 0
      ]
    })

    // Obtener el logo recién creado
    const logoId = Number(result.lastInsertRowid)
    const newLogo = await db.execute({
      sql: 'SELECT * FROM company_logos WHERE id = ?',
      args: [logoId]
    })

    const logoRow = newLogo.rows[0]

    return NextResponse.json({
      success: true,
      logo: {
        id: logoRow.id,
        name: logoRow.name,
        logo: logoRow.logo,
        active: logoRow.active === 1,
        displayOrder: logoRow.display_order,
        createdAt: logoRow.created_at,
        updatedAt: logoRow.updated_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando logo:', error)
    return NextResponse.json(
      { error: 'Error al crear logo' },
      { status: 500 }
    )
  }
}
