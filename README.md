# Gestión de Pasantías

Plataforma web para publicar, buscar y postularse a pasantías. Conecta instituciones con estudiantes.

## Tecnologías

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Estilos:** Tailwind CSS v4
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth v5 (Credentials, JWT)
- **Despliegue:** Docker multi-stage para Dokploy

## Roles

| Rol | Descripción |
|-----|-------------|
| **ESTUDIANTE** | Busca pasantías, se postula, chatea con instituciones, deja reseñas |
| **INSTITUCION** | Publica pasantías, revisa postulaciones, chatea con estudiantes |
| **ADMIN** | Administra usuarios, pasantías, reportes y postulaciones |

## Funcionalidades

- Landing page con pasantías destacadas e instituciones
- Registro y login con roles
- Búsqueda de pasantías por área, modalidad y texto
- Postulación con mensaje y link a CV
- Seguimiento de postulaciones (Pendiente / Revisado / Aceptado / Rechazado)
- Perfil de institución con sus pasantías activas
- Chat en tiempo real entre estudiantes e instituciones
- Sistema de reseñas y valoraciones (1-5 estrellas)
- Panel administrativo completo
- Reportes y denuncias

## Modelo de datos

- `User` — usuarios con rol (ESTUDIANTE, INSTITUCION, ADMIN)
- `Institucion` — perfil extendido de instituciones
- `Pasantia` — publicaciones de pasantías
- `Postulacion` — postulaciones de estudiantes
- `Chat` / `Mensaje` — mensajería interna
- `Resena` — valoraciones de pasantías
- `Report` — denuncias

## Desarrollo local

```bash
# 1. Clonar
git clone https://github.com/brandall2021/pasantia.git
cd pasantia

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL con tus datos de PostgreSQL

# 4. Migrar base de datos
npx prisma migrate dev

# 5. Seed con datos de prueba
npx prisma db seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

## Despliegue en Dokploy

1. Crear repositorio: `brandall2021/pasantia` (branch `main`)
2. Configurar variables de entorno en Dokploy:

   | Variable | Descripción |
   |----------|-------------|
   | `DATABASE_URL` | `postgresql://user:pass@host:5432/pasantia?schema=public` |
   | `NEXTAUTH_URL` | `https://pasantia.tudominio.com` |
   | `NEXTAUTH_SECRET` | Generar con `openssl rand -base64 32` |

3. Crear la base de datos `pasantia` en PostgreSQL
4. El Dockerfile ejecuta `prisma migrate deploy && node server.js` al iniciar

## Credenciales de prueba

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@pasantias.com | 123456 |
| Institución | techcorp@pasantias.com | 123456 |
| Institución | universidad@pasantias.com | 123456 |
| Institución | estudio@pasantias.com | 123456 |
| Estudiante | estudiante1@pasantias.com | 123456 |
| Estudiante | estudiante2@pasantias.com | 123456 |
