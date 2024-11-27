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
import { VentaDirectaService } from './venta-directa.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('venta-directa')
@UseGuards(JwtAuthGuard)
export class VentaDirectaController {
  constructor(private readonly ventaDirectaService: VentaDirectaService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.ventaDirectaService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ventaDirectaService.findOne(+id);
  }

  @Post()
  async create(@Body() createVentaDirectaDto: any) {
    try {
      return await this.ventaDirectaService.create(createVentaDirectaDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVentaDirectaDto: any) {
    try {
      return await this.ventaDirectaService.update(+id, updateVentaDirectaDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    try {
      return await this.ventaDirectaService.remove(+id);
    } catch (error) {
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }
}
