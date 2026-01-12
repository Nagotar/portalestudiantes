import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== ENV TEST ===');
  console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
  console.log('TURSO_AUTH_TOKEN definido:', !!process.env.TURSO_AUTH_TOKEN);
  console.log('================');
  
  return NextResponse.json({
    success: true,
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'Definida ✅' : 'NO DEFINIDA ❌',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'Definido ✅' : 'NO DEFINIDO ❌',
    }
  });
}
