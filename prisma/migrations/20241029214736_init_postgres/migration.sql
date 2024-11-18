-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'VENDEDOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_usuario" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombre_cliente" VARCHAR(100) NOT NULL,
    "cedula" VARCHAR(20) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id_factura" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pago_efectivo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pago_tarjeta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pago_transferencia" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "id_cliente" INTEGER NOT NULL,
    "id_orden_servicio" INTEGER,
    "id_venta_directa" INTEGER,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "MotoCliente" (
    "id_moto_cliente" SERIAL NOT NULL,
    "marca" VARCHAR(50) NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,
    "ano" INTEGER NOT NULL,
    "placa" VARCHAR(20) NOT NULL,
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "MotoCliente_pkey" PRIMARY KEY ("id_moto_cliente")
);

-- CreateTable
CREATE TABLE "OrdenServicio" (
    "id_orden_servicio" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(50) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "adelanto_efectivo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adelanto_tarjeta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adelanto_transferencia" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "guardar_cascos" BOOLEAN NOT NULL,
    "guardar_papeles" BOOLEAN NOT NULL,
    "observaciones" TEXT NOT NULL,
    "mecanico" VARCHAR(100) NOT NULL DEFAULT 'Por asignar',
    "id_moto_cliente" INTEGER NOT NULL,

    CONSTRAINT "OrdenServicio_pkey" PRIMARY KEY ("id_orden_servicio")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id_servicio" SERIAL NOT NULL,
    "nombre_servicio" VARCHAR(255) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "ServicioOrdenServicio" (
    "id_orden_servicio" INTEGER NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ServicioOrdenServicio_pkey" PRIMARY KEY ("id_orden_servicio","id_servicio")
);

-- CreateTable
CREATE TABLE "VentaDirecta" (
    "id_venta" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pago_efectivo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pago_tarjeta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pago_transferencia" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "VentaDirecta_pkey" PRIMARY KEY ("id_venta")
);

-- CreateTable
CREATE TABLE "MarcaRepuesto" (
    "id_marca" SERIAL NOT NULL,
    "nombre_marca" VARCHAR(50) NOT NULL,

    CONSTRAINT "MarcaRepuesto_pkey" PRIMARY KEY ("id_marca")
);

-- CreateTable
CREATE TABLE "Repuesto" (
    "id_repuesto" SERIAL NOT NULL,
    "codigo_barras" VARCHAR(50) NOT NULL,
    "nombre_repuesto" VARCHAR(100) NOT NULL,
    "valor_unitario" DECIMAL(12,2) NOT NULL,
    "ubicacion" VARCHAR(100) NOT NULL DEFAULT 'Bodega',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "id_marca" INTEGER NOT NULL,

    CONSTRAINT "Repuesto_pkey" PRIMARY KEY ("id_repuesto")
);

-- CreateTable
CREATE TABLE "RepuestoVenta" (
    "id_venta" INTEGER NOT NULL,
    "id_repuesto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "RepuestoVenta_pkey" PRIMARY KEY ("id_venta","id_repuesto")
);

-- CreateTable
CREATE TABLE "RepuestoOrdenServicio" (
    "id_orden_servicio" INTEGER NOT NULL,
    "id_repuesto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "RepuestoOrdenServicio_pkey" PRIMARY KEY ("id_orden_servicio","id_repuesto")
);

-- CreateTable
CREATE TABLE "MotoMercado" (
    "id_moto_mercado" SERIAL NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,

    CONSTRAINT "MotoMercado_pkey" PRIMARY KEY ("id_moto_mercado")
);

-- CreateTable
CREATE TABLE "MotoRepuesto" (
    "id_moto_mercado" INTEGER NOT NULL,
    "id_repuesto" INTEGER NOT NULL,

    CONSTRAINT "MotoRepuesto_pkey" PRIMARY KEY ("id_moto_mercado","id_repuesto")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre_proveedor" VARCHAR(100) NOT NULL,
    "nit" VARCHAR(20) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "asesor" VARCHAR(100) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "ProveedorRepuesto" (
    "id_proveedor" INTEGER NOT NULL,
    "id_repuesto" INTEGER NOT NULL,

    CONSTRAINT "ProveedorRepuesto_pkey" PRIMARY KEY ("id_proveedor","id_repuesto")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cedula_key" ON "Cliente"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_correo_key" ON "Cliente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_id_orden_servicio_key" ON "Factura"("id_orden_servicio");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_id_venta_directa_key" ON "Factura"("id_venta_directa");

-- CreateIndex
CREATE UNIQUE INDEX "MotoCliente_placa_key" ON "MotoCliente"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_nombre_servicio_key" ON "Servicio"("nombre_servicio");

-- CreateIndex
CREATE UNIQUE INDEX "MarcaRepuesto_nombre_marca_key" ON "MarcaRepuesto"("nombre_marca");

-- CreateIndex
CREATE UNIQUE INDEX "Repuesto_codigo_barras_key" ON "Repuesto"("codigo_barras");

-- CreateIndex
CREATE UNIQUE INDEX "MotoMercado_modelo_key" ON "MotoMercado"("modelo");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_nit_key" ON "Proveedor"("nit");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_id_orden_servicio_fkey" FOREIGN KEY ("id_orden_servicio") REFERENCES "OrdenServicio"("id_orden_servicio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_id_venta_directa_fkey" FOREIGN KEY ("id_venta_directa") REFERENCES "VentaDirecta"("id_venta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotoCliente" ADD CONSTRAINT "MotoCliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenServicio" ADD CONSTRAINT "OrdenServicio_id_moto_cliente_fkey" FOREIGN KEY ("id_moto_cliente") REFERENCES "MotoCliente"("id_moto_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioOrdenServicio" ADD CONSTRAINT "ServicioOrdenServicio_id_orden_servicio_fkey" FOREIGN KEY ("id_orden_servicio") REFERENCES "OrdenServicio"("id_orden_servicio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioOrdenServicio" ADD CONSTRAINT "ServicioOrdenServicio_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "Servicio"("id_servicio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDirecta" ADD CONSTRAINT "VentaDirecta_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repuesto" ADD CONSTRAINT "Repuesto_id_marca_fkey" FOREIGN KEY ("id_marca") REFERENCES "MarcaRepuesto"("id_marca") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepuestoVenta" ADD CONSTRAINT "RepuestoVenta_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "VentaDirecta"("id_venta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepuestoVenta" ADD CONSTRAINT "RepuestoVenta_id_repuesto_fkey" FOREIGN KEY ("id_repuesto") REFERENCES "Repuesto"("id_repuesto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepuestoOrdenServicio" ADD CONSTRAINT "RepuestoOrdenServicio_id_orden_servicio_fkey" FOREIGN KEY ("id_orden_servicio") REFERENCES "OrdenServicio"("id_orden_servicio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepuestoOrdenServicio" ADD CONSTRAINT "RepuestoOrdenServicio_id_repuesto_fkey" FOREIGN KEY ("id_repuesto") REFERENCES "Repuesto"("id_repuesto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotoRepuesto" ADD CONSTRAINT "MotoRepuesto_id_moto_mercado_fkey" FOREIGN KEY ("id_moto_mercado") REFERENCES "MotoMercado"("id_moto_mercado") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotoRepuesto" ADD CONSTRAINT "MotoRepuesto_id_repuesto_fkey" FOREIGN KEY ("id_repuesto") REFERENCES "Repuesto"("id_repuesto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProveedorRepuesto" ADD CONSTRAINT "ProveedorRepuesto_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "Proveedor"("id_proveedor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProveedorRepuesto" ADD CONSTRAINT "ProveedorRepuesto_id_repuesto_fkey" FOREIGN KEY ("id_repuesto") REFERENCES "Repuesto"("id_repuesto") ON DELETE CASCADE ON UPDATE CASCADE;
