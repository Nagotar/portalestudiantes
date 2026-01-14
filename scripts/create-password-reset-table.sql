-- Crear tabla para solicitudes de recuperación de contraseña
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
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_password_reset_status 
ON password_reset_requests(status);

-- Verificar que la tabla se creó
SELECT name FROM sqlite_master WHERE type='table' AND name='password_reset_requests';
