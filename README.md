# Gestión de Pasantías

Plataforma web integral para conectar empresas, universidades y estudiantes en la gestión de pasantías.
Permite publicar oportunidades, postularse, administrar convenios tripartitos, firmar electrónicamente,
planificar el trabajo con registro de horas y realizar seguimiento completo (bitácora, evaluaciones, seguros).

Producción: <https://pasantia.softgroup.com.ar>

## Stack

| Tecnología | Versión |
|------------|---------|
| Next.js (App Router, TypeScript) | 16 |
| Tailwind CSS | 4 |
| PostgreSQL + Prisma ORM | 6 |
| NextAuth v5 | latest |
| Docker (multi-stage standalone) | — |
| Nodemailer | — |
| pdfkit (generación de PDFs) | — |
| web-push (notificaciones push) | — |

## Roles

| Rol | Descripción |
|-----|-------------|
| **ESTUDIANTE** | Busca pasantías, se postula, sigue sus postulaciones, carga su perfil académico, firma convenio |
| **EMPRESA** | Publica pasantías, revisa postulaciones, cambia estados, solicita convenios marco, firma convenio |
| **UNIVERSIDAD** | Gestiona facultades/carreras, supervisa pasantías de sus alumnos, aprueba convenios marco, ve reportes y analytics |
| **TUTOR_EMPRESA** | Mentor designado por la empresa: plan de trabajo, registro de horas, seguimiento, evaluaciones |
| **TUTOR_ACADEMICO** | Mentor designado por la universidad: plan de trabajo, registro de horas, seguimiento, evaluaciones |
| **ADMIN** | CRUD de usuarios, modera pasantías, auditoría, baneo, aprueba convenios marco |

## Funcionalidades

### Pasantías y postulaciones
- **Landing page** con pasantías destacadas y empresas activas
- **Registro y login** — Email/contraseña + Google OAuth
- **Catálogo de pasantías** — búsqueda por área, modalidad y texto
- **Postulación** con documentos obligatorios (enlaces de Google Drive o archivos subidos)
- **Máquina de estados** — BORRADOR → PUBLICADA → SELECCION → ESPERA_CONVENIO → ACTIVA → FINALIZADA / CANCELADA

### Convenios
- **Convenio Tripartito** — estudiante, empresa y universidad firman electrónicamente; el backend valida las 3 firmas antes de activar la pasantía
- **Firma electrónica** — cada parte firma generando un hash SHA-256 (`convenioId|postulacionId|titulo|parte|usuarioId|nombre|timestamp`) que se almacena junto con la fecha de firma
- **Convenio Marco universidad-empresa** — las empresas solicitan convenio marco; la universidad/admin lo aprueba o rechaza
- **PDFs** — descarga del convenio y carta de presentación/aceptación generados con pdfkit

### Seguimiento académico
- **Plan de trabajo** — objetivos, horas semanales (1–40) y rango de fechas por convenio
- **Registro de horas** — los alumnos/tutores registran horas; se valida que estén dentro del rango del plan y sin duplicados por día
- **Seguro** — compañía, póliza y cobertura; obligatorio y no vencido para activar la pasantía
- **Seguimiento (bitácora)** — registro de actividades durante la pasantía activa
- **Evaluaciones** — alumno→empresa, empresa→alumno y tutores, con etapas **intermedias** y **finales**

### Comunicación y notificaciones
- **Chat por postulación** — mensajería contextual entre participantes
- **Notificaciones** — email + notificaciones in-app + push (Web Push VAPID)
- **Calendario de pasantías** — eventos por mes (plan de trabajo, evaluaciones, firma), filtrado por rol
- **Cron de recordatorios** — tareas automáticas diarias (ver sección dedicada)

### Administración
- **Panel admin** — CRUD de usuarios con baneo, pasantías, postulaciones, convenios, auditoría
- **Auditoría** — registro automático de acciones con filtros y búsqueda
- **Panel analítico de la universidad** — dashboard con pasantías por facultad, resumen general y horas por mes

## Máquina de estados de Pasantía

```
BORRADOR ──→ PUBLICADA ──→ SELECCION ──→ ESPERA_CONVENIO ──→ ACTIVA ──→ FINALIZADA
                  │                                              │
                  └──→ CANCELADA (desde cualquier estado) ───────┘
```

### Validaciones de negocio (Fase 1)
- **Plan de trabajo**: `fechaInicio` debe ser anterior a `fechaFin`; `horasSemana` entre 1 y 40
- **Registro de horas**: la fecha debe estar dentro del rango del plan de trabajo vigente y no puede haber dos registros el mismo día (duplicados rechazados con HTTP 400)
- **Vacantes**: no se puede aceptar una postulación si ya hay `vacantes` aceptadas en la pasantía
- **Seguro**: para pasar una pasantía a `ACTIVA`, la postulación debe tener seguro cargado con `coberturaHasta` no vencido

