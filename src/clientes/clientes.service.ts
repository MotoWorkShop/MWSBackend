import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;
    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where: {
          OR: [
            { nombre_cliente: { contains: search, mode:'insensitive' } },
            { cedula: { contains: search || undefined } },
          ],
        },
        orderBy: {
          nombre_cliente: 'asc',
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.cliente.count({
        where: {
          OR: [
            { nombre_cliente: { contains: search , mode:'insensitive' } },
            { cedula: { contains: search || undefined} },
            
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      clientes,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.prisma.cliente.findUnique({
      where: { id_cliente: id },
      include: {
        motos_cliente: true,
        facturas: true,
        ventas_directas: true,
      },
    });
  }

  async create(data: any) {
  // Verifica si ya existe un cliente con la misma cédula
  const existingClienteByCedula = await this.prisma.cliente.findUnique({
    where: { cedula: data.cedula },
  });

  // Verifica si ya existe un cliente con el mismo correo
  const existingClienteByEmail = await this.prisma.cliente.findFirst({
    where: { correo: data.correo },
  });

  // Verifica si ya existe un cliente con el mismo telefono
  const existingClienteByPhone = await this.prisma.cliente.findFirst({
    where: { telefono: data.telefono },
  });

  if (existingClienteByCedula) {
    throw new ConflictException('Ya existe un cliente con esta cédula.');
  }

  if (existingClienteByEmail) {
    throw new ConflictException('Ya existe un cliente con este correo.');
  }

  if (existingClienteByPhone) {
    throw new ConflictException('Ya existe un cliente con este número de teléfono.');
  }

  // Si no existe, crea el nuevo cliente
  const cliente = await this.prisma.cliente.create({
    data: {
      nombre_cliente: data.nombre_cliente,
      cedula: data.cedula,
      correo: data.correo,
      telefono: data.telefono,
    },
  });

  // Verifica si se ha proporcionado información de la moto
  if (data.moto_cliente) {
    // Desestructura los datos de la moto
    const { placa, marca, modelo, ano } = data.moto_cliente;

    // Verifica si ya existe una moto con la misma placa
    const existingMoto = await this.prisma.motoCliente.findUnique({
      where: { placa },
    });

    if (existingMoto) {
      throw new ConflictException('Ya existe una moto con esta placa.');
    }

    // Si la moto no existe, crea una nueva moto y la asocia al cliente
    await this.prisma.motoCliente.create({
      data: {
        placa,
        marca,
        modelo,
        ano,
        id_cliente: cliente.id_cliente, // Asocia la moto al cliente creado
      },
    });
  }

  return cliente;
}

 async update(id: number, data: any) {
  // Verifica si ya existe un cliente con la misma cédula, excluyendo al cliente que está siendo actualizado
  const existingClienteByCedula = await this.prisma.cliente.findFirst({
    where: {
      cedula: data.cedula,
      NOT: { id_cliente: id }, // Excluir el cliente actual
    },
  });

  // Verifica si ya existe un cliente con el mismo correo, excluyendo al cliente que está siendo actualizado
  const existingClienteByEmail = await this.prisma.cliente.findFirst({
    where: {
      correo: data.correo,
      NOT: { id_cliente: id }, // Excluir el cliente actual
    },
  });
 
  // Verifica si ya existe un cliente con el mismo correo, excluyendo al cliente que está siendo actualizado
  const existingClienteByPhone = await this.prisma.cliente.findFirst({
    where: {
      telefono: data.telefono,
      NOT: { id_cliente: id }, // Excluir el cliente actual
    },
  });

  if (existingClienteByCedula) {
    throw new ConflictException('Ya existe un cliente con esta cédula.');
  }

  if (existingClienteByEmail) {
    throw new ConflictException('Ya existe un cliente con este correo.');
  }

  if (existingClienteByPhone) {
    throw new ConflictException('Ya existe un cliente con este número de teléfono.');
  }

  // Si no hay conflictos, se procede a la actualización
  return this.prisma.cliente.update({
    where: { id_cliente: id },
    data,
  });
}


  async remove(id: number) {
    return this.prisma.cliente.delete({
      where: { id_cliente: id },
    });
  }
}