import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarcaRepuestoService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const [marcas, total] = await Promise.all([
      this.prisma.marcaRepuesto.findMany({
        where: {
          nombre_marca: { contains: search , mode:'insensitive' },
        },
        orderBy: {
          nombre_marca: 'asc',
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.marcaRepuesto.count({
        where: {
          nombre_marca: { contains: search , mode :'insensitive' },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      marcas,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.prisma.marcaRepuesto.findUnique({
      where: { id_marca: id },
      include: {
        repuestos: true,
      },
    });
  }

  async create(data: any) {
    // Verifica si ya existe una marca con el mismo nombre
    const existingMarca = await this.prisma.marcaRepuesto.findUnique({
      where: { nombre_marca: data.nombre_marca },
    });

    if (existingMarca) {
      throw new ConflictException('Ya existe una marca con este nombre.');
    }

    // Si no existe, crea la nueva marca
    return this.prisma.marcaRepuesto.create({
      data: {
        nombre_marca: data.nombre_marca,
      },
    });
  }

  async update(id: number, data: any) {
    // Verifica si ya existe una marca con el mismo nombre, excluyendo la que está siendo actualizada
    const existingMarca = await this.prisma.marcaRepuesto.findFirst({
      where: {
        nombre_marca: data.nombre_marca,
        NOT: { id_marca: id }, // Excluir la marca actual
      },
    });

    if (existingMarca) {
      throw new ConflictException('Ya existe una marca con este nombre.');
    }

    // Si no hay conflictos, se procede a la actualización
    return this.prisma.marcaRepuesto.update({
      where: { id_marca: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.marcaRepuesto.delete({
      where: { id_marca: id },
    });
  }
}
