import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotoMercadoService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const [motos, total] = await Promise.all([
      this.prisma.motoMercado.findMany({
        where: {
          modelo: { contains: search , mode: 'insensitive' },
        },
        orderBy: {
          modelo: 'asc',
        },
        skip,
        take: Number(limit),
        include: { 
          repuestos: {
            include: { 
              repuesto: true // Incluir detalles de los repuestos asociados
            }
          }
        },
      }),
      this.prisma.motoMercado.count({
        where: {
          modelo: { contains: search , mode: 'insensitive' },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      motos,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.prisma.motoMercado.findUnique({
      where: { id_moto_mercado: id },
      include: {
        repuestos: {
          include: { 
            repuesto: true // Incluir detalles de los repuestos asociados
          }
        }
      },
    });
  }

  async create(data: any) {
    // Verifica si ya existe una moto con el mismo modelo
    const existingMoto = await this.prisma.motoMercado.findUnique({
      where: { modelo: data.modelo },
    });

    if (existingMoto) {
      throw new ConflictException('Ya existe una moto con este modelo.');
    }

    // Si no existe, crea la nueva moto del mercado
    return this.prisma.motoMercado.create({
      data: {
        modelo: data.modelo,
        repuestos: {
          create: data.repuestos.map((id_repuesto: number) => ({
            id_repuesto, // Agregar el ID del repuesto
          })),
        },
      },
    });
  }

  async update(id: number, data: any) {
    // Verifica si ya existe una moto con el mismo modelo, excluyendo la que está siendo actualizada
    const existingMoto = await this.prisma.motoMercado.findFirst({
      where: {
        modelo: data.modelo,
        NOT: { id_moto_mercado: id }, // Excluir la moto actual
      },
    });

    if (existingMoto) {
      throw new ConflictException('Ya existe una moto con este modelo.');
    }

    // Si no hay conflictos, se procede a la actualización
    return this.prisma.motoMercado.update({
      where: { id_moto_mercado: id },
      data: {
        modelo: data.modelo,
        repuestos: {
          deleteMany: {}, // Eliminar todos los repuestos existentes
          create: data.repuestos.map((id_repuesto: number) => ({
            id_repuesto, // Crear nuevas asociaciones con los repuestos
          })),
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.motoMercado.delete({
      where: { id_moto_mercado: id },
    });
  }
}
