-- Migración completa del esquema de Turso a Supabase (PostgreSQL)
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. TABLA: users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
  name TEXT,
  email TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. TABLA: courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  full_description TEXT,
  duration TEXT,
  level TEXT,
  price DECIMAL(10,2),
  category TEXT,
  gradient TEXT,
  video_url TEXT,
  modules TEXT,
  requirements TEXT,
  benefits TEXT,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- 3. TABLA: videos
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT CHECK(type IN ('informativo', 'didactico')),
  duration TEXT,
  thumbnail TEXT,
  video_url TEXT,
  upload_date TEXT,
  views INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  curso_id INTEGER REFERENCES courses(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(active);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);
CREATE INDEX IF NOT EXISTS idx_videos_type ON videos(type);
CREATE INDEX IF NOT EXISTS idx_videos_curso_id ON videos(curso_id);

-- 4. TABLA: documents
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  file_size INTEGER,
  upload_date TEXT,
  downloads INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_active ON documents(active);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- 5. TABLA: banners
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  gradient TEXT,
  icon TEXT,
  image TEXT,
  use_image BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(active);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);

-- 6. TABLA: company_logos
CREATE TABLE IF NOT EXISTS company_logos (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_company_logos_active ON company_logos(active);
CREATE INDEX IF NOT EXISTS idx_company_logos_display_order ON company_logos(display_order);

-- 7. TABLA: evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  passing_score INTEGER,
  active BOOLEAN DEFAULT true,
  curso_id INTEGER REFERENCES courses(id),
  tipo_evaluacion TEXT DEFAULT 'practica' CHECK(tipo_evaluacion IN ('practica', 'final')),
  fecha_habilitacion TIMESTAMP,
  fecha_cierre TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evaluations_active ON evaluations(active);
CREATE INDEX IF NOT EXISTS idx_evaluations_curso_id ON evaluations(curso_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_tipo ON evaluations(tipo_evaluacion);
CREATE INDEX IF NOT EXISTS idx_evaluations_fecha_habilitacion ON evaluations(fecha_habilitacion);

-- 8. TABLA: questions
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK(question_type IN ('multiple', 'true_false', 'open')),
  options TEXT,
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_evaluation_id ON questions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_questions_display_order ON questions(display_order);

-- 9. TABLA: info_requests
CREATE TABLE IF NOT EXISTS info_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  curso TEXT NOT NULL,
  mensaje TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_info_requests_status ON info_requests(status);
CREATE INDEX IF NOT EXISTS idx_info_requests_email ON info_requests(email);
CREATE INDEX IF NOT EXISTS idx_info_requests_created_at ON info_requests(created_at);

-- 10. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para info_requests
CREATE TRIGGER update_info_requests_updated_at 
  BEFORE UPDATE ON info_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario admin por defecto
INSERT INTO users (username, password, role, name, email, active)
VALUES ('admin', '$2a$10$rGHvX8qF8YvZ5yJ5xK5xKOxK5xK5xK5xK5xK5xK5xK5xK5xK5xK5x', 'admin', 'Administrador', 'admin@adamcapacitacion.cl', true)
ON CONFLICT (username) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Migración de esquema completada exitosamente' AS status;
