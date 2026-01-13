import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Contar visitas totales (últimos 30 días)
    const visitsResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM visits WHERE created_at >= datetime('now', '-30 days')`,
      args: []
    })
    const totalVisits = Number(visitsResult.rows[0]?.total || 0)

    // Contar visitas del mes anterior para calcular cambio
    const previousVisitsResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM visits 
            WHERE created_at >= datetime('now', '-60 days') 
            AND created_at < datetime('now', '-30 days')`,
      args: []
    })
    const previousVisits = Number(previousVisitsResult.rows[0]?.total || 1)
    const visitsChange = previousVisits > 0 
      ? ((totalVisits - previousVisits) / previousVisits * 100).toFixed(1)
      : '0.0'

    // Contar solicitudes de información (últimos 30 días)
    const requestsResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM info_requests WHERE created_at >= datetime('now', '-30 days')`,
      args: []
    })
    const totalRequests = Number(requestsResult.rows[0]?.total || 0)

    // Solicitudes del mes anterior
    const previousRequestsResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM info_requests 
            WHERE created_at >= datetime('now', '-60 days') 
            AND created_at < datetime('now', '-30 days')`,
      args: []
    })
    const previousRequests = Number(previousRequestsResult.rows[0]?.total || 1)
    const requestsChange = previousRequests > 0
      ? ((totalRequests - previousRequests) / previousRequests * 100).toFixed(1)
      : '0.0'

    // Contar banners activos
    const bannersResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM banners WHERE active = 1`,
      args: []
    })
    const activeBanners = Number(bannersResult.rows[0]?.total || 0)

    // Calcular tasa de conversión (solicitudes / visitas * 100)
    const conversionRate = totalVisits > 0
      ? ((totalRequests / totalVisits) * 100).toFixed(1)
      : '0.0'

    // Tasa de conversión del mes anterior
    const previousConversionRate = previousVisits > 0
      ? ((previousRequests / previousVisits) * 100)
      : 0
    const currentConversionRate = parseFloat(conversionRate)
    const conversionChange = (currentConversionRate - previousConversionRate).toFixed(1)

    return NextResponse.json({
      success: true,
      stats: {
        visits: {
          total: totalVisits,
          change: `${visitsChange}%`,
          trend: parseFloat(visitsChange) >= 0 ? 'up' : 'down'
        },
        requests: {
          total: totalRequests,
          change: `${requestsChange}%`,
          trend: parseFloat(requestsChange) >= 0 ? 'up' : 'down'
        },
        banners: {
          total: activeBanners,
          change: '0%',
          trend: 'neutral'
        },
        conversion: {
          rate: `${conversionRate}%`,
          change: `${conversionChange}%`,
          trend: parseFloat(conversionChange) >= 0 ? 'up' : 'down'
        }
      }
    })

  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener estadísticas',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