## Modelo de datos

| Modelo | Descripción |
|--------|-------------|
| `Empresa` | Persona jurídica que ofrece pasantías (estado PENDIENTE/VALIDADA/RECHAZADA) |
| `Universidad` | Institución educativa |
| `Facultad` | Unidad académica dentro de una universidad |
| `Carrera` | Programa de estudios dentro de una facultad |
| `User` | Usuarios con rol y datos personales/académicos (`habilidades`, `cvUrl`, `materiasAprobadas`) |
| `Pasantia` | Oportunidad con estado BORRADOR/PUBLICADA/SELECCION/ESPERA_CONVENIO/ACTIVA/FINALIZADA/CANCELADA y `vacantes` |
| `Postulacion` | Postulación de alumno a pasantía, con estados PENDIENTE/REVISADO/ACEPTADO/RECHAZADO y tutores asignados |
| `Convenio` | Convenio tripartito con 3 firmas: booleano + **hash SHA-256** + **fecha** por parte |
| `PlanTrabajo` | Objetivos, horas semanales y rango de fechas por convenio |
| `RegistroHoras` | Horas registradas por día dentro de un convenio |
| `ConvenioMarco` | Convenio marco entre universidad y empresa (estado SOLICITADO/ACTIVO/RECHAZADO) |
| `Seguro` | Cobertura de ART/seguro vinculada a la postulación |
| `Evaluacion` | Evaluación por tipo (intermedia/final) y autor (alumno, empresa, tutor) |
| `Seguimiento` | Bitácora de actividades del convenio |
| `Conversacion` / `Mensaje` | Chat vinculado a una postulación |
| `Documento` | Archivo o enlace por tipo, vinculado a usuario/postulación |
| `Notificacion` | Notificaciones in-app |
| `PushSubscription` | Suscripciones para notificaciones push |
| `AuditLog` | Registro de auditoría indexado por usuario, acción, tabla y fecha |

### Enums relevantes

| Enum | Valores |
|------|---------|
| `Role` | ESTUDIANTE, EMPRESA, UNIVERSIDAD, TUTOR_EMPRESA, TUTOR_ACADEMICO, ADMIN |
| `EstadoPasantia` | BORRADOR, PUBLICADA, SELECCION, ESPERA_CONVENIO, ACTIVA, FINALIZADA, CANCELADA |
| `PostulacionEstado` | PENDIENTE, REVISADO, ACEPTADO, RECHAZADO |
| `EvaluacionTipo` | EMPRESA_A_ALUMNO, ALUMNO_A_EMPRESA, TUTOR, INTERMEDIO_ALUMNO, INTERMEDIO_EMPRESA, FINAL_ALUMNO, FINAL_EMPRESA |
| `TipoDocumento` | CV, DNI, ANALITICO, ALUMNO_REGULAR, CONVENIO, SEGURO |

## Variables de entorno

### Base de datos

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@host:5432/pasantia?schema=public` |

### Autenticación

| Variable | Descripción |
|----------|-------------|
| `AUTH_SECRET` | Secreto JWT. Generar con `openssl rand -base64 32` |
| `AUTH_URL` | URL base de la app |
| `NEXTAUTH_URL` | URL base de la app (alias) |
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

### Notificaciones push y cron

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave pública VAPID. Generar con `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID |
| `CRON_SECRET` | Token que protege `GET /api/cron`. Generar con `openssl rand -hex 32` |

## Desarrollo local

```bash
# Requisitos: Node.js 20+, PostgreSQL

git clone https://github.com/brandall2021/pasantias.git
cd pasantias
npm install
cp .env.example .env
# Editar .env con tus datos (DATABASE_URL, AUTH_SECRET, CRON_SECRET, ...)

npm run prisma migrate dev
npm run prisma db seed
npm run dev
```

**Importante:** Usar `npm run prisma` en lugar de `npx prisma` (Prisma v6).

### Tests

```bash
npm test
```

Suite de tests unitarios con **Vitest** (`tests/`) sobre las validaciones de negocio, con
repositorios mockeados (no requiere base de datos):

| Archivo | Cubre |
|---------|-------|
| `tests/plan-trabajo.service.test.ts` | Rango de fechas del plan, horas semanales 1–40, registros fuera de rango, duplicados por día, notificaciones |
| `tests/pasantia.service.test.ts` | Transiciones de estado, rol para publicar, firmas del convenio, seguro obligatorio y vigencia para ACTIVA |
| `tests/postulaciones.route.test.ts` | Autorización del PATCH, cupo de vacantes (400 cuando está lleno) |

