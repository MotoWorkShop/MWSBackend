-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrdenServicio" ADD COLUMN     "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "VentaDirecta" ADD COLUMN     "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0;
