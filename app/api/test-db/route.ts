import { NextResponse } from 'next/server';
import { turso } from '@/lib/db';

export async function GET() {
  try {
    // Test de conexión a la base de datos
    const result = await turso.execute('SELECT 1 as test');
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a Turso exitosa',
      data: result.rows
    });
  } catch (error) {
    console.error('Error conectando a Turso:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error conectando a la base de datos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
