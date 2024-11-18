import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProveedorService {
  constructor(private prisma: PrismaService) {}

  private calculateRemainingDays(fechaVencimiento: Date): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Establecer la hora a 00:00:00
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(23, 59, 59, 999); // Establecer la hora a 23:59:59.999
    
    const diasCreditoRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diasCreditoRestantes, 0);
  }

  async findAll(page = 1, limit?: number, search: string = '') {
    const skip = limit ? (page - 1) * limit : undefined;

    const searchConditions = search
      ? {
          OR: [
            { nit: { contains: search } },
            { nombre_proveedor: { contains: search} },
          ],
        }
      : {};

    const [proveedores, total] = await Promise.all([
      this.prisma.proveedor.findMany({
      where: {
        ...searchConditions,
        OR: [
        { nit: { contains: search, mode: 'insensitive' } },
        { nombre_proveedor: { contains: search, mode: 'insensitive' } },
        ],
      },
      include: {
        repuestos: {
        include: {
          repuesto: true,
        },
        },
      },
      orderBy: {
        fecha_vencimiento: 'asc',
      },
      skip,
      ...(limit && { take: Number(limit) }),
      }),
      this.prisma.proveedor.count({
      where: {
        ...searchConditions,
        OR: [
        { nit: { contains: search, mode: 'insensitive' } },
        { nombre_proveedor: { contains: search, mode: 'insensitive' } },
        ],
      },
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;

    const proveedoresConDiasRestantes = proveedores.map((proveedor) => ({
      ...proveedor,
      dias_credito_restantes: this.calculateRemainingDays(proveedor.fecha_vencimiento),
    }));

    return {
      proveedores: proveedoresConDiasRestantes,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id_proveedor: id },
      include: {
        repuestos: {
          include: { repuesto: true },
        },
      },
    });

    if (!proveedor) {
      throw new ConflictException('Proveedor no encontrado');
    }

    return {
      ...proveedor,
      dias_credito_restantes: this.calculateRemainingDays(proveedor.fecha_vencimiento),
    };
  }

  async create(data: any) {
    const existingProveedor = await this.prisma.proveedor.findUnique({
      where: { nit: data.nit },
    });
    if (existingProveedor) {
      throw new ConflictException('Ya existe un proveedor con este NIT');
    }

    const existingNProveedor = await this.prisma.proveedor.findFirst({
      where: { nombre_proveedor: data.nombre_proveedor },
    });

    if (existingNProveedor) {
      throw new ConflictException('Ya existe un proveedor con este nombre');
    }

    const existingTProveedor = await this.prisma.proveedor.findFirst({
      where: { telefono: data.telefono },
    });

    if (existingTProveedor) {
      throw new ConflictException('Ya existe un proveedor con este teléfono');
    }

    const proveedor = await this.prisma.proveedor.create({
      data: {
        nombre_proveedor: data.nombre_proveedor,
        nit: data.nit,
        telefono: data.telefono,
        asesor: data.asesor,
        fecha_vencimiento: new Date(data.fecha_vencimiento + 'T23:59:59'),
      },
    });

    if (data.repuestos && data.repuestos.length > 0) {
      const relacionesRepuesto = data.repuestos.map((repuestoId: number) => ({
        id_proveedor: proveedor.id_proveedor,
        id_repuesto: repuestoId,
      }));
      await this.prisma.proveedorRepuesto.createMany({ data: relacionesRepuesto });
    }
    return proveedor;
  }

  async update(id: number, data: any) {
    const existingProveedor = await this.prisma.proveedor.findFirst({
      where: {
        nit: data.nit,
        NOT: { id_proveedor: id },
      },
    });
  
    if (existingProveedor) {
      throw new ConflictException('Ya existe un proveedor con este NIT.');
    }
    const existingNProveedor = await this.prisma.proveedor.findFirst({
      where: { 
        nombre_proveedor: data.nombre_proveedor,
        NOT: { id_proveedor: id },
      },
    });

    if (existingNProveedor) {
      throw new ConflictException('Ya existe un proveedor con este nombre');
    }

    const existingTProveedor = await this.prisma.proveedor.findFirst({
      where: { 
        telefono: data.telefono,
        NOT: { id_proveedor: id },
      },
    });

    if (existingTProveedor) {
      throw new ConflictException('Ya existe un proveedor con este teléfono');
    }

    console.log('Actualizando proveedor...');
    const proveedorActualizado = await this.prisma.proveedor.update({
      where: { id_proveedor: id },
      data: {
        nombre_proveedor: data.nombre_proveedor,
        nit: data.nit,
        telefono: data.telefono,
        asesor: data.asesor,
        fecha_vencimiento: new Date(data.fecha_vencimiento + 'T23:59:59'),
      },
    });

    console.log('Proveedor actualizado:', proveedorActualizado);

    await this.prisma.proveedorRepuesto.deleteMany({
      where: { id_proveedor: id },
    });

    if (data.repuestos && data.repuestos.length > 0) {
      const repuestosProveedor = data.repuestos.map((repuestoId: number) => ({
        id_proveedor: id,
        id_repuesto: repuestoId,
      }));

      console.log('Creando nuevas relaciones proveedor-repuestos...');
      await this.prisma.proveedorRepuesto.createMany({
        data: repuestosProveedor,
      });
      console.log('Nuevas relaciones proveedor-repuestos creadas.');
    }

    return proveedorActualizado;
  }

  async remove(id: number) {
    await this.prisma.proveedorRepuesto.deleteMany({
      where: { id_proveedor: id },
    });
    return this.prisma.proveedor.delete({
      where: { id_proveedor: id },
    });
  }
}