### Proxy / protección de rutas

El proyecto usa un **proxy** (`src/proxy.ts`, reemplaza al `middleware.ts` deprecado en Next.js 16).
Protege las siguientes rutas:

`/admin`, `/perfil`, `/chat`, `/universidad`, `/tutor-academico`, `/tutor-empresa`, `/notificaciones`, `/calendario`

### Migraciones manuales (si no usás `migrate dev`)

```bash
npx prisma db execute --schema prisma/schema.prisma --file <migracion.sql>
npx prisma migrate resolve --applied <nombre_de_migracion>
npx prisma generate
```

## Despliegue con Docker (Dokploy)

```bash
docker build -t pasantias .
```

El Dockerfile multi-stage produce una imagen standalone optimizada con Prisma CLI incluido.
Las migraciones se aplican automáticamente al iniciar el contenedor via `prisma migrate deploy`.

Pasos en Dokploy:
1. Crear la aplicación con el repositorio `github.com:brandall2021/pasantias.git`
2. Configurar las variables de entorno (`.env.example` como base, incluyendo `CRON_SECRET`)
3. Publicar el contenedor en el puerto 3000 y apuntar el dominio `pasantia.softgroup.com.ar`

### Cron de recordatorios

El endpoint `GET /api/cron?token=<CRON_SECRET>` ejecuta 4 tareas de recordatorio. Se recomienda
agendar la ejecución diaria con cron del host:

```sh
# Todos los días a las 8:00 AM
0 8 * * * curl -fsS "https://pasantia.softgroup.com.ar/api/cron?token=<CRON_SECRET>" > /dev/null 2>&1
```

**Tareas que ejecuta** (`src/services/cron.service.ts`):

| Tarea | Acción |
|-------|--------|
| Convenios pendientes | Notifica + email a alumnos con convenio sin firmar (mayor a 15 días) |
| Evaluaciones próximas | Notifica a alumno y tutores cuando una evaluación vence dentro de 7 días |
| Planes a vencer | Notifica + email a alumno y tutores cuando el plan termina dentro de 15 días |
| Horas excedidas | Alerta si una semana supera las `horasSemana` del plan de trabajo |

## Rutas del frontend

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro |
| `/pasantias` | Público | Catálogo de pasantías activas |
| `/pasantias/[id]` | Público | Detalle de pasantía |
| `/perfil` | Auth | Perfil personal + historial laboral |
| `/perfil/pasantias` | Empresa | Mis pasantías + convenios marco |
| `/perfil/pasantias/nueva` | Empresa | Crear pasantía |
| `/perfil/pasantias/[id]` | Empresa | Editar pasantía (máquina de estados) |
| `/perfil/postulaciones` | Estudiante | Mis postulaciones + PDFs y firma de convenio |
| `/perfil/postulaciones-recibidas` | Empresa | Postulaciones recibidas + firma de convenio |
| `/perfil/documentos` | Estudiante | Gestión de documentos |
| `/perfil/evaluaciones` | Alumno/Empresa/Tutor | Evaluar pasantías finalizadas y ver mis evaluaciones |
| `/calendario` | Auth | Calendario de eventos por mes (plan, evaluaciones, firma) |
| `/tutor-academico` | Tutor académico | Plan de trabajo, horas, seguimiento, convenios por firmar |
| `/tutor-empresa` | Tutor empresa | Ídem tutor académico (lado empresa) |
| `/universidad` | Universidad | Dashboard: convenios, pasantías, seguros, convenios marco |
| `/universidad/reportes` | Universidad/Admin | Panel analítico (facultades, resumen, horas/mes) + reporte PDF |
| `/admin` | Admin | Dashboard |
| `/admin/usuarios` | Admin | CRUD usuarios |
| `/admin/usuarios/[id]` | Admin | Detalle usuario |
| `/admin/pasantias` | Admin | Todas las pasantías |
| `/admin/postulaciones` | Admin | Todas las postulaciones |
| `/admin/auditoria` | Admin | Registro de actividad |
| `/notificaciones` | Auth | Notificaciones in-app |
| `/recuperar` | Público | Recuperar contraseña |
| `/restablecer/[token]` | Público | Restablecer contraseña |

## API endpoints principales

