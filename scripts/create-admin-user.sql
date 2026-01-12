-- Crear usuario admin en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Insertar usuario admin
INSERT INTO users (username, password, role, name, email, active)
VALUES (
  'admin@adam.cl',
  '$2b$10$xR9OUOjTr6jqHYkiG5iD5ecuDgSLrIONuPpAJV0G30jyIz3iTGjR2',  -- Contraseña: admin123
  'admin',
  'Administrador',
  'admin@adam.cl',
  true
)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  active = EXCLUDED.active;

-- Verificar que se creó
SELECT id, username, role, name, email, active, created_at 
FROM users 
WHERE username = 'admin@adam.cl';
