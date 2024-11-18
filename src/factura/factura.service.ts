import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacturaService {
  constructor(private prisma: PrismaService) {}

 async findAll(page: number, limit?: number, search: string = '') {
    const skip = limit ? (page - 1) * limit : undefined;

    const [facturas, total] = await Promise.all([
      this.prisma.factura.findMany({
        where: {
          OR: [
            { id_factura: { equals: parseInt(search) || undefined } },
            { cliente: { nombre_cliente: { contains: search } } },
          ],
        },
        include: {
          cliente: true,
          orden_servicio: {
            include: {
              moto_cliente: true,
              servicios: { include: { servicio: true } },
              repuestos: { include: { repuesto: { include: { marca: true } } } },
            },
          },
          venta_directa: {
            include: {
              cliente: true,
              repuestos: { include: { repuesto: { include: { marca: true } } } },
            },
          },
        },
        orderBy: {
          fecha: 'desc',
        },
        skip,
        ...(limit && { take: Number(limit) }),
      }),
      this.prisma.factura.count({
        where: {
          OR: [
            { id_factura: { equals: parseInt(search) || undefined } },
            { cliente: { nombre_cliente: { contains: search } } },
          ],
        },
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;

    return {
      facturas,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.prisma.factura.findUnique({
      where: { id_factura: id },
      include: {
        cliente: true,
        orden_servicio: {
          include: {
            moto_cliente: true,
            servicios: { include: { servicio: true } },
            repuestos: { include: { repuesto: { include: { marca: true } } } },
          },
        },
        venta_directa: {
          include: {
            cliente: true,
            repuestos: { include: { repuesto: { include: { marca: true } } } },
          },
        },
      },
    });
  }
}
