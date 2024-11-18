import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicioService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const [servicios, total] = await Promise.all([
      this.prisma.servicio.findMany({
        where: {
          nombre_servicio: { contains: search, mode: 'insensitive' },
        },
        orderBy: {
          nombre_servicio: 'asc',
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.servicio.count({
        where: {
          nombre_servicio: { contains: search , mode :'insensitive' },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      servicios,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.prisma.servicio.findUnique({
      where: { id_servicio: id },
      include: {
        ordenes_servicio: true,
      },
    });
  }

  async create(data: any) {
    // Verifica si ya existe un servicio con el mismo nombre
    const existingServicio = await this.prisma.servicio.findUnique({
      where: { nombre_servicio: data.nombre_servicio },
    });

    if (existingServicio) {
      throw new ConflictException('Ya existe un servicio con este nombre.');
    }

    // Si no existe, crea el nuevo servicio
    return this.prisma.servicio.create({
      data: {
        nombre_servicio: data.nombre_servicio,
      },
    });
  }

  async update(id: number, data: any) {
    // Verifica si ya existe un servicio con el mismo nombre, excluyendo el que está siendo actualizado
    const existingServicio = await this.prisma.servicio.findFirst({
      where: {
        nombre_servicio: data.nombre_servicio,
        NOT: { id_servicio: id }, // Excluir el servicio actual
      },
    });

    if (existingServicio) {
      throw new ConflictException('Ya existe un servicio con este nombre.');
    }

    // Si no hay conflictos, se procede a la actualización
    return this.prisma.servicio.update({
      where: { id_servicio: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.servicio.delete({
      where: { id_servicio: id },
    });
  }
}
