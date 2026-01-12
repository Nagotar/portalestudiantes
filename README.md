# Portal Estudiante

Portal de gestión para estudiantes construido con Next.js 14 y Turso (libSQL).

## 🚀 Tecnologías

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Turso (libSQL)** - Base de datos serverless

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🗄️ Base de Datos

La aplicación está configurada para usar Turso (libSQL). Las credenciales están en `.env.local`:

- **URL**: `libsql://adamcapacitacion-tomi.aws-us-east-2.turso.io`
- **Token**: Configurado en `.env.local`

### Probar Conexión

Visita `http://localhost:3000/api/test-db` para verificar la conexión a la base de datos.

## 📁 Estructura del Proyecto

```
portal-estudiante/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   └── test-db/       # Endpoint de prueba de BD
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── lib/                   # Utilidades
│   └── db.ts             # Configuración de Turso
├── .env.local            # Variables de entorno (no subir a git)
├── next.config.js        # Configuración de Next.js
├── tailwind.config.ts    # Configuración de Tailwind
├── tsconfig.json         # Configuración de TypeScript
└── package.json          # Dependencias
```

## 🔧 Configuración de la Base de Datos

El archivo `lib/db.ts` contiene:

- Cliente de Turso configurado
- Función `executeQuery()` para ejecutar queries
- Función `initDatabase()` para inicializar tablas

### Ejemplo de Uso

```typescript
import { turso, executeQuery } from '@/lib/db';

// Ejecutar query
const result = await executeQuery(
  'SELECT * FROM usuarios WHERE email = ?',
  ['usuario@example.com']
);
```

## 🌐 Desarrollo

El servidor de desarrollo se ejecuta en `http://localhost:3000`

## 📝 Notas

- Los errores de TypeScript se resolverán después de instalar las dependencias
- Asegúrate de tener Node.js 18+ instalado
- Las variables de entorno en `.env.local` no se suben a git por seguridad
# portalestudiantes
