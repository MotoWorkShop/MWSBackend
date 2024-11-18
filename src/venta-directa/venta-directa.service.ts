import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VentaDirectaService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const searchNumber = Number(search);
    const searchConditions = search
      ? {
          OR: [
            ...((!isNaN(searchNumber)) ? [{ id_venta: searchNumber }] : []),
            { cliente: { nombre_cliente: { contains: search } } },
          ],
        }
      : {};

    const [ventasDirectas, total] = await Promise.all([
      this.prisma.ventaDirecta.findMany({
        where: searchConditions,
        orderBy: {
          fecha: 'desc',
        },
        skip,
        take: Number(limit),
        include: {
          cliente: true,
          repuestos: { include: { repuesto: true } },
          factura: true,
        },
      }),
      this.prisma.ventaDirecta.count({
        where: searchConditions,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      ventasDirectas,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.prisma.ventaDirecta.findUnique({
      where: { id_venta: id },
      include: {
        cliente: true,
        repuestos: {
          include: { repuesto: true },
        },
        factura: true,
      },
    });
  }

  async create(data: any) {
    const prisma = this.prisma;
    try {
      return await prisma.$transaction(async (tx) => {
        const existingCliente = await tx.cliente.findUnique({
          where: { id_cliente: data.id_cliente },
        });

        if (!existingCliente) {
          throw new ConflictException('El cliente no existe.');
        }

        // Validar stock de repuestos
        if (data.repuestos && data.repuestos.length > 0) {
          for (const repuesto of data.repuestos) {
            const repuestoEnStock = await tx.repuesto.findUnique({
              where: { id_repuesto: repuesto.id_repuesto },
            });

            if (!repuestoEnStock) {
              throw new ConflictException(`El repuesto con ID ${repuesto.id_repuesto} no existe.`);
            }

            if (repuestoEnStock.stock < repuesto.cantidad) {
              throw new ConflictException(`No hay suficiente stock para el repuesto: ${repuestoEnStock.nombre_repuesto}. Stock actual: ${repuestoEnStock.stock}, Cantidad requerida: ${repuesto.cantidad}`);
            }
          }
        }

        const nuevaVenta = await tx.ventaDirecta.create({
          data: {
            fecha: new Date(data.fecha),
            subtotal: data.subtotal,
            descuento: data.descuento,
            iva: data.iva,
            total: data.total,
            id_cliente: data.id_cliente,
            pago_efectivo: data.pago_efectivo,
            pago_tarjeta: data.pago_tarjeta,
            pago_transferencia: data.pago_transferencia,
            vendedor: data.vendedor,

          },
        });

        // Crear repuestos asociados y actualizar stock
        if (data.repuestos && data.repuestos.length > 0) {
          const repuestosVenta = data.repuestos.map((repuesto: any) => ({
            id_venta: nuevaVenta.id_venta,
            id_repuesto: repuesto.id_repuesto,
            cantidad: repuesto.cantidad,
            precio: repuesto.precio,
          }));

          await tx.repuestoVenta.createMany({ data: repuestosVenta });

          // Actualizar stock
          for (const repuesto of data.repuestos) {
            await tx.repuesto.update({
              where: { id_repuesto: repuesto.id_repuesto },
              data: { stock: { decrement: repuesto.cantidad } },
            });
          }
        }

        // Crear factura automáticamente
        const factura = await tx.factura.create({
          data: {
            fecha: new Date(),
            pago_efectivo: data.pago_efectivo || 0,
            pago_tarjeta: data.pago_tarjeta || 0,
            pago_transferencia: data.pago_transferencia || 0,
            descuento: data.descuento || 0,
            subtotal: data.subtotal,
            iva: data.iva,
            total: data.total,
            id_cliente: data.id_cliente,
            id_venta_directa: nuevaVenta.id_venta,
            vendedor: data.vendedor
          },
        });

        return { ...nuevaVenta, factura };
      });
    } catch (error) {
      console.error('Error al crear la venta directa:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  async update(id: number, data: any) {
    const prisma = this.prisma;
    try {
      return await prisma.$transaction(async (tx) => {
        const existingVenta = await tx.ventaDirecta.findUnique({
          where: { id_venta: id },
          include: { repuestos: true }
        });

        if (!existingVenta) {
          throw new ConflictException('La venta directa no existe.');
        }

        const existingCliente = await tx.cliente.findUnique({
          where: { id_cliente: data.id_cliente },
        });

        if (!existingCliente) {
          throw new ConflictException('El cliente no existe.');
        }

        const repuestosAnteriores = await tx.repuestoVenta.findMany({
          where: { id_venta: id },
        });

        const newRepuestosMap = new Map(
          data.repuestos ? data.repuestos.map(r => [r.id_repuesto, r]) : []
        );

        // Handle removed or updated repuestos
        for (const oldRepuesto of repuestosAnteriores) {
          const newRepuesto = newRepuestosMap.get(oldRepuesto.id_repuesto) as { cantidad: number };
          if (!newRepuesto) {
            // Repuesto was removed, return to stock
            await tx.repuesto.update({
              where: { id_repuesto: oldRepuesto.id_repuesto },
              data: { stock: { increment: oldRepuesto.cantidad } },
            });
          } else if (newRepuesto.cantidad < oldRepuesto.cantidad) {
            // Quantity decreased, return difference to stock
            await tx.repuesto.update({
              where: { id_repuesto: oldRepuesto.id_repuesto },
              data: { stock: { increment: oldRepuesto.cantidad - newRepuesto.cantidad } },
            });
          } else if (newRepuesto.cantidad > oldRepuesto.cantidad) {
            // Quantity increased, remove difference from stock
            const repuestoEnStock = await tx.repuesto.findUnique({
              where: { id_repuesto: oldRepuesto.id_repuesto },
            });
            if (repuestoEnStock.stock < (newRepuesto.cantidad - oldRepuesto.cantidad)) {
              throw new ConflictException(`No hay suficiente stock para el repuesto: ${repuestoEnStock.nombre_repuesto}. Stock actual: ${repuestoEnStock.stock}, Cantidad adicional requerida: ${newRepuesto.cantidad - oldRepuesto.cantidad}`);
            }
            await tx.repuesto.update({
              where: { id_repuesto: oldRepuesto.id_repuesto },
              data: { stock: { decrement: newRepuesto.cantidad - oldRepuesto.cantidad } },
            });
          }
        }

        // Handle new repuestos
        for (const newRepuesto of data.repuestos || []) {
          const oldRepuesto = repuestosAnteriores.find(r => r.id_repuesto === newRepuesto.id_repuesto);
          if (!oldRepuesto) {
            // New repuesto added, check and update stock
            const repuestoEnStock = await tx.repuesto.findUnique({
              where: { id_repuesto: newRepuesto.id_repuesto },
            });
            if (!repuestoEnStock) {
              throw new ConflictException(`El repuesto con ID ${newRepuesto.id_repuesto} no existe.`);
            }
            if (repuestoEnStock.stock < newRepuesto.cantidad) {
              throw new ConflictException(`No hay suficiente stock para el repuesto: ${repuestoEnStock.nombre_repuesto}. Stock actual: ${repuestoEnStock.stock}, Cantidad requerida: ${newRepuesto.cantidad}`);
            }
            await tx.repuesto.update({
              where: { id_repuesto: newRepuesto.id_repuesto },
              data: { stock: { decrement: newRepuesto.cantidad } },
            });
          }
        }

        // Update the venta
        const ventaActualizada = await tx.ventaDirecta.update({
          where: { id_venta: id },
          data: {
            fecha: new Date(data.fecha),
            subtotal: data.subtotal,
            descuento: data.descuento,
            iva: data.iva,
            total: data.total,
            id_cliente: data.id_cliente,
            pago_efectivo: data.pago_efectivo,
            pago_tarjeta: data.pago_tarjeta,
            pago_transferencia: data.pago_transferencia,
            vendedor: data.vendedor,
          },
        });

        // Update RepuestoVenta entries
        await tx.repuestoVenta.deleteMany({
          where: { id_venta: id },
        });

        if (data.repuestos && data.repuestos.length > 0) {
          for (const repuesto of data.repuestos) {
            await tx.repuestoVenta.create({
              data: {
                id_venta: id,
                id_repuesto: repuesto.id_repuesto,
                cantidad: repuesto.cantidad,
                precio: repuesto.precio,
              },
            });
          }
        }

        // Update the associated invoice
        const facturaActualizada = await tx.factura.update({
          where: { id_venta_directa: id },
          data: {
            fecha: new Date(data.fecha),
            pago_efectivo: data.pago_efectivo || 0,
            pago_tarjeta: data.pago_tarjeta || 0,
            pago_transferencia: data.pago_transferencia || 0,
            subtotal: data.subtotal,
            descuento: data.descuento,
            iva: data.iva,
            total: data.total,
            vendedor: data.vendedor,
          },
        });

        return { ...ventaActualizada, factura: facturaActualizada };
      });
    } catch (error) {
      console.error('Error al actualizar la venta directa:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const repuestosAsociados = await tx.repuestoVenta.findMany({
          where: { id_venta: id },
        });

        // Devolver stock de repuestos antes de eliminar la venta
        for (const repuesto of repuestosAsociados) {
          await tx.repuesto.update({
            where: { id_repuesto: repuesto.id_repuesto },
            data: { stock: { increment: repuesto.cantidad } },
          });
        }

        // Eliminar repuestos asociados
        await tx.repuestoVenta.deleteMany({
          where: { id_venta: id },
        });

        // Eliminar la factura asociada
        await tx.factura.delete({
          where: { id_venta_directa: id },
        });

        // Eliminar la venta
        const ventaEliminada = await tx.ventaDirecta.delete({
          where: { id_venta: id },
        });

        return ventaEliminada;
      });
    } catch (error) {
      console.error('Error al eliminar la venta directa:', error);
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }
}