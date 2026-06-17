-- AlterTable
ALTER TABLE "Postulacion" ADD COLUMN     "convenioCompletado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "convenioEmpresaUrl" TEXT,
ADD COLUMN     "convenioEstudianteUrl" TEXT,
ADD COLUMN     "convenioInstitucionUrl" TEXT;
