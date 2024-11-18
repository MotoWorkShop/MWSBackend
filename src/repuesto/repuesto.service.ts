import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepuestoService {
  constructor(private prisma: PrismaService) {}


  async findAll(page: number, limit?: number, search: string = '') {
    const skip = limit ? (page - 1) * limit : undefined;

    const [repuestos, total] = await Promise.all([
      this.prisma.repuesto.findMany({
        where: {
          OR: [
            { nombre_repuesto: { contains: search,mode:'insensitive' } },
            { codigo_barras: { contains: search } },
            {motos_mercado: {some: {moto_mercado: {modelo: {contains: search , mode:'insensitive'}}}}},
          ],
        },
        include: {
          marca: true,
          motos_mercado: {
            include: { moto_mercado: true },
          },
          proveedores: {
            include: { proveedor: true },
          },
        },
        orderBy: {
          nombre_repuesto: 'asc',
        },
        skip,
        ...(limit && { take: Number(limit) }),
      }),
      this.prisma.repuesto.count({
        where: {
          OR: [
            { nombre_repuesto: { contains: search } },
            { codigo_barras: { contains: search } },
          ],
        },
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;

    return {
      repuestos,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    const repuesto = await this.prisma.repuesto.findUnique({
      where: { id_repuesto: id },
      include: {
        marca: true,
        motos_mercado: {
          include: { moto_mercado: true },
        },
        proveedores: {
          include: { proveedor: true },
        },
      },
    });

    if (!repuesto) {
      throw new NotFoundException('Repuesto no encontrado');
    }

    return repuesto;
  }

async create(data: any) {
  console.log('Datos recibidos en create:', data);

  // Verifica si ya existe un repuesto con el mismo código de barras
  const existingRepuesto = await this.prisma.repuesto.findUnique({
    where: { codigo_barras: data.codigo_barras },
  });

  if (existingRepuesto) {
    throw new ConflictException('Ya existe un repuesto con este código de barras.');
  }

  // Verifica que el stock inicial no sea negativo
  if (data.stock < 0) {
    throw new ConflictException('El stock no puede ser negativo.');
  }

  // Crea el repuesto
  const newRepuesto = await this.prisma.repuesto.create({
    data: {
      codigo_barras: data.codigo_barras,
      nombre_repuesto: data.nombre_repuesto,
      valor_compra: data.valor_compra,
      valor_unitario: data.valor_unitario,
      ubicacion: data.ubicacion,
      stock: data.stock,
      id_marca: data.id_marca,
    },
  });

  // Crea relaciones en la tabla intermedia MotoRepuesto si hay motos asociadas
  if (data.motos_mercado && data.motos_mercado.length > 0) {
    await this.prisma.motoRepuesto.createMany({
      data: data.motos_mercado.map((motoId: number) => ({
        id_moto_mercado: motoId,
        id_repuesto: newRepuesto.id_repuesto,
      })),
    });
  }

  // Crea relaciones en la tabla intermedia ProveedorRepuesto si hay proveedores asociados
  if (data.proveedores && data.proveedores.length > 0) {
    await this.prisma.proveedorRepuesto.createMany({
      data: data.proveedores.map((proveedorId: number) => ({
        id_proveedor: proveedorId,
        id_repuesto: newRepuesto.id_repuesto,
      })),
    });
  }

  return newRepuesto;
}

async update(id: number, data: any) {
  console.log('Datos recibidos en update:', data);

  // Verifica si el repuesto existe
  const existingRepuesto = await this.prisma.repuesto.findUnique({
    where: { id_repuesto: id },
  });

  if (!existingRepuesto) {
    throw new NotFoundException('Repuesto no encontrado');
  }

  // Si el campo `stock` está presente en los datos actualizados
  if (typeof data.stock !== 'undefined') {
    const nuevoStock = existingRepuesto.stock + (data.stock - existingRepuesto.stock);

    // Verifica si el nuevo stock será negativo
    if (nuevoStock < 0) {
      throw new ConflictException('El stock no puede ser negativo.');
    }
  }

  // Actualiza el repuesto
  const updatedRepuesto = await this.prisma.repuesto.update({
    where: { id_repuesto: id },
    data: {
      codigo_barras: data.codigo_barras,
      nombre_repuesto: data.nombre_repuesto,
      valor_compra: data.valor_compra,
      valor_unitario: data.valor_unitario,
      ubicacion: data.ubicacion,
      stock: data.stock,
      id_marca: data.id_marca,
    },
  });

  // Actualiza las relaciones en MotoRepuesto si se proporcionan nuevos IDs de motos
  if (data.motos_mercado.length == 0) {
    // Elimina las relaciones existentes
    await this.prisma.motoRepuesto.deleteMany({
      where: { id_repuesto: id },
    });
  }

  if (data.motos_mercado && data.motos_mercado.length > 0) {
    // Elimina las relaciones existentes
    await this.prisma.motoRepuesto.deleteMany({
      where: { id_repuesto: id },
    });

    // Crea las nuevas relaciones
    await this.prisma.motoRepuesto.createMany({
      data: data.motos_mercado.map((motoId: number) => ({
        id_moto_mercado: motoId,
        id_repuesto: id,
      })),
    });
  }

  if (data.proveedores.length == 0) {
    // Elimina las relaciones existentes
    await this.prisma.proveedorRepuesto.deleteMany({
      where: { id_repuesto: id },
    });
  }

  if (data.proveedores && data.proveedores.length > 0) {
    // Elimina las relaciones existentes
    await this.prisma.proveedorRepuesto.deleteMany({
      where: { id_repuesto: id },
    });

    // Crea las nuevas relaciones
    await this.prisma.proveedorRepuesto.createMany({
      data: data.proveedores.map((proveedorId: number) => ({
        id_proveedor: proveedorId,
        id_repuesto: id,
      })),
    });
  }

  return updatedRepuesto;
}
async remove(id: number) {
  console.log('Eliminando repuesto con id:', id);

  const existingRepuesto = await this.prisma.repuesto.findUnique({
    where: { id_repuesto: id },
  });

  if (!existingRepuesto) {
    throw new NotFoundException('Repuesto no encontrado');
  }

  // Elimina las relaciones en las tablas intermedias
  await this.prisma.motoRepuesto.deleteMany({
    where: { id_repuesto: id },
  });

  await this.prisma.proveedorRepuesto.deleteMany({
    where: { id_repuesto: id },
  });

  // Elimina el repuesto
  return this.prisma.repuesto.delete({
    where: { id_repuesto: id },
  });
}

}
