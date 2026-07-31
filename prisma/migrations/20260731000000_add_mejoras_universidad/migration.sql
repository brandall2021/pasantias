-- AlterEnum
ALTER TYPE "EvaluacionTipo" ADD VALUE IF NOT EXISTS 'INTERMEDIO_ALUMNO';
ALTER TYPE "EvaluacionTipo" ADD VALUE IF NOT EXISTS 'INTERMEDIO_EMPRESA';
ALTER TYPE "EvaluacionTipo" ADD VALUE IF NOT EXISTS 'FINAL_ALUMNO';
ALTER TYPE "EvaluacionTipo" ADD VALUE IF NOT EXISTS 'FINAL_EMPRESA';

-- AlterTable: add fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "habilidades" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cvUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "materiasAprobadas" TEXT;

-- CreateTable: PlanTrabajo
CREATE TABLE "PlanTrabajo" (
    "id" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "horasSemana" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "convenioId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "PlanTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RegistroHoras
CREATE TABLE "RegistroHoras" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horas" INTEGER NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convenioId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "RegistroHoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ConvenioMarco
CREATE TABLE "ConvenioMarco" (
    "id" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "archivo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "universidadId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "ConvenioMarco_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Seguro
CREATE TABLE "Seguro" (
    "id" TEXT NOT NULL,
    "compania" TEXT NOT NULL,
    "poliza" TEXT NOT NULL,
    "coberturaDesde" TIMESTAMP(3) NOT NULL,
    "coberturaHasta" TIMESTAMP(3) NOT NULL,
    "archivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postulacionId" TEXT NOT NULL,

    CONSTRAINT "Seguro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConvenioMarco_universidadId_empresaId_key" ON "ConvenioMarco"("universidadId", "empresaId");
CREATE UNIQUE INDEX "Seguro_postulacionId_key" ON "Seguro"("postulacionId");

-- AddForeignKey
ALTER TABLE "PlanTrabajo" ADD CONSTRAINT "PlanTrabajo_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanTrabajo" ADD CONSTRAINT "PlanTrabajo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RegistroHoras" ADD CONSTRAINT "RegistroHoras_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "Convenio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RegistroHoras" ADD CONSTRAINT "RegistroHoras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConvenioMarco" ADD CONSTRAINT "ConvenioMarco_universidadId_fkey" FOREIGN KEY ("universidadId") REFERENCES "Universidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConvenioMarco" ADD CONSTRAINT "ConvenioMarco_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Seguro" ADD CONSTRAINT "Seguro_postulacionId_fkey" FOREIGN KEY ("postulacionId") REFERENCES "Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
