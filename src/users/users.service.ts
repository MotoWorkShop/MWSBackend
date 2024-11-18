import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where: {
          OR: [
            { nombre_usuario: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          nombre_usuario: 'asc',
        },
        skip,
        take: Number(limit),
        select: {
          id_usuario: true,
          nombre_usuario: true,
          email: true,
          rol: true,
        },
      }),
      this.prisma.usuario.count({
        where: {
          OR: [
            { nombre_usuario: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        email: true,
        rol: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async create(data: { nombre_usuario: string; email: string; password: string; rol: 'ADMINISTRADOR' | 'VENDEDOR' }) {
    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Ya el email está en uso');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        email: true,
        rol: true,
      },
    });
  }

  async update(id: number, data: { nombre_usuario?: string; email?: string; password?: string; rol?: 'ADMINISTRADOR' | 'VENDEDOR' }) {
    if (data.email) {
      const existingEmail = await this.prisma.usuario.findFirst({
        where: {
          email: data.email,
          NOT: { id_usuario: id },
        },
      });

      if (existingEmail) {
        throw new ConflictException('Ya el email está en uso');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
      select: {
        id_usuario: true,
        nombre_usuario: true,
        email: true,
        rol: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // This will throw NotFoundException if user doesn't exist
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        email: true,
        rol: true,
      },
    });
  }
}