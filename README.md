# Gestión de Pasantías

Plataforma web integral para conectar empresas, universidades y estudiantes en la gestión de pasantías.  
Permite publicar oportunidades, postularse, administrar convenios tripartitos y realizar seguimiento completo.

## Stack

| Tecnología | Versión |
|------------|---------|
| Next.js (App Router, TypeScript) | 16 |
| Tailwind CSS | 4 |
| PostgreSQL + Prisma ORM | 6 |
| NextAuth v5 | latest |
| Docker (multi-stage standalone) | — |
| Nodemailer | — |

## Roles

| Rol | Descripción |
|-----|-------------|
| **ESTUDIANTE** | Busca pasantías, se postula, sigue sus postulaciones, firma convenio |
| **EMPRESA** | Publica pasantías, revisa postulaciones, cambia estados, firma convenio |
| **UNIVERSIDAD** | Gestiona facultades/carreras, supervisa pasantías de sus alumnos |
| **TUTOR_EMPRESA** | Mentor designado por la empresa para seguimiento del pasante |
| **TUTOR_ACADEMICO** | Mentor designado por la universidad para seguimiento académico |
| **ADMIN** | CRUD de usuarios, modera pasantías, auditoría, baneo |

## Funcionalidades

- **Landing page** con pasantías destacadas y empresas activas
- **Registro y login** — Email/contraseña + Google OAuth
- **Catálogo de pasantías** — búsqueda por área, modalidad y texto
- **Postulación** con documentos obligatorios (enlaces de Google Drive)
- **Máquina de estados** — BORRADOR → PUBLICADA → SELECCION → ESPERA_CONVENIO → ACTIVA → FINALIZADA / CANCELADA
- **Convenio Tripartito** — estudiante, empresa y universidad firman electrónicamente; el backend valida las 3 firmas antes de activar la pasantía
- **Gestión de documentos** por tipo (CV, alumno regular, analítico parcial, salud)
- **Perfiles** — estudiante (datos personales + académicos), empresa, universidad
- **Notificaciones por email** — al crear una pasantía se notifica a la unidad académica
- **Chat por postulación** — mensajería contextual entre participantes
- **Seguimiento (bitácora)** — registro de actividades durante la pasantía activa
- **Evaluaciones** — del tutor empresa y tutor académico sobre el desempeño del estudiante
- **Panel admin** — CRUD de usuarios con baneo, pasantías, postulaciones, convenios, auditoría
- **Auditoría** — registro automático de acciones con filtros y búsqueda

## Máquina de estados de Pasantía

```
BORRADOR ──→ PUBLICADA ──→ SELECCION ──→ ESPERA_CONVENIO ──→ ACTIVA ──→ FINALIZADA
                  │                                              │
                  └──→ CANCELADA (desde cualquier estado) ───────┘
```

## Modelo de datos

| Modelo | Descripción |
|--------|-------------|
| `Empresa` | Persona jurídica que ofrece pasantías |
| `Universidad` | Institución educativa |
| `Facultad` | Unidad académica dentro de una universidad |
| `Carrera` | Programa de estudios dentro de una facultad |
| `User` | Usuarios con rol (ESTUDIANTE, EMPRESA, UNIVERSIDAD, ADMIN, etc.) |
| `Pasantia` | Oportunidad de pasantía con estado BORRADOR/PUBLICADA/SELECCION/ESPERA_CONVENIO/ACTIVA/FINALIZADA/CANCELADA |
| `Postulacion` | Postulación de alumno a pasantía, con estados PENDIENTE/REVISADO/ACEPTADO/RECHAZADO |
| `Convenio` | Convenio tripartito con 3 booleanos de firma (alumno, empresa, universidad) |
| `Conversacion` | Chat vinculado a una postulación |
| `Mensaje` | Mensaje dentro de una conversación |
| `Documento` | Enlace de Google Drive por tipo, vinculado a usuario/postulación |
| `Seguimiento` | Bitácora de actividades del convenio |
| `Evaluacion` | Evaluación del estudiante por tutores |
| `AuditLog` | Registro de auditoría indexado por usuario, acción, tabla y fecha |

## Variables de entorno

