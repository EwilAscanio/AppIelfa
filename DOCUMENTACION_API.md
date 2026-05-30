# Documentación de la API - AppIelfa

> **Sistema de Gestión de Asistencia para Iglesia IELFA**  
> Versión: 0.1.0 | Framework: Next.js 14.2.15 (App Router)

---

## Índice

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Dependencias](#2-dependencias)
3. [Variables de Entorno](#3-variables-de-entorno)
4. [Base de Datos PostgreSQL](#4-base-de-datos-postgresql)
5. [API Routes - Endpoints](#5-api-routes---endpoints)
6. [Frontend - Páginas y Componentes](#6-frontend---páginas-y-componentes)
7. [Autenticación y Roles](#7-autenticación-y-roles)
8. [Reportes PDF](#8-reportes-pdf)

---

## 1. Stack Tecnológico

| Tecnología | Versión |
|---|---|
| **Next.js** | 14.2.15 |
| **React** | 18.3.1 |
| **JavaScript** | JSX (sin TypeScript) |
| **Base de datos** | PostgreSQL (Aiven Cloud) |
| **Autenticación** | NextAuth.js 4.24.10 (Credentials Provider) |
| **Estilos** | Tailwind CSS 3.4.1 |
| **ORM/Driver** | `pg` 8.16.3 (con pool de conexiones) |
| **Lenguaje** | JavaScript |

---

## 2. Dependencias

### Producción

| Paquete | Versión | Propósito |
|---|---|---|
| `next` | ^14.2.15 | Framework principal |
| `react` | ^18.3.1 | Librería UI |
| `react-dom` | ^18.3.1 | Renderizado DOM |
| `next-auth` | ^4.24.10 | Autenticación con credenciales |
| `bcrypt` | ^5.1.1 | Hashing de contraseñas |
| `pg` | ^8.16.3 | Cliente PostgreSQL |
| `axios` | ^1.7.8 | Cliente HTTP para peticiones frontend |
| `react-hook-form` | ^7.66.0 | Manejo de formularios |
| `react-icons` | ^5.3.0 | Íconos para UI |
| `sweetalert2` | ^11.14.5 | Alertas y modales |
| `chart.js` | ^4.4.7 | Gráficos (asistencia mensual) |
| `@react-pdf/renderer` | ^4.3.0 | Generación de PDFs |
| `react-pdf` | ^9.2.1 | Visor de PDF (no utilizado activamente) |

### Desarrollo

| Paquete | Versión | Propósito |
|---|---|---|
| `eslint` | ^8 | Linter |
| `eslint-config-next` | 15.0.3 | Config ESLint para Next.js |
| `postcss` | ^8 | Procesador CSS |
| `tailwindcss` | ^3.4.1 | Framework CSS utility-first |
| `@types/pg` | ^8.15.5 | Tipos para pg |

---

## 3. Variables de Entorno

### Desarrollo (`.env`)

```env
NEXTAUTH_SECRET = "clave_key_secreta_ielfa"
NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_NOMBRE_EMPRESA= "Ielfa"
NEXT_PUBLIC_DIRECCION_EMPRESA= "Flor Amarillo"
DB_HOST=appielfa-appielfa.i.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=AVNS_WYKREnMsCJhPdEzgaYC
DB_PORT=27017
DB_NAME=defaultdb
```

### Producción (`.env.production`)

```env
NEXT_PUBLIC_NEXTAUTH_URL=appielfa-appielfa.i.aivencloud.com
NEXTAUTH_URL=appielfa-appielfa.i.aivencloud.com
NEXTAUTH_SECRET="ielfa_secret_key"
```

> **Nota:** La base de datos está alojada en **Aiven Cloud** en `appielfa-appielfa.i.aivencloud.com:27017/defaultdb`.

---

## 4. Base de Datos PostgreSQL

### Conexión (`src/libs/postgress.js`)

Se utiliza un pool de conexiones de `pg` para manejar las consultas.

### Tablas y Esquemas

#### `tbmiembros` — Miembros de la iglesia

| Columna | Tipo | Descripción |
|---|---|---|
| `id_mie` | SERIAL (PK) | ID autoincremental |
| `nombre_mie` | VARCHAR | Nombre completo |
| `cedula_mie` | VARCHAR | Cédula de identidad (única) |
| `direccion_mie` | VARCHAR | Dirección de residencia |
| `telefono_mie` | VARCHAR | Teléfono de contacto |
| `fechanacimiento_mie` | DATE | Fecha de nacimiento |
| `sexo_mie` | VARCHAR | Sexo (Masculino/Femenino) |
| `email_mie` | VARCHAR | Correo electrónico |
| `tipo_mie` | VARCHAR | Tipo (Miembro/Invitado) |
| `id_fam` | INTEGER (FK → tbfamilias) | ID de familia (nullable) |
| `parentesco` | VARCHAR | Parentesco con el jefe de familia |

#### `tbfamilias` — Familias

| Columna | Tipo | Descripción |
|---|---|---|
| `id_fam` | SERIAL (PK) | ID autoincremental |
| `nombre_fam` | VARCHAR | Nombre de la familia |
| `cedula_jefe_fam` | VARCHAR | Cédula del jefe de familia |

#### `tbeventos` — Eventos

| Columna | Tipo | Descripción |
|---|---|---|
| `id_eve` | SERIAL (PK) | ID autoincremental |
| `codigo_eve` | VARCHAR | Código único del evento |
| `nombre_eve` | VARCHAR | Nombre del evento |
| `fecha_eve` | DATE | Fecha del evento |
| `descripcion_eve` | VARCHAR | Descripción del evento |
| `status_eve` | VARCHAR | Estado (Activo/Inactivo) |

#### `tbasistencia` — Asistencia a eventos

| Columna | Tipo | Descripción |
|---|---|---|
| `id_asi` | SERIAL (PK) | ID autoincremental |
| `id_mie` | INTEGER (FK → tbmiembros) | ID del miembro |
| `codigo_eve` | VARCHAR (FK → tbeventos) | Código del evento |
| `nombre_mie` | VARCHAR | Nombre del miembro (desnormalizado) |
| `cedula_mie` | VARCHAR | Cédula del miembro (desnormalizado) |
| `fecha_asi` | DATE | Fecha de asistencia |

**Unique:** `(id_mie, codigo_eve)`

#### `tbasistencia_borrador` — Borrador de asistencia

| Columna | Tipo | Descripción |
|---|---|---|
| `codigo_eve` | VARCHAR | Código del evento |
| `id_mie` | INTEGER | ID del miembro |

**Unique:** `(codigo_eve, id_mie)`

#### `tbusuarios` — Usuarios del sistema

| Columna | Tipo | Descripción |
|---|---|---|
| `id_usr` | SERIAL (PK) | ID autoincremental |
| `nombre_usr` | VARCHAR | Nombre completo |
| `login_usr` | VARCHAR | Nombre de usuario (único) |
| `email_usr` | VARCHAR | Correo electrónico (único) |
| `password_usr` | VARCHAR | Contraseña hasheada con bcrypt |
| `id_rol` | INTEGER (FK → tbroles) | ID del rol |
| `imagen_usr` | VARCHAR | URL de imagen de perfil (nullable) |

#### `tbroles` — Roles del sistema

| Columna | Tipo | Descripción |
|---|---|---|
| `id_rol` | SERIAL (PK) | ID del rol |
| `nombre_rol` | VARCHAR | Nombre del rol (Admin / User) |

#### `configuracion` — Configuración de la aplicación

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Siempre 1 (singleton) |
| `totalmiembros` | INTEGER | Contador total de miembros |
| `totalEventos` | INTEGER | Contador total de eventos |

---

## 5. API Routes - Endpoints

### 5.1 Autenticación

#### `POST /api/auth/[...nextauth]`

- **Métodos:** GET, POST
- **Provider:** CredentialsProvider (NextAuth.js)
- **Body (POST):**
  ```json
  {
    "login": "string",
    "password": "string"
  }
  ```
- **Respuesta:** Objeto JWT con sesión
- **Campos en sesión:** `id`, `name`, `login`, `email`, `role`, `image`
- **Validación:** Busca en `tbusuarios` por `login_usr` (lowercase) y verifica con `bcrypt.compare()`
- **Páginas custom:** signIn → `/login`, error → `/auth/error`

---

### 5.2 Miembros

#### `GET /api/miembro`

- **Descripción:** Obtiene todos los miembros con estadísticas
- **Respuesta:**
  ```json
  {
    "miembros": [...],
    "conteoPorGenero": { "Masculino": 10, "Femenino": 15 },
    "conteoPorTipoMiembro": { "Miembro": 20, "Invitado": 5 },
    "conteoDeNinos": 3,
    "totalMiembros": 25,
    "cumpleanerosDelDia": [...],
    "cumpleanerosDelMes": [...]
  }
  ```

#### `POST /api/miembro`

- **Descripción:** Registra un nuevo miembro
- **Body:**
  ```json
  {
    "nombre_mie": "string",
    "cedula_mie": "string",
    "direccion_mie": "string",
    "fechanacimiento_mie": "date",
    "sexo_mie": "string",
    "tipo_mie": "string",
    "telefono_mie": "string (opcional)",
    "email_mie": "string (opcional)"
  }
  ```
- **Incrementa:** `configuracion.totalMiembros`
- **Validación:** No permite cédulas duplicadas

#### `GET /api/miembro/[id]`

- **Descripción:** Obtiene un miembro por cédula
- **Parámetro:** `id` = cédula del miembro
- **Incluye:** Edad calculada (`edad_actual`)

#### `PUT /api/miembro/[id]`

- **Descripción:** Actualiza un miembro por cédula
- **Body:** Mismos campos que POST

#### `DELETE /api/miembro/[id]`

- **Descripción:** Elimina un miembro por cédula
- **Decrementa:** `configuracion.totalMiembros`

#### `GET /api/miembro/search?query=<término>`

- **Descripción:** Busca miembros por cédula o nombre
- **Límite:** 10 resultados
- **Respuesta:** `[{ id_mie, cedula_mie, nombre_mie }]`

---

### 5.3 Familias

#### `GET /api/familias`

- **Descripción:** Obtiene todas las familias con sus miembros
- **Respuesta:**
  ```json
  {
    "familias": [{
      "id_fam": 1,
      "nombre_fam": "string",
      "cedula_jefe_fam": "string",
      "jefe_nombre": "string",
      "jefe_cedula": "string",
      "miembros": [{ "id": 1, "nombre": "...", "cedula": "...", "parentesco": "..." }]
    }],
    "totalFamilias": 5
  }
  ```

#### `POST /api/familias`

- **Descripción:** Crea una nueva familia
- **Body:**
  ```json
  {
    "nombre_fam": "string",
    "cedula_jefe_fam": "string"
  }
  ```
- **Validación:** El jefe no debe pertenecer a otra familia. Nombre único.
- **Asigna automáticamente:** `id_fam` al jefe de familia

#### `GET /api/familias/[id]`

- **Descripción:** Obtiene una familia por ID con sus miembros

#### `PUT /api/familias/[id]`

- **Descripción:** Actualiza familia (nombre, jefe, miembros)
- **Body:**
  ```json
  {
    "nombre_fam": "string",
    "cedula_jefe_fam": "string",
    "miembros": [{ "cedula": "string", "parentesco": "string" }]
  }
  ```
- **Usa transacciones:** BEGIN/COMMIT/ROLLBACK

#### `POST /api/familias/[id]/assign-members`

- **Descripción:** Asigna miembros a una familia existente
- **Body:**
  ```json
  {
    "members": [{ "nombre": "string", "cedula": "string", "parentesco": "string" }]
  }
  ```
- **Usa transacciones:** BEGIN/COMMIT/ROLLBACK
- **Validación:** Los miembros no deben pertenecer ya a otra familia

---

### 5.4 Eventos

#### `GET /api/evento`

- **Descripción:** Obtiene todos los eventos

#### `POST /api/evento`

- **Body:**
  ```json
  {
    "codigo_eve": "string",
    "nombre_eve": "string",
    "fecha_eve": "date",
    "descripcion_eve": "string",
    "status_eve": "string"
  }
  ```
- **Incrementa:** `configuracion.totalEventos`

#### `GET /api/evento/[id]`

- **Descripción:** Obtiene un evento por código

#### `PUT /api/evento/[id]`

- **Descripción:** Actualiza evento por código

#### `DELETE /api/evento/[id]`

- **Descripción:** Elimina evento por código
- **Manejo de errores:** Error 409 si tiene asistencia registrada (foreign key)
- **Decrementa:** `configuracion.totalEventos`

---

### 5.5 Asistencia

#### `GET /api/asistencia?query=<término>`

- **Descripción:** Busca miembros para registrar asistencia (misma lógica que miembro/search)

#### `POST /api/asistencia`

- **Descripción:** Guarda asistencia masiva de miembros a un evento
- **Body:**
  ```json
  {
    "asistencia": [{
      "id_mie": 1,
      "codigo_eve": "string",
      "nombre_mie": "string",
      "cedula_mie": "string",
      "fecha_asi": "date"
    }]
  }
  ```
- **Maneja duplicados:** `ON CONFLICT (id_mie, codigo_eve) DO NOTHING`

#### `GET /api/asistencia/[id]`

- **Descripción:** Obtiene asistencia por código de evento (usa req.query - legacy)

#### `GET /api/asistencia/search?query=<término>`

- **Descripción:** Busca miembros para el módulo de asistencia

#### `POST /api/asistencia/search`

- **Descripción:** Guarda asistencia por evento (versión legacy con `INSERT ... SET ?`)
- **Body:**
  ```json
  {
    "codigo_evento": "string",
    "miembros": [{ "cedula": "string", "nombre": "string", "id_mie": 1 }]
  }
  ```

#### `POST /api/asistencia/borrador`

- **Descripción:** Agrega un miembro al borrador de asistencia de un evento
- **Body:** `{ "codigo_eve": "string", "id_mie": 1 }`
- **Maneja duplicados:** `ON CONFLICT DO NOTHING`

#### `DELETE /api/asistencia/borrador`

- **Descripción:** Elimina un miembro del borrador de asistencia
- **Body:** `{ "codigo_eve": "string", "id_mie": 1 }`

#### `GET /api/asistencia/borrador?codigo_eve=<código>`

- **Descripción:** Obtiene miembros en borrador para un evento (versión legacy)

#### `GET /api/asistencia/borrador/[codigo_eve]`

- **Descripción:** Obtiene miembros en borrador para un evento con datos completos
- **Respuesta:** `[{ id_mie, codigo_eve, cedula_mie, nombre_mie, fechanacimiento_mie }]`

#### `DELETE /api/asistencia/borrador/[codigo_eve]`

- **Descripción:** Elimina todo el borrador de asistencia de un evento

#### `GET /api/asistenciamensual`

- **Descripción:** Obtiene conteo de asistencias agrupadas por mes (año actual)
- **Respuesta:** `[{ mes: 1, total_asistencias: 50 }, ...]`
- **Uso:** Alimenta el gráfico Chart.js

#### `GET /api/listadoasistencia`

- **Descripción:** Obtiene todas las asistencias agrupadas por evento y fecha
- **Respuesta:** `[{ codigo_eve, nombre_eve, fecha_asistencia, miembros: [...], total_asistentes }]`

---

### 5.6 Usuarios del Sistema

#### `GET /api/usuarios`

- **Descripción:** Obtiene todos los usuarios registrados

#### `POST /api/usuarios`

- **Descripción:** Registra un nuevo usuario
- **Body:**
  ```json
  {
    "nombre_usr": "string",
    "login_usr": "string",
    "email_usr": "string",
    "password_usr": "string",
    "id_rol": 1
  }
  ```
- **Validación:** Email y login únicos
- **Seguridad:** Contraseña hasheada con bcrypt (salt rounds: 5)

#### `GET /api/usuarios/[id]`

- **Descripción:** Obtiene usuario por email (con nombre del rol)
- **Incluye JOIN con `tbroles`**

#### `DELETE /api/usuarios/[id]`

- **Descripción:** Elimina usuario por ID numérico

#### `GET /api/update/[id]`

- **Descripción:** Obtiene usuario por ID numérico

#### `PUT /api/update/[id]`

- **Descripción:** Actualiza usuario por ID numérico
- **Body:**
  ```json
  {
    "nombre_usr": "string",
    "login_usr": "string",
    "email_usr": "string",
    "password_usr": "string",
    "id_rol": 1
  }
  ```
- **Vuelve a hashear:** Contraseña con bcrypt

---

### 5.7 Configuración

#### `GET /api/configuracion`

- **Descripción:** Obtiene la configuración de la app (contadores)
- **Respuesta:** `{ id: 1, totalmiembros: 100, totaleventos: 20 }`

#### `PUT /api/configuracion`

- **Descripción:** Actualiza contadores de la configuración
- **Body:** `{ "totalMiembros": 100, "totalEventos": 20 }` (ambos opcionales)
- **Actualización dinámica de campos:** Solo actualiza los campos enviados

---

### 5.8 Reportes

#### `GET /api/reportes/miembros?categoria=<categoría>`

- **Descripción:** Reporte de todos los miembros con edad calculada
- **Respuesta:**
  ```json
  {
    "miembrosTotales": [...],
    "miembrosAdultos": [...],
    "miembrosNinos": [...]
  }
  ```
- **Categorización:** Adultos (edad >= 10), Niños (edad < 10)

#### `GET /api/reportes/familias?categoria=<categoría>`

- **Descripción:** Reporte de familias con miembros, edades y estadísticas
- **Respuesta:**
  ```json
  {
    "familias": [{
      "id_fam": 1,
      "nombre_fam": "...",
      "jefe_nombre": "...",
      "jefe_cedula": "...",
      "jefe_direccion": "...",
      "jefe_telefono": "...",
      "miembros": [{ "id": 1, "nombre": "...", "cedula": "...", "parentesco": "...", "edad": 30 }],
      "total_miembros": 4,
      "miembros_adultos": 3,
      "miembros_ninos": 1
    }],
    "totalFamilias": 5
  }
  ```

#### `GET /api/reportes/evento/[id]?fechaInicial=<date>&fechaFinal=<date>`

- **Descripción:** Reporte de eventos en un rango de fechas

#### `GET /api/reportes/asistencia/[id]?fechaInicial=<date>&fechaFinal=<date>`

- **Descripción:** Reporte de asistencia en rango de fechas por miembro
- **Respuesta:**
  ```json
  {
    "asistencias": [{
      "id_mie": 1,
      "nombre_mie": "...",
      "cedula_mie": "...",
      "tipo_mie": "...",
      "total_eventos_asistidos": 5,
      "eventos_asistidos": "EV001 | EV002 | ..."
    }],
    "totalAsistentes": 20
  }
  ```

#### `GET /api/reportes/asistenciaporevento/[id]?codigoEvento=<código>`

- **Descripción:** Reporte de asistencia por código de evento (solo eventos activos)
- **Respuesta:**
  ```json
  {
    "asistencias": [...],
    "totalAsistentes": 30,
    "conteoNinosEnAsistencia": 5
  }
  ```

---

## 6. Frontend - Páginas y Componentes

### Páginas Públicas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `src/app/page.jsx` | Home → redirige a LoginCard |
| `/login` | `src/app/login/page.jsx` | Página de inicio de sesión |
| `/registerusers` | `src/app/registerusers/page.jsx` | Registro público de usuarios |
| `/auth/error` | `src/app/auth/error/page.jsx` | Página de error de autenticación |

### Páginas Protegidas (Dashboard)

| Ruta | Descripción |
|---|---|
| `/auth/dashboard` | Dashboard principal con gráficos y estadísticas |
| `/auth/dashboard/usuarios` | Listado de usuarios (CRUD) |
| `/auth/dashboard/usuarios/registerusers` | Crear usuario |
| `/auth/dashboard/usuarios/updateusers/[id]` | Actualizar usuario |
| `/auth/dashboard/usuarios/deleteusers/[id]` | Eliminar usuario |
| `/auth/dashboard/miembros` | Listado de miembros (CRUD) |
| `/auth/dashboard/miembros/registrarmiembros` | Registrar miembro |
| `/auth/dashboard/miembros/actualizarmiembro/[id]` | Actualizar miembro |
| `/auth/dashboard/miembros/eliminarmiembro/[id]` | Eliminar miembro |
| `/auth/dashboard/eventos` | Listado de eventos (CRUD) |
| `/auth/dashboard/eventos/registrarevento` | Crear evento |
| `/auth/dashboard/eventos/actualizarevento/[id]` | Actualizar evento |
| `/auth/dashboard/eventos/eliminarevento/[id]` | Eliminar evento |
| `/auth/dashboard/familias` | Listado de familias (CRUD) |
| `/auth/dashboard/familias/registrar` | Registrar familia (multi-paso) |
| `/auth/dashboard/familias/update/[id]` | Actualizar familia con gestión de miembros |
| `/auth/dashboard/asistencia` | Registro de asistencia |
| `/auth/dashboard/listadoasistencia` | Listado de asistencias registradas |
| `/auth/dashboard/reportes` | Centro de reportes |

### Componentes Principales

- `NavbarDasboard.jsx` — Barra de navegación superior
- `Sidebar.jsx` — Menú lateral de navegación
- `Dashboard.jsx` — Panel principal con Chart.js
- `ChartComponent.jsx` — Componente de gráfico Chart.js
- `MemberSearch.jsx` — Buscador de miembros
- `Login.jsx` / `LoginCard.jsx` / `LoginNew.jsx` — Componentes de login
- `LandingPage.jsx` — Página de bienvenida
- `HomePage.jsx` — Página principal
- `EliminarEvento.jsx` — Confirmación de eliminación de evento
- `EliminarMiembro.jsx` — Confirmación de eliminación de miembro
- `EliminarUsuario.jsx` — Confirmación de eliminación de usuario
- `LinkSignout.jsx` — Botón de cerrar sesión

---

## 7. Autenticación y Roles

### Middleware (`src/middleware.js`)

```javascript
export { default } from "next-auth/middleware";
export const config = { matcher: ["/auth/dashboard/:path*"] };
```

Protege todas las rutas bajo `/auth/dashboard/`.

### Flujo de Autenticación

1. Usuario visita `/login` e ingresa credenciales
2. NextAuth (`CredentialsProvider`) valida contra `tbusuarios` usando bcrypt
3. JWT generado con `id`, `role`, `login` en el token
4. Sesión expuesta en `session.user` con `id`, `role`, `login`
5. Middleware redirige a `/login` si no hay sesión válida

### Roles

- **Admin** (`id_rol: 1`) — Acceso completo al sistema
- **User** (`id_rol: 2`) — Acceso limitado (según implementación)

---

## 8. Reportes PDF

La aplicación genera reportes PDF descargables usando `@react-pdf/renderer`.

### Reportes Disponibles

1. **Miembros** — Lista completa con edades (Adultos/Niños)
2. **Familias** — Lista de familias con jefes y miembros
3. **Eventos por Fecha** — Eventos filtrados por rango de fechas
4. **Asistencia por Fecha** — Asistencias filtradas por rango de fechas
5. **Asistencia por Evento** — Asistencias filtradas por código de evento

### Componentes PDF

- `src/components/reportes/` — Contiene los componentes de generación de PDF

---

## 9. Comandos del Proyecto

```bash
npm run dev      # Iniciar servidor de desarrollo (host: 0.0.0.0)
npm run build    # Construir para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar ESLint
```

## 10. Configuración del Proyecto

- **jsconfig.json:** Path alias `@/` → `./src/*`
- **tailwind.config.js:** Colores personalizados (primary: `#9D00FF`, secondary: `#9C27B0`)
- **next.config.mjs:** Patrones de imágenes remotas (Unsplash)
- **postcss.config.mjs:** Plugins de Tailwind CSS
