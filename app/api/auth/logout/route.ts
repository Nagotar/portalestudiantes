import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  })

  // Eliminar cookie del token
  response.cookies.delete('token')

  return response
}
