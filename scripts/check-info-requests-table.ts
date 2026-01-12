import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA',
})

async function checkTable() {
  try {
    console.log('📋 Verificando estructura de info_requests...\n')
    
    const tableInfo = await client.execute('PRAGMA table_info(info_requests)')
    console.log('Columnas actuales:')
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type}`)
    })

    console.log('\n📊 Datos actuales:')
    const data = await client.execute('SELECT * FROM info_requests LIMIT 5')
    console.log(`Total de registros: ${data.rows.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.close()
  }
}

checkTable()
