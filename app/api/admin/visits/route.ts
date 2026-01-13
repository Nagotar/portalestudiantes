import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    let sql = ''
    let groupFormat = ''
    
    switch (period) {
      case '7d':
        // Últimos 7 días - generar todos los días incluso sin visitas
        sql = `
          WITH RECURSIVE dates(date) AS (
            SELECT date('now', '-6 days')
            UNION ALL
            SELECT date(date, '+1 day')
            FROM dates
            WHERE date < date('now')
          )
          SELECT 
            CASE CAST(strftime('%w', dates.date) AS INTEGER)
              WHEN 0 THEN 'Dom'
              WHEN 1 THEN 'Lun'
              WHEN 2 THEN 'Mar'
              WHEN 3 THEN 'Mié'
              WHEN 4 THEN 'Jue'
              WHEN 5 THEN 'Vie'
              WHEN 6 THEN 'Sáb'
            END as day,
            COALESCE(COUNT(visits.id), 0) as visits
          FROM dates
          LEFT JOIN visits ON date(visits.created_at) = dates.date
          GROUP BY dates.date
          ORDER BY dates.date ASC
        `
        break
        
      case '30d':
        // Últimas 4 semanas
        sql = `
          WITH RECURSIVE weeks(week_num, week_start, week_end) AS (
            SELECT 1, date('now', '-28 days'), date('now', '-22 days')
            UNION ALL
            SELECT week_num + 1, date(week_end, '+1 day'), date(week_end, '+7 days')
            FROM weeks
            WHERE week_num < 4
          )
          SELECT 
            'Sem ' || week_num as day,
            COALESCE(COUNT(visits.id), 0) as visits
          FROM weeks
          LEFT JOIN visits ON date(visits.created_at) BETWEEN weeks.week_start AND weeks.week_end
          GROUP BY week_num
          ORDER BY week_num ASC
        `
        break
        
      case '90d':
        // Últimos 3 meses
        sql = `
          WITH months AS (
            SELECT 1 as month_num, 'Mes 1' as month_name, date('now', '-90 days') as start_date, date('now', '-61 days') as end_date
            UNION ALL
            SELECT 2, 'Mes 2', date('now', '-60 days'), date('now', '-31 days')
            UNION ALL
            SELECT 3, 'Mes 3', date('now', '-30 days'), date('now')
          )
          SELECT 
            month_name as day,
            COALESCE(COUNT(visits.id), 0) as visits
          FROM months
          LEFT JOIN visits ON date(visits.created_at) BETWEEN months.start_date AND months.end_date
          GROUP BY month_num, month_name
          ORDER BY month_num ASC
        `
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Período inválido' },
          { status: 400 }
        )
    }

    const result = await turso.execute({ sql, args: [] })
    
    const data = result.rows.map((row: any) => ({
      day: row.day,
      visits: Number(row.visits)
    }))

    return NextResponse.json({
      success: true,
      period,
      data
    })

  } catch (error: any) {
    console.error('Error obteniendo datos de visitas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos de visitas',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