### Autenticación y catálogo

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/register` | - | Registro |
| POST | `/api/auth/*` | - | NextAuth |
| GET | `/api/pasantias` | - | Listar activas |
| POST | `/api/pasantias` | Empresa | Crear pasantía |
| GET/PATCH | `/api/pasantias/[id]` | Auth | Detalle/editar |
| GET | `/api/empresas` | - | Listar empresas |
| GET | `/api/universidades` | - | Listar universidades |
| GET | `/api/facultades` | - | Listar facultades |
| GET | `/api/carreras` | - | Listar carreras |
| PATCH | `/api/instituciones` | Auth | Actualizar perfil propio |

### Postulaciones y convenios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/postulaciones` | Estudiante | Postularse (valida vacantes y documentos) |
| PATCH | `/api/postulaciones` | Empresa/Admin | Cambiar estado (ACEPTADO valida vacantes) |
| PATCH | `/api/postulaciones/[id]/convenio` | Auth | Firmar convenio (firma electrónica) |
| PATCH | `/api/postulaciones/[id]/seguimiento` | Auth | Agregar bitácora |
| PATCH | `/api/postulaciones/[id]/evaluacion` | Auth | Evaluar (intermedia/final) |
| POST/GET | `/api/seguros` | Auth | Cargar seguro de la postulación |
| POST/GET | `/api/planes-trabajo` | Auth | Plan de trabajo del convenio |
| POST/GET | `/api/registro-horas` | Auth | Registrar horas (valida rango y duplicados) |
| POST/GET/PATCH | `/api/convenios-marco` | Empresa/Univ/Admin | Solicitar / aprobar / listar convenios marco |

### Documentos y PDFs

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET/POST | `/api/documentos` | Auth | Gestionar docs |
| POST | `/api/uploads` | Auth | Subir archivo (form-data `file`, `tipo`) |
| GET | `/api/uploads/[archivo]` | - | Servir archivo subido |
| GET | `/api/pdf/convenio?postulacionId=` | Auth | Descargar convenio en PDF |
| GET | `/api/pdf/reportes` | Universidad/Admin | Reporte de gestión en PDF |
| GET | `/api/carta?postulacionId=&tipo=presentacion\|aceptacion` | Auth | Carta de presentación/aceptación |

### Chat, notificaciones y auditoría

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET/POST | `/api/chat` | Auth | Mensajería |
| GET | `/api/notificaciones` | Auth | Listar notificaciones |
| POST | `/api/notificaciones/subscribe` | Auth | Suscripción a notificaciones push |
| GET | `/api/auditoria` | Admin | Auditoría |

### Analítica y cron

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/cron?token=<CRON_SECRET>` | Token | Ejecutar recordatorios automáticos |

> El panel analítico de `/universidad/reportes` consume `AnalyticsService` directamente (server component); no hay API pública de analytics.

### Admin

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| PATCH | `/api/admin/pasantias/[id]` | Admin | Moderar |
| PATCH | `/api/admin/usuarios/[id]` | Admin | Banear |
| PATCH | `/api/admin/empresas/[id]` | Admin | Validar/rechazar empresa |

## Flujo del Convenio Tripartito

1. Estudiante se postula → estado PENDIENTE
2. Empresa revisa y acepta → ACEPTADO (valida cupo de vacantes)
3. Se cargan los tutores y el seguro de la postulación
4. Las 3 partes firman electrónicamente el convenio:
   - **Estudiante** desde `/perfil/postulaciones`
   - **Empresa** desde `/perfil/postulaciones-recibidas`
   - **Universidad/Admin** desde `/universidad` o `/admin/postulaciones`
   - Cada firma guarda un **hash SHA-256** + **fecha** (`firmaAlumnoHash`, `firmaEmpresaHash`, `firmaUniversidadHash`)
5. Cuando los 3 han firmado, se puede cambiar la pasantía a ACTIVA (requiere seguro vigente)
6. Durante la pasantía activa: **plan de trabajo**, **registro de horas**, **seguimientos** (bitácora)
7. Al finalizar, las partes realizan **evaluaciones intermedias y finales**
8. La universidad puede descargar el **convenio en PDF** y la **carta** correspondiente

## Convenio Marco (universidad-empresa)

1. La empresa solicita un convenio marco desde `/perfil/pasantias` → estado `SOLICITADO`
2. La universidad o el admin lo aprueba o rechaza desde `/universidad` → `ACTIVO` / `RECHAZADO`
3. El estado se muestra con badges en el listado de la empresa

## Credenciales de prueba (seed)

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@pasantias.com | 123456 |
| TechCorp (empresa) | techcorp@pasantias.com | 123456 |
| Estudio Jurídico (empresa) | estudio@pasantias.com | 123456 |
| Universidad Nacional | universidad@pasantias.com | 123456 |
| Estudiante 1 | estudiante1@pasantias.com | 123456 |
| Estudiante 2 | estudiante2@pasantias.com | 123456 |
