-- AlterEnum
ALTER TYPE "TipoDocumento" ADD VALUE 'ANALITICO_PARCIAL';
ALTER TYPE "TipoDocumento" ADD VALUE 'SALUD';
ALTER TYPE "TipoDocumento" ADD VALUE 'OTRO';

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN "nombre" TEXT;
