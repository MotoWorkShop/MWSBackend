import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotoClienteService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;
    const [motosCliente, total] = await Promise.all([
      this.prisma.motoCliente.findMany({
        where: {
          OR: [
            { placa: { contains: search , mode: 'insensitive' }, },
          ],
        },
        include:{
          cliente: true,
        },
        orderBy: {
          marca: 'asc',
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.motoCliente.count({
        where: {
          OR: [
            { placa: { contains: search, mode : 'insensitive' } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      motosCliente,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.prisma.motoCliente.findUnique({
      where: { id_moto_cliente: id },
      include: {
        cliente: true,
        ordenes_servicio: true,
      },
    });
  }

async create(data: any) {
  // Verifica si ya existe una moto con la misma placa
  const existingMoto = await this.prisma.motoCliente.findUnique({
    where: { placa: data.placa },
  });
  console.log(data)

  if (existingMoto) {
    throw new ConflictException('Ya existe una moto con esta placa.');
  }

  // Verifica que el cliente exista en la base de datos
  const existingCliente = await this.prisma.cliente.findUnique({
    where: { id_cliente: data.id_cliente },
  });

  if (!existingCliente) {
    throw new ConflictException('Cliente no encontrado.');
  } 
  const id_cliente = Number(data.id_cliente);
  const ano = Number(data.ano);

  // Si no existe, crea la nueva moto y la asocia al cliente
  return this.prisma.motoCliente.create({
    data: {
      placa: data.placa,
      marca: data.marca,
      modelo: data.modelo,
      ano: ano,
      id_cliente: id_cliente, // Asocia la moto al cliente proporcionado
    },
  });
}


  async update(id: number, data: any) {
    // Verifica si ya existe una moto con la misma placa, excluyendo la que está siendo actualizada
    const existingMoto = await this.prisma.motoCliente.findFirst({
      where: {
        placa: data.placa,
        NOT: { id_moto_cliente: id }, // Excluir la moto actual
      },
    });

    if (existingMoto) {
      throw new ConflictException('Ya existe una moto con esta placa.');
    }

    // Si no hay conflictos, se procede a la actualización
    return this.prisma.motoCliente.update({
      where: { id_moto_cliente: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.motoCliente.delete({
      where: { id_moto_cliente: id },
    });
  }
}
