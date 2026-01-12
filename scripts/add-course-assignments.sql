-- Script para agregar tablas de asignación de estudiantes y evaluaciones a cursos
-- Fecha: 2026-01-11

-- ====================
-- CREAR TABLAS PRIMERO
-- ====================

-- Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60,
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK(passing_score >= 0 AND passing_score <= 100),
  questions TEXT NOT NULL DEFAULT '[]',
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de matrículas (estudiantes asignados a cursos)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación curso-evaluación
CREATE TABLE IF NOT EXISTS course_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  evaluation_id INTEGER NOT NULL,
  order_num INTEGER DEFAULT 0,
  required INTEGER DEFAULT 1,
  available_from DATETIME,
  available_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de resultados de evaluaciones de estudiantes
CREATE TABLE IF NOT EXISTS student_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  evaluation_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  score INTEGER,
  answers TEXT,
  passed INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
