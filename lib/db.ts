import { createClient } from '@libsql/client';

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Función helper para ejecutar queries
export async function executeQuery(query: string, params?: any[]) {
  try {
    const result = await turso.execute({
      sql: query,
      args: params || [],
    });
    return result;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
}

// Función para inicializar tablas (ejemplo)
export async function initDatabase() {
  try {
    // Ejemplo de tabla de usuarios
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT DEFAULT 'estudiante',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    throw error;
  }
}
