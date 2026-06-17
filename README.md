# Gestión de Pasantías

Plataforma web integral para gestionar pasantías. Conecta empresas (instituciones) con estudiantes, permitiendo publicar oportunidades, postularse, firmar convenio tripartito, chatear, calificar y realizar un seguimiento completo del proceso.

## Stack

| Tecnología | Versión |
|------------|---------|
| Next.js (App Router, TypeScript) | 16 |
| Tailwind CSS | 4 |
| PostgreSQL + Prisma ORM | 6 |
| NextAuth v5 | latest |
| Docker (multi-stage) | — |
| Nodemailer | — |

## Roles

| Rol | Descripción |
|-----|-------------|
| **ESTUDIANTE** | Busca pasantías, se postula (con CV y documentos obligatorios), sube su firma del convenio tripartito, chatea, deja reseñas |
| **INSTITUCION** (Empresa) | Publica pasantías, revisa postulaciones, cambia estados (Revisado/Aceptado/Rechazado), sube su firma del convenio, selecciona unidad académica a notificar, chatea |
| **ADMIN** | CRUD de usuarios, modera pasantías, gestiona postulaciones, sube firma de la institución en el convenio, panel de auditoría, baneo de usuarios |

## Funcionalidades

- **Landing page** — pasantías destacadas, instituciones activas, contadores
- **Registro y login** — Email/contraseña + Google OAuth
- **Catálogo de pasantías** — búsqueda por área, modalidad y texto
- **Postulación** — obligatorio: CV, alumno regular, analítico parcial, salud (enlaces de Google Drive)
- **Seguimiento de postulaciones** — Pendiente → Revisado → Aceptado / Rechazado
- **Convenio Tripartito** — antes de que la pasantía pase a "En Curso", las 3 partes (estudiante, empresa, institución académica) deben subir el convenio firmado digital o físicamente via enlace de Google Drive. El backend valida que estén los 3 antes de permitir el cambio de estado.
- **Gestión de documentos** — subir enlaces de Google Drive por tipo (CV, alumno regular, analítico parcial, salud, otros)
- **Edición de pasantías** — la empresa puede editar sus publicaciones desde `/perfil/pasantias/[id]`
- **Perfil de estudiante** — DNI, fecha de nacimiento, dirección, institución educativa, carrera, legajo, año de cursada, promedio
- **Perfil de institución/empresa** — datos de la empresa con pasantías activas
- **Postulaciones recibidas** — la empresa gestiona postulaciones desde `/perfil/postulaciones-recibidas` con cambio de estado y carga de convenio
- **Notificaciones por email** — al crear una pasantía, se envía email con los detalles a la unidad académica seleccionada
- **Chat en tiempo real** — entre estudiantes e instituciones
- **Reseñas y valoraciones** — 1 a 5 estrellas con comentario
- **Panel admin** — CRUD de usuarios con baneo, listado de pasantías con activar/desactivar, postulaciones con estado del convenio tripartito, detalle de usuario con historial de actividad
- **Auditoría** — registro automático de login, registro, postulaciones, baneos, creación/edición de pasantías, subida de convenio, modificación de perfil. Vista en `/admin/auditoria` con filtros por acción y búsqueda.
- **Reportes y denuncias** — sobre pasantías

## Modelo de datos

| Modelo | Descripción |
|--------|-------------|
| `User` | Usuarios con rol (ESTUDIANTE, INSTITUCION, ADMIN). Campos: name, email, password (opcional para OAuth), phone, dni, fechaNacimiento, direccion, asisteA, carrera, legajo, anioCursada, promedio, image, verified, baneado, motivoBaneo |
| `Institucion` | Perfil de institución/empresa. Campos: nombre, descripcion, logo, sitioWeb, direccion, ciudad, provincia, telefono, email |
| `Pasantia` | Oportunidad de pasantía. Campos: titulo, descripcion, requisitos, area, modalidad, duracion, becaEconomica, cargaHoraria, vacantes, estado (ABIERTA, EN_CURSO, CERRADA), activo, institucionId (creador), unidadAcademicaId (institución a notificar) |
| `Postulacion` | Postulación de un estudiante a una pasantía. Estados: PENDIENTE, REVISADO, ACEPTADO, RECHAZADO. Convenio: convenioEstudianteUrl, convenioEmpresaUrl, convenioInstitucionUrl, convenioCompletado. Unique: [pasantiaId, estudianteId] |
| `Documento` | Enlace de Google Drive asociado a un usuario y opcionalmente a una postulación. Tipos: CV, ALUMNO_REGULAR, ANALITICO_PARCIAL, SALUD, OTRO |
| `Chat` / `Mensaje` | Mensajería entre usuarios |
| `Resena` | Valoración 1-5 con comentario |
| `AuditLog` | Registro de actividad del sistema con acción, detalle, IP y fecha. Indexado por usuario, acción y fecha |
| `Report` | Denuncias sobre pasantías |

## Variables de entorno

### Base de datos

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@host:5432/pasantia?schema=public` |

### Autenticación

| Variable | Descripción |
|----------|-------------|
| `AUTH_SECRET` | Secreto JWT. Generar con `openssl rand -base64 32` |
| `AUTH_URL` | URL base de la app (desarrollo) |
| `NEXTAUTH_URL` | URL base de la app (producción) |
| `AUTH_GOOGLE_ID` | Client ID de Google OAuth (opcional) |
| `AUTH_GOOGLE_SECRET` | Client Secret de Google OAuth (opcional) |

### Email (SMTP — opcional)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Servidor SMTP | — |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_SECURE` | TLS (`true`/`false`) | `false` |
| `SMTP_USER` | Usuario SMTP | — |
| `SMTP_PASS` | Contraseña SMTP | — |
| `SMTP_FROM` | Dirección remitente | `noreply@pasantias.com` |

