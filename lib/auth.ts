import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion'
)

export interface UserPayload {
  id: number
  email: string
  name: string
  role: string
}

export async function signToken(payload: UserPayload): Promise<string> {
  return await new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const verified = await jwtVerify(token, secret)
    const payload = verified.payload
    
    // Validar que el payload tenga los campos necesarios
    if (
      typeof payload.id === 'number' &&
      typeof payload.email === 'string' &&
      typeof payload.name === 'string' &&
      typeof payload.role === 'string'
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

export async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value
  return token || null
}

export async function getUserFromRequest(request: NextRequest): Promise<UserPayload | null> {
  const token = await getTokenFromRequest(request)
  if (!token) return null
  return await verifyToken(token)
}

export async function getUserFromCookies(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return await verifyToken(token)
}

export function isAdmin(user: UserPayload | null): boolean {
  return user?.role === 'admin'
}

export function isEstudiante(user: UserPayload | null): boolean {
  return user?.role === 'estudiante'
}
