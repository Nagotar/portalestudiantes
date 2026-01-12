import { NextRequest, NextResponse } from 'next/server'
import { db, executeWithRetry } from '@/lib/db-utils'

// POST /api/videos/[id]/view - Incrementar contador de vistas
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await executeWithRetry(async () => {
      return await db.execute({
        sql: 'UPDATE videos SET views = views + 1 WHERE id = ?',
        args: [id]
      })
    })

    return NextResponse.json({
      message: 'Vista registrada'
    })
  } catch (error: any) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { error: 'Error al registrar vista' },
      { status: 500 }
    )
  }
}
