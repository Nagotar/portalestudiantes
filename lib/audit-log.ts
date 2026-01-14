// Sistema de auditoría para registrar eventos importantes
// En producción, considera guardar estos logs en una base de datos

export interface AuditLogEntry {
  timestamp: Date
  userId?: number
  userEmail?: string
  action: string
  resource: string
  details?: Record<string, any>
  ip?: string
  userAgent?: string
  success: boolean
}

// En memoria para desarrollo, en producción usar base de datos
const auditLogs: AuditLogEntry[] = []
const MAX_LOGS_IN_MEMORY = 1000

export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date()
  }

  // Agregar al array en memoria
  auditLogs.push(logEntry)

  // Mantener solo los últimos MAX_LOGS_IN_MEMORY
  if (auditLogs.length > MAX_LOGS_IN_MEMORY) {
    auditLogs.shift()
  }

  // Log en consola para desarrollo
  console.log('[AUDIT]', JSON.stringify(logEntry))

  // TODO: En producción, guardar en base de datos
  // await db.execute({
  //   sql: 'INSERT INTO audit_logs (user_id, action, resource, details, ip, success) VALUES (?, ?, ?, ?, ?, ?)',
  //   args: [entry.userId, entry.action, entry.resource, JSON.stringify(entry.details), entry.ip, entry.success]
  // })
}

export function getRecentLogs(limit: number = 100): AuditLogEntry[] {
  return auditLogs.slice(-limit).reverse()
}

export function getLogsByUser(userId: number, limit: number = 50): AuditLogEntry[] {
  return auditLogs
    .filter(log => log.userId === userId)
    .slice(-limit)
    .reverse()
}

export function getLogsByAction(action: string, limit: number = 50): AuditLogEntry[] {
  return auditLogs
    .filter(log => log.action === action)
    .slice(-limit)
    .reverse()
}

// Tipos de acciones para auditoría
export const AuditActions = {
  // Autenticación
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  
  // Usuarios
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  
  // Cursos
  COURSE_CREATED: 'course_created',
  COURSE_UPDATED: 'course_updated',
  COURSE_DELETED: 'course_deleted',
  
  // Videos
  VIDEO_CREATED: 'video_created',
  VIDEO_UPDATED: 'video_updated',
  VIDEO_DELETED: 'video_deleted',
  
  // Configuración
  CONFIG_UPDATED: 'config_updated',
  
  // Acceso
  ADMIN_ACCESS: 'admin_access',
  UNAUTHORIZED_ACCESS: 'unauthorized_access'
} as const
