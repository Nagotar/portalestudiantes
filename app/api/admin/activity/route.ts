import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Obtener actividades recientes del log
    const result = await turso.execute({
      sql: `
        SELECT 
          id,
          action,
          entity_type,
          entity_id,
          user_id,
          created_at
        FROM activity_log
        ORDER BY created_at DESC
        LIMIT ?
      `,
      args: [limit]
    })

    const activities = result.rows.map((row: any) => {
      const createdAt = new Date(row.created_at)
      const now = new Date()
      const diffMs = now.getTime() - createdAt.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let timeAgo = ''
      if (diffMins < 60) {
        timeAgo = `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`
      } else if (diffHours < 24) {
        timeAgo = `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
      } else {
        timeAgo = `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`
      }

      // Determinar color según el tipo de acción
      let color = 'gray'
      if (row.action.includes('crear') || row.action.includes('nuevo')) {
        color = 'green'
      } else if (row.action.includes('actualizar') || row.action.includes('modificar')) {
        color = 'blue'
      } else if (row.action.includes('eliminar')) {
        color = 'red'
      } else if (row.action.includes('solicitud')) {
        color = 'purple'
      }

      return {
        id: row.id,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        userId: row.user_id,
        timeAgo,
        color,
        timestamp: row.created_at
      }
    })

    return NextResponse.json({
      success: true,
      activities
    })

  } catch (error: any) {
    console.error('Error obteniendo actividad reciente:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener actividad reciente',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// POST - Registrar nueva actividad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, entityType, entityId, userId } = body

    if (!action || !entityType) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const result = await turso.execute({
      sql: `
        INSERT INTO activity_log (action, entity_type, entity_id, user_id, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `,
      args: [action, entityType, entityId || null, userId || null]
    })

    return NextResponse.json({
      success: true,
      activityId: result.lastInsertRowid
    })

  } catch (error: any) {
    console.error('Error registrando actividad:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al registrar actividad',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
