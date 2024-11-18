-- AlterTable
ALTER TABLE "OrdenServicio" ADD COLUMN     "vendedor" VARCHAR(100) NOT NULL DEFAULT 'Por asignar';

-- AlterTable
ALTER TABLE "VentaDirecta" ADD COLUMN     "vendedor" VARCHAR(100) NOT NULL DEFAULT 'Por asignar';
