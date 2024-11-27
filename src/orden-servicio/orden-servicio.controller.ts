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
import { OrdenServicioService } from './orden-servicio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('orden-servicio')
@UseGuards(JwtAuthGuard)
export class OrdenServicioController {
  constructor(private readonly OrdenServicioService: OrdenServicioService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.OrdenServicioService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.OrdenServicioService.findOne(+id);
  }

  @Post()
  async create(@Body() createMotoClienteDto: any) {
    try {
      return await this.OrdenServicioService.create(createMotoClienteDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMotoClienteDto: any) {
    return this.OrdenServicioService.update(+id, updateMotoClienteDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return this.OrdenServicioService.remove(+id);
  }
}
