// Sistema simple de rate limiting en memoria
// Para producción, considera usar Redis o Upstash

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Limpiar entradas expiradas cada 10 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxAttempts: 5, windowMs: 15 * 60 * 1000 } // 5 intentos en 15 minutos
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Si no existe o expiró, crear nueva entrada
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime
    }
  }

  // Si ya alcanzó el límite
  if (entry.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  // Incrementar contador
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime
  }
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}
