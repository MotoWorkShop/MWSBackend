import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.usersService.findAll(page, limit, search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async create(
    @Body()
    createUserDto: {
      nombre_usuario: string;
      email: string;
      password: string;
      rol: 'ADMINISTRADOR' | 'VENDEDOR';
    },
  ) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async update(
    @Param('id') id: string,
    @Body()
    updateUserDto: {
      nombre_usuario?: string;
      email?: string;
      password?: string;
      rol?: 'ADMINISTRADOR' | 'VENDEDOR';
    },
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('create-initial-admin')
  async createInitialAdmin() {
    const adminData = {
      nombre_usuario: process.env.USER_ADMIN,
      email: process.env.EMAIL_ADMIN,
      password: process.env.PASSWORD_ADMIN,
      rol: 'ADMINISTRADOR' as const,
    };
    return this.usersService.create(adminData);
  }
}
