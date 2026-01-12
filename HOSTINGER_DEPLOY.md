# Guía de Despliegue en Hostinger - Solución Definitiva

## Problema: Error 403 Forbidden

El error ocurre porque **las variables de entorno no se cargan correctamente** en Hostinger.

## Solución Paso a Paso

### 1. Configurar Variables de Entorno en Hostinger

**Variables que DEBES agregar:**

```
TURSO_DATABASE_URL=libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA
```

**⚠️ IMPORTANTE:**
- **NO agregues comillas** alrededor de los valores
- **NO agregues espacios** al inicio o final
- Usa exactamente estos nombres (case-sensitive)

### 2. **REBUILD Obligatorio**

**🚨 CRÍTICO:** Después de agregar las variables, **DEBES hacer un REBUILD completo**, no solo reiniciar.

En Hostinger:
1. Ve a tu aplicación Node.js
2. **NO solo reinicies** - esto NO carga las nuevas variables
3. Haz un **nuevo deploy** o **rebuild** completo
4. Espera a que termine el build (puede tomar 2-5 minutos)

### 3. Verificar en los Logs

Después del rebuild, revisa los logs de Hostinger. Deberías ver:

```
🔍 [DB-UTILS] Verificando variables de entorno...
TURSO_DATABASE_URL: ✅ Definida
TURSO_AUTH_TOKEN: ✅ Definido
```

**Si ves esto en los logs:**
```
TURSO_DATABASE_URL: ❌ UNDEFINED
TURSO_AUTH_TOKEN: ❌ UNDEFINED
```

Significa que las variables **NO se configuraron correctamente** en Hostinger.

### 4. Métodos para Configurar Variables en Hostinger

#### Método A: Panel de Control (Recomendado)

1. **Hosting → Administrar → Variables de Entorno**
2. Agregar cada variable:
   - Nombre: `TURSO_DATABASE_URL`
   - Valor: `libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io`
   - Click **"Agregar"**
   
   - Nombre: `TURSO_AUTH_TOKEN`
   - Valor: (el token completo sin comillas)
   - Click **"Agregar"**

3. **Guardar cambios**
4. **Hacer REBUILD** (no solo restart)

#### Método B: Archivo .env en el Servidor

Si el Método A no funciona:

1. Conéctate por **SSH** o **File Manager**
2. Ve a la carpeta raíz de tu aplicación
3. Crea el archivo `.env.production`:

```bash
TURSO_DATABASE_URL=libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA
```

4. Guarda el archivo
5. **Hacer REBUILD**

### 5. Checklist de Verificación

- [ ] Variables agregadas en Hostinger con nombres exactos
- [ ] Sin comillas, sin espacios extras
- [ ] **REBUILD completo realizado** (no solo restart)
- [ ] Esperado 2-5 minutos después del rebuild
- [ ] Revisado los logs del servidor
- [ ] Los logs muestran "✅ Definida" para ambas variables

### 6. Si Aún No Funciona

#### Opción 1: Verificar en los Logs

Busca en los logs de Hostinger el mensaje:
```
❌ ERROR CRÍTICO: Variables de entorno de Turso no configuradas
```

Si lo ves, las variables **definitivamente NO se están cargando**.

#### Opción 2: Contactar Soporte de Hostinger

Envía este mensaje al soporte:

```
Hola, tengo una aplicación Next.js desplegada y necesito configurar variables de entorno.

Ya las agregué en el panel de Variables de Entorno:
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN

Pero cuando reviso los logs, aparecen como "undefined".

He hecho rebuild completo varias veces pero no se cargan.

¿Pueden verificar que las variables de entorno se estén aplicando correctamente a mi aplicación?

Gracias.
```

#### Opción 3: Verificar Configuración de Next.js

Asegúrate de que en `next.config.js` NO haya configuraciones que bloqueen las variables de entorno.

### 7. Comandos para Probar Localmente

Antes de desplegar, prueba localmente:

```bash
# Probar conexión a Turso
npx tsx --env-file=.env.local scripts/test-turso-connection.ts

# Deberías ver:
# ✅ CONEXIÓN EXITOSA - Turso está funcionando correctamente
```

Si esto funciona localmente pero no en Hostinger, **el problema es 100% de configuración de variables de entorno en Hostinger**.

## Notas Importantes

1. **REBUILD vs RESTART:**
   - **RESTART:** Solo reinicia el servidor, NO carga nuevas variables
   - **REBUILD:** Reconstruye la app y carga las variables nuevas ✅

2. **Timing:**
   - Después del rebuild, espera 2-5 minutos
   - Las variables pueden tardar en propagarse

3. **Logs son tu mejor amigo:**
   - Siempre revisa los logs después del deploy
   - Busca los mensajes de "🔍 [DB-UTILS] Verificando variables de entorno..."

4. **Seguridad:**
   - Nunca compartas el `TURSO_AUTH_TOKEN` públicamente
   - Guarda una copia segura de tus credenciales

## Resultado Esperado

Después de seguir estos pasos correctamente, deberías ver en los logs:

```
🔍 [DB-UTILS] Verificando variables de entorno...
TURSO_DATABASE_URL: ✅ Definida
TURSO_AUTH_TOKEN: ✅ Definido
```

Y tu aplicación debería funcionar sin el error 403.