### Base de datos

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@host:5432/pasantia?schema=public` |

### Autenticación

| Variable | Descripción |
|----------|-------------|
| `AUTH_SECRET` | Secreto JWT. Generar con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL base de la app |
| `AUTH_GOOGLE_ID` | Client ID de Google OAuth (opcional) |
| `AUTH_GOOGLE_SECRET` | Client Secret de Google OAuth (opcional) |

### Email (SMTP — opcional)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Servidor SMTP | — |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_SECURE` | TLS | `false` |
| `SMTP_USER` | Usuario SMTP | — |
| `SMTP_PASS` | Contraseña SMTP | — |
| `SMTP_FROM` | Remitente | `noreply@pasantias.com` |

## Desarrollo local

```bash
# Requisitos: Node.js 20+, PostgreSQL

git clone https://github.com/brandall2021/pasantia.git
cd pasantia
npm install
cp .env.example .env
# Editar .env con tus datos

npm run prisma migrate dev
npm run prisma db seed
npm run dev
```

**Importante:** Usar `npm run prisma` en lugar de `npx prisma` (Prisma v6).

## Despliegue con Docker

```bash
docker build -t pasantias .
```

El Dockerfile multi-stage produce una imagen standalone optimizada con Prisma CLI incluido.  
Las migraciones se aplican automáticamente al iniciar el contenedor via `prisma migrate deploy`.

## Rutas del frontend

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro |
| `/pasantias` | Público | Catálogo de pasantías activas |
| `/pasantias/[id]` | Público | Detalle de pasantía |
| `/perfil` | Auth | Perfil personal |
| `/perfil/pasantias` | Empresa | Mis pasantías |
| `/perfil/pasantias/nueva` | Empresa | Crear pasantía |
| `/perfil/pasantias/[id]` | Empresa | Editar pasantía |
| `/perfil/postulaciones` | Estudiante | Mis postulaciones |
| `/perfil/postulaciones-recibidas` | Empresa | Postulaciones recibidas |
| `/perfil/documentos` | Estudiante | Gestión de documentos |
| `/admin` | Admin | Dashboard |
| `/admin/usuarios` | Admin | CRUD usuarios |
| `/admin/usuarios/[id]` | Admin | Detalle usuario |
| `/admin/pasantias` | Admin | Todas las pasantías |
| `/admin/postulaciones` | Admin | Todas las postulaciones |
| `/admin/auditoria` | Admin | Registro de actividad |

## API endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/register` | - | Registro |
| POST | `/api/auth/*` | - | NextAuth |
| GET | `/api/pasantias` | - | Listar activas |
| POST | `/api/pasantias` | Auth | Crear |
| GET/PATCH | `/api/pasantias/[id]` | Auth | Detalle/editar |
| POST | `/api/postulaciones` | Auth | Postularse |
| PATCH | `/api/postulaciones/[id]/convenio` | Auth | Firmar convenio |
| PATCH | `/api/postulaciones/[id]/seguimiento` | Auth | Agregar bitácora |
| PATCH | `/api/postulaciones/[id]/evaluacion` | Auth | Evaluar estudiante |
| GET/POST | `/api/documentos` | Auth | Gestionar docs |
| GET/POST | `/api/chat` | Auth | Mensajería |
| PATCH | `/api/admin/pasantias/[id]` | Admin | Moderar |
| PATCH | `/api/admin/usuarios/[id]` | Admin | Banear |
| GET | `/api/auditoria` | Admin | Auditoría |
| GET | `/api/empresas` | - | Listar empresas |
| GET | `/api/universidades` | - | Listar universidades |
| GET | `/api/facultades` | - | Listar facultades |
| GET | `/api/carreras` | - | Listar carreras |

## Flujo del Convenio Tripartito

1. Estudiante se postula → estado PENDIENTE
2. Empresa revisa y acepta → ACEPTADO
3. Las 3 partes firman electrónicamente el convenio:
   - **Estudiante** desde `/perfil/postulaciones`
   - **Empresa** desde `/perfil/postulaciones-recibidas`
   - **Admin** desde `/admin/postulaciones`
4. Cuando los 3 han firmado, se puede cambiar la pasantía a ACTIVA
5. Durante la pasantía activa se registran seguimientos (bitácora)
6. Al finalizar, los tutores evalúan al estudiante

## Credenciales de prueba (seed)

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@pasantias.com | 123456 |
| TechCorp (empresa) | techcorp@pasantias.com | 123456 |
| Estudio Jurídico (empresa) | estudio@pasantias.com | 123456 |
| Universidad Nacional | universidad@pasantias.com | 123456 |
| Estudiante 1 | estudiante1@pasantias.com | 123456 |
| Estudiante 2 | estudiante2@pasantias.com | 123456 |
