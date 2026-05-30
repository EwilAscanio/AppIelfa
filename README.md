# 📋 AppIelfa - Sistema de Gestión de Asistencia

Sistema web para la gestión de asistencia de la **Iglesia IELFA**. Permite administrar miembros, familias, eventos y registrar la asistencia de manera eficiente, con generación de reportes en PDF.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 14.2.15 (App Router)
- **Frontend:** React 18, Tailwind CSS 3
- **Backend:** API Routes (Next.js Route Handlers)
- **Base de datos:** PostgreSQL (Aiven Cloud)
- **Autenticación:** NextAuth.js (Credentials Provider)
- **Lenguaje:** JavaScript (JSX)

## ✨ Funcionalidades

- **Miembros:** CRUD completo con búsqueda, estadísticas por género/edad y cumpleaños
- **Familias:** Gestión de núcleos familiares con jefe, miembros y parentescos
- **Eventos:** CRUD con códigos únicos y estado activo/inactivo
- **Asistencia:** Registro con soporte para borrador, detección de duplicados y modo reemplazo
- **Reportes PDF:** Miembros, familias, eventos por fecha, asistencia por fecha/evento
- **Dashboard:** Gráfico mensual de asistencia con Chart.js
- **Usuarios:** Gestión de usuarios con roles (Admin/User)
- **Autenticación:** Login seguro con contraseñas hasheadas (bcrypt)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/appielfa.git
cd appielfa

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tus credenciales de base de datos

# Iniciar en desarrollo
npm run dev
```

## 🗄️ Base de Datos

El proyecto usa PostgreSQL. Las tablas principales son:

| Tabla | Descripción |
|---|---|
| `tbmiembros` | Miembros de la iglesia |
| `tbfamilias` | Familias |
| `tbeventos` | Eventos |
| `tbasistencia` | Registro de asistencia |
| `tbasistencia_borrador` | Borradores de asistencia |
| `tbusuarios` | Usuarios del sistema |
| `tbroles` | Roles (Admin/User) |
| `configuracion` | Contadores de la app |

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/               # API Routes
│   ├── auth/dashboard/    # Páginas protegidas
│   ├── login/             # Inicio de sesión
│   └── registerusers/     # Registro de usuarios
├── components/            # Componentes React
│   └── reportes/          # Componentes de PDF
└── libs/                  # Utilidades (conexión DB)
```

## 📄 Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Iniciar producción
npm run lint     # Linter
```

## 🔐 Variables de Entorno

```env
NEXTAUTH_SECRET=tu_secreto
NEXTAUTH_URL=http://localhost:3000
DB_HOST=tu_host
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_PORT=5432
DB_NAME=tu_db
```

## 📄 Licencia

MIT