## Desarrollo local

```bash
# Requisitos
# - Node.js 20+
# - PostgreSQL

git clone https://github.com/brandall2021/pasantia.git
cd pasantia
npm install
cp .env.example .env
# Editar .env con tus datos

# Migrar base de datos
npm run prisma migrate dev

# Seed con datos de prueba
npm run prisma db seed

# Servidor de desarrollo
npm run dev
```

**Importante:** Usar `npm run prisma` en lugar de `npx prisma` para evitar problemas con Prisma v7.

## Despliegue con Docker (Dokploy)

### Construcción

```bash
docker build -t pasantias .
```

El Dockerfile multi-stage produce una imagen standalone optimizada.

### Variables de entorno en Dokploy

Configurar en el panel de Dokploy:

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | Conexión a PostgreSQL |
| `AUTH_SECRET` | Sí | Clave JWT |
| `NEXTAUTH_URL` | Sí | URL del dominio |
| `AUTH_GOOGLE_ID` | No | OAuth Google |
| `AUTH_GOOGLE_SECRET` | No | OAuth Google |
| `SMTP_HOST` | No | Servidor SMTP |
| `SMTP_PORT` | No | Puerto SMTP |
| `SMTP_SECURE` | No | TLS |
| `SMTP_USER` | No | Usuario SMTP |
| `SMTP_PASS` | No | Contraseña SMTP |
| `SMTP_FROM` | No | Remitente |

### Base de datos

Crear la base de datos `pasantia` en PostgreSQL. Al iniciar el contenedor, `prisma migrate deploy` aplica las migraciones automáticamente.

## Rutas del frontend

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page con pasantías destacadas |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de usuario |
| `/pasantias` | Público | Catálogo de pasantías activas |
| `/pasantias/[id]` | Público | Detalle de pasantía |
| `/instituciones/[id]` | Público | Perfil público de institución |
| `/perfil` | Autenticado | Perfil personal con datos editables |
| `/perfil/pasantias` | Empresa | Listado de pasantías publicadas |
| `/perfil/pasantias/nueva` | Empresa | Crear nueva pasantía |
| `/perfil/pasantias/[id]` | Empresa | Editar pasantía |
| `/perfil/postulaciones` | Estudiante | Mis postulaciones (con carga de convenio) |
| `/perfil/postulaciones-recibidas` | Empresa | Postulaciones recibidas (con carga de convenio y cambio de estado) |
| `/perfil/documentos` | Estudiante | Gestión de documentos (CV, alumno regular, etc.) |
| `/admin` | Admin | Dashboard con estadísticas |
| `/admin/usuarios` | Admin | CRUD de usuarios con baneo |
| `/admin/usuarios/[id]` | Admin | Detalle de usuario con historial de actividad |
| `/admin/pasantias` | Admin | Todas las pasantías (activar/desactivar, cambiar estado) |
| `/admin/postulaciones` | Admin | Todas las postulaciones con convenio tripartito |
| `/admin/auditoria` | Admin | Registro de actividad del sistema |
| `/chat` | Autenticado | Mensajería entre usuarios |

## API endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/register` | - | Registro de usuario |
| POST | `/api/auth/*` | - | NextAuth (login, OAuth) |
| GET | `/api/pasantias` | - | Listar pasantías activas |
| POST | `/api/pasantias` | Auth | Crear pasantía (empresa) |
| GET | `/api/pasantias/[id]` | - | Detalle de pasantía |
| PATCH | `/api/pasantias/[id]` | Auth | Editar pasantía (dueño o admin) |
| GET | `/api/instituciones` | - | Listar instituciones |
| PATCH | `/api/instituciones` | Auth | Actualizar perfil |
| POST | `/api/postulaciones` | Auth | Postularse a pasantía (estudiante) |
| PATCH | `/api/postulaciones` | Auth | Cambiar estado de postulación |
| PATCH | `/api/postulaciones/[id]/convenio` | Auth | Subir convenio tripartito |
| GET/POST | `/api/documentos` | Auth | Gestionar documentos |
| GET/POST | `/api/chat` | Auth | Mensajería |
| PATCH | `/api/admin/pasantias/[id]` | Admin | Activar/desactivar/cambiar estado pasantía |
| PATCH | `/api/admin/usuarios/[id]` | Admin | Banear/desbanear usuario |
| DELETE | `/api/admin/usuarios/[id]` | Admin | Eliminar usuario |
| GET | `/api/auditoria` | Admin | Registros de auditoría (filtrable) |

## Flujo del Convenio Tripartito

1. El estudiante se postula a una pasantía (PENDIENTE)
2. La empresa revisa y acepta la postulación (ACEPTADO)
3. Las 3 partes suben el convenio firmado:
   - **Estudiante** desde `/perfil/postulaciones`
   - **Empresa** desde `/perfil/postulaciones-recibidas`
   - **Admin** (en representación de la institución académica) desde `/admin/postulaciones`
4. Cuando los 3 convenios están cargados, `convenioCompletado = true`
5. Recién entonces se puede cambiar el estado de la pasantía a "En Curso" (EN_CURSO)

## Credenciales de prueba (seed)

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@pasantias.com | 123456 |
| TechCorp | techcorp@pasantias.com | 123456 |
| Universidad Nacional | universidad@pasantias.com | 123456 |
| Estudio Jurídico | estudio@pasantias.com | 123456 |
| Estudiante 1 | estudiante1@pasantias.com | 123456 |
| Estudiante 2 | estudiante2@pasantias.com | 123456 |
