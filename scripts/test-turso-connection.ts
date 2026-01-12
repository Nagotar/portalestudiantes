import { createClient } from '@libsql/client';

async function testTursoConnection() {
  console.log('🔍 Probando conexión a Turso...\n');
  
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  
  console.log('📋 Configuración:');
  console.log('URL:', url ? '✅ Definida' : '❌ No definida');
  console.log('Token:', token ? '✅ Definido' : '❌ No definido');
  console.log('URL completa:', url);
  console.log('\n');
  
  if (!url || !token) {
    console.error('❌ ERROR: Variables de entorno no configuradas');
    process.exit(1);
  }
  
  try {
    console.log('🔌 Intentando conectar...');
    const client = createClient({
      url: url,
      authToken: token,
    });
    
    console.log('✅ Cliente creado exitosamente');
    
    console.log('📊 Ejecutando query de prueba...');
    const result = await client.execute('SELECT 1 as test');
    
    console.log('✅ Query ejecutada exitosamente');
    console.log('Resultado:', result.rows);
    
    console.log('\n🎉 CONEXIÓN EXITOSA - Turso está funcionando correctamente');
    
    // Probar listar tablas
    console.log('\n📋 Listando tablas...');
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    
    console.log('Tablas encontradas:');
    tables.rows.forEach((row: any) => {
      console.log('  -', row.name);
    });
    
  } catch (error: any) {
    console.error('\n❌ ERROR DE CONEXIÓN:');
    console.error('Tipo:', error.constructor.name);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'URL_INVALID') {
      console.error('\n💡 La URL de la base de datos es inválida o está undefined');
      console.error('Verifica que TURSO_DATABASE_URL esté correctamente configurada');
    } else if (error.code === 'UNAUTHORIZED' || error.message.includes('403')) {
      console.error('\n💡 Token de autenticación inválido o expirado');
      console.error('Necesitas generar un nuevo token en: https://turso.tech/');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('\n💡 No se puede alcanzar el servidor de Turso');
      console.error('Verifica tu conexión a internet o si Turso está caído');
    }
    
    process.exit(1);
  }
}

testTursoConnection();
