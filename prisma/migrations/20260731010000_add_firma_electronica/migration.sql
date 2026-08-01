ALTER TABLE "Convenio" ADD COLUMN "firmaAlumnoHash" TEXT;
ALTER TABLE "Convenio" ADD COLUMN "firmaEmpresaHash" TEXT;
ALTER TABLE "Convenio" ADD COLUMN "firmaUniversidadHash" TEXT;
ALTER TABLE "Convenio" ADD COLUMN "firmaAlumnoFecha" TIMESTAMP(3);
ALTER TABLE "Convenio" ADD COLUMN "firmaEmpresaFecha" TIMESTAMP(3);
ALTER TABLE "Convenio" ADD COLUMN "firmaUniversidadFecha" TIMESTAMP(3);
