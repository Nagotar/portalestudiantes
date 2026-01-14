import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-utils'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(request)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    console.log('Creando tabla password_reset_requests...')
    
    // Crear tabla
    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        resolved_at TEXT,
        resolved_by INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (resolved_by) REFERENCES users(id)
      )
    `)
    
    console.log('✅ Tabla password_reset_requests creada exitosamente')
    
    // Crear índice
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_status 
      ON password_reset_requests(status)
    `)
    
    console.log('✅ Índice creado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Tabla password_reset_requests creada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error creando tabla:', error)
    return NextResponse.json(
      { error: 'Error al crear tabla', details: String(error) },
      { status: 500 }
    )
  }
}
