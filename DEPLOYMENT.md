# Guía de Despliegue en Hostinger

## Error 403 Forbidden - Solución

El error 403 que estás viendo ocurre porque **las variables de entorno no están configuradas en Hostinger**.

## Pasos para Configurar Variables de Entorno en Hostinger

### 1. Acceder al Panel de Hostinger
1. Inicia sesión en tu cuenta de Hostinger
2. Ve a la sección de tu aplicación Node.js/Next.js

### 2. Configurar Variables de Entorno
Necesitas agregar las siguientes variables de entorno en Hostinger:

```
TURSO_DATABASE_URL=libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA
```

### 3. Ubicación en Hostinger

**Opción A: Si usas Hostinger Node.js Hosting:**
1. Ve a **"Hosting" → "Administrar"**
2. Busca la sección **"Variables de Entorno"** o **"Environment Variables"**
3. Agrega cada variable con su nombre y valor
4. Guarda los cambios
5. **Reinicia la aplicación**

**Opción B: Si usas Hostinger con cPanel:**
1. Accede a **cPanel**
2. Busca **"Node.js Selector"** o **"Setup Node.js App"**
3. Selecciona tu aplicación
4. Ve a la sección **"Environment Variables"**
5. Agrega las variables:
   - Variable: `TURSO_DATABASE_URL`
   - Valor: `libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io`
   - Click en **"Add"**
   
   - Variable: `TURSO_AUTH_TOKEN`
   - Valor: (el token completo)
   - Click en **"Add"**
6. Click en **"Restart"** para reiniciar la aplicación

**Opción C: Si usas archivo .env en el servidor:**
1. Conéctate por SSH o File Manager
2. Navega a la carpeta de tu aplicación
3. Crea o edita el archivo `.env.production` o `.env`
4. Agrega las variables:
```bash
TURSO_DATABASE_URL=libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3OTc5MTcsImlkIjoiYTFlNjUxOGQtN2M5ZC00ODM4LThmZjYtZDIzZGY0ZjAwMWNjIiwicmlkIjoiYTc4MWJlYmQtMzJmNS00ZmMwLWI5OWItMmZiMTliNmJkOTA5In0.7lJnFhDH1saUBICe25F2didRsH4pzoAAv0a9lpHw1Rjh6Pgv4GpytJkp02MBFTtilNno1BqwlYegdg3lOA1tDA
```
5. Guarda el archivo
6. Reinicia la aplicación

### 4. Verificar la Configuración

Después de agregar las variables de entorno:
1. **Reinicia la aplicación** en Hostinger
2. Espera 1-2 minutos para que se apliquen los cambios
3. Accede a tu sitio web nuevamente
4. El error 403 debería desaparecer

## Problemas Comunes

### Si el error persiste después de configurar las variables:

1. **Verifica que el token no haya expirado:**
   - Los tokens de Turso pueden expirar
   - Si es necesario, genera un nuevo token en https://turso.tech/

2. **Verifica la URL de la base de datos:**
   - Asegúrate de que la URL sea correcta
   - No debe tener espacios ni caracteres extraños

3. **Reinicia la aplicación:**
   - Algunas veces es necesario reiniciar dos veces
   - O hacer un nuevo deploy

4. **Verifica los logs:**
   - Revisa los logs de Hostinger para ver errores específicos
   - Busca mensajes como "URL_INVALID" o "undefined"

## Notas Importantes

- ⚠️ **Nunca compartas tu `TURSO_AUTH_TOKEN` públicamente**
- 🔒 Las variables de entorno deben estar en el servidor, no en el código
- 🔄 Siempre reinicia la aplicación después de cambiar variables de entorno
- 📝 Guarda una copia de tus variables de entorno en un lugar seguro

## Contacto con Soporte

Si después de seguir estos pasos el problema persiste:
1. Contacta al soporte de Hostinger
2. Menciona que necesitas configurar variables de entorno para una aplicación Next.js
3. Proporciona los nombres de las variables (pero NO los valores)
