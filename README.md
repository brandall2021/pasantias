# Gestión de Pasantías

Plataforma web integral para gestionar pasantías. Conecta empresas (instituciones) con estudiantes, permitiendo publicar oportunidades, postularse, chatear, calificar y realizar un seguimiento completo del proceso.

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
| **ESTUDIANTE** | Busca pasantías, se postula (con CV y documentos), chatea, deja reseñas |
| **INSTITUCION** | Publica pasantías, revisa postulaciones, chatea, notifica a unidades académicas |
| **ADMIN** | CRUD de usuarios, modera pasantías, gestiona postulaciones, panel de auditoría |

## Funcionalidades

- **Landing page** — pasantías destacadas, instituciones activas, contadores
- **Registro y login** — Email/contraseña + Google OAuth
- **Catálogo de pasantías** — búsqueda por área, modalidad y texto
- **Postulación** — obligatorio: CV, alumno regular, analítico parcial, salud (Google Drive)
- **Seguimiento de postulaciones** — Pendiente / Revisado / Aceptado / Rechazado
- **Gestión de documentos** — subir enlaces de Google Drive por tipo (CV, alumno regular, etc.)
- **Perfil de estudiante** — DNI, fecha de nacimiento, dirección, institución educativa, carrera, legajo, año de cursada, promedio
- **Perfil de institución** — datos de la empresa con pasantías activas
- **Chat en tiempo real** — entre estudiantes e instituciones
- **Reseñas y valoraciones** — 1 a 5 estrellas con comentario
- **Panel admin** — usuarios, pasantías, postulaciones, auditoría, detalle de usuario con historial
- **Auditoría** — registro automático de login, registro, postulaciones, baneos, creación de pasantías, modificación de perfil
- **Notificaciones por email** — al crear una pasantía, se envía email a la unidad académica seleccionada
- **Reportes y denuncias** — sobre pasantías

## Modelo de datos

| Modelo | Descripción |
|--------|-------------|
| `User` | Usuarios con rol (ESTUDIANTE, INSTITUCION, ADMIN). Campos: name, email, password (opcional para OAuth), phone, dni, fechaNacimiento, direccion, asisteA, carrera, legajo, anioCursada, promedio, image, verified, baneado, motivoBaneo |
| `Institucion` | Perfil de institución/empresa. Campos: nombre, descripcion, logo, sitioWeb, direccion, ciudad, provincia, telefono, email |
| `Pasantia` | Oportunidad de pasantía. Campos: titulo, descripcion, requisitos, area, modalidad, duracion, becaEconomica, cargaHoraria, vacantes, estado, activo, institucionId (creador), unidadAcademicaId (institución a notificar) |
| `Postulacion` | Postulación de un estudiante a una pasantía. Estados: PENDIENTE, REVISADO, ACEPTADO, RECHAZADO. Unique: [pasantiaId, estudianteId] |
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

## Credenciales de prueba (seed)

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@pasantias.com | 123456 |
| TechCorp | techcorp@pasantias.com | 123456 |
| Universidad Nacional | universidad@pasantias.com | 123456 |
| Estudio Jurídico | estudio@pasantias.com | 123456 |
| Estudiante 1 | estudiante1@pasantias.com | 123456 |
| Estudiante 2 | estudiante2@pasantias.com | 123456 |
