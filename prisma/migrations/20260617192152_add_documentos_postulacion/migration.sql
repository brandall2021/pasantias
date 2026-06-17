-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "postulacionId" TEXT;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_postulacionId_fkey" FOREIGN KEY ("postulacionId") REFERENCES "Postulacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
