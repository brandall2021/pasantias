-- AlterTable
ALTER TABLE "Pasantia" ADD COLUMN     "unidadAcademicaId" TEXT;

-- AddForeignKey
ALTER TABLE "Pasantia" ADD CONSTRAINT "Pasantia_unidadAcademicaId_fkey" FOREIGN KEY ("unidadAcademicaId") REFERENCES "Institucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
