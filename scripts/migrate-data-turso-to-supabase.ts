import { createClient as createTursoClient } from '@libsql/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente Turso (origen)
const turso = createTursoClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

// Cliente Supabase (destino)
const supabase = createSupabaseClient(
  'https://bnhtgfbvlrvmyggketpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuaHRnZmJ2bHJ2bXlnZ2tldHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDg4MjEsImV4cCI6MjA1MjAyNDgyMX0.sb_secret_AfqGgs2UaTgp9gjWLrG73A_Mgn906DH'
)

async function migrarTabla(tabla: string, mapeoColumnas?: Record<string, string>) {
  try {
    console.log(`\n📦 Migrando tabla: ${tabla}`)
    
    // Obtener datos de Turso
    const result = await turso.execute(`SELECT * FROM ${tabla}`)
    
    if (result.rows.length === 0) {
      console.log(`⚠️  Tabla ${tabla} está vacía, saltando...`)
      return
    }
    
    console.log(`   Encontrados ${result.rows.length} registros`)
    
    // Mapear datos si es necesario
    const datos = result.rows.map(row => {
      const mapped: any = {}
      for (const [key, value] of Object.entries(row)) {
        const newKey = mapeoColumnas?.[key as string] || key
        mapped[newKey] = value
      }
      return mapped
    })
    
    // Insertar en Supabase
    const { error } = await supabase
      .from(tabla)
      .insert(datos)
    
    if (error) {
      console.error(`❌ Error en ${tabla}:`, error.message)
    } else {
      console.log(`✅ ${tabla}: ${result.rows.length} registros migrados`)
    }
  } catch (error: any) {
    console.error(`❌ Error migrando ${tabla}:`, error.message)
  }
}

async function migrarDatos() {
  console.log('🚀 Iniciando migración de datos de Turso a Supabase...\n')
  
  try {
    // Migrar tablas en orden (respetando foreign keys)
    await migrarTabla('users')
    await migrarTabla('courses')
    await migrarTabla('videos')
    await migrarTabla('documents')
    await migrarTabla('banners')
    await migrarTabla('company_logos')
    await migrarTabla('evaluations')
    await migrarTabla('questions')
    
    // Tabla info_requests con mapeo de columnas
    await migrarTabla('info_requests', {
      'nombre': 'name',
      'telefono': 'phone'
    })
    
    console.log('\n✅ Migración completada exitosamente!')
    console.log('💡 Verifica los datos en el Table Editor de Supabase')
    
  } catch (error) {
    console.error('\n❌ Error en la migración:', error)
  }
}

migrarDatos()
