-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'estudiante')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  gradient TEXT NOT NULL,
  video_url TEXT NOT NULL,
  modules TEXT NOT NULL,
  benefits TEXT NOT NULL,
  image TEXT,
  featured INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de solicitudes de información
CREATE TABLE IF NOT EXISTS info_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  curso TEXT NOT NULL,
  mensaje TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de testimonios
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logos de empresas
CREATE TABLE IF NOT EXISTS company_logos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  order_num INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT DEFAULT 'Portal Estudiante',
  logo TEXT,
  logo_light TEXT,
  favicon TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#6B7280',
  accent_color TEXT DEFAULT '#3B82F6',
  background_color TEXT DEFAULT '#F9FAFB',
  text_color TEXT DEFAULT '#111827',
  header_color TEXT DEFAULT '#FFFFFF',
  sidebar_color TEXT DEFAULT '#1F2937',
  button_color TEXT DEFAULT '#000000',
  link_color TEXT DEFAULT '#3B82F6',
  whatsapp_number TEXT DEFAULT '+56912345678',
  whatsapp_message TEXT DEFAULT 'Hola, me gustaría obtener más información',
  whatsapp_enabled INTEGER DEFAULT 1,
  company_name TEXT DEFAULT 'Centro de Capacitación ADAM',
  company_description TEXT DEFAULT 'Formación en Maquinaria Pesada',
  company_email TEXT DEFAULT 'contacto@adam.cl',
  company_phone TEXT DEFAULT '+56 9 1234 5678',
  company_address TEXT DEFAULT 'Santiago, Chile',
  about_title TEXT DEFAULT 'Sobre Nosotros',
  about_description TEXT,
  about_mission TEXT,
  about_vision TEXT,
  about_history TEXT,
  about_image1 TEXT,
  about_image2 TEXT,
  about_image3 TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active);
CREATE INDEX IF NOT EXISTS idx_info_requests_status ON info_requests(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_company_logos_active ON company_logos(active);
