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
  NotFoundException,
} from '@nestjs/common';
import { RepuestoService } from './repuesto.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('repuesto')
@UseGuards(JwtAuthGuard)
export class RepuestoController {
  constructor(private readonly repuestoService: RepuestoService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit?: number ,
    @Query('search') search: string = '',
  ) {
    return this.repuestoService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.repuestoService.findOne(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Post()
  async create(@Body() createRepuestoDto: any) {
    try {
      return await this.repuestoService.create(createRepuestoDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRepuestoDto: any) {
    try {
      return await this.repuestoService.update(+id, updateRepuestoDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    try {
      return await this.repuestoService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Post('create-initial-repuestos')
    async createInitialRepuestos() {
    const repuestosData = [
        { codigo_barras: '1234567890123', nombre_repuesto: 'Filtro de aceite', valor_unitario: 45.50, stock: 100, id_marca: 1 },
        { codigo_barras: '1234567890124', nombre_repuesto: 'Bujía de encendido', valor_unitario: 25.00, stock: 200, id_marca: 2 },
        { codigo_barras: '1234567890125', nombre_repuesto: 'Filtro de aire', valor_unitario: 30.00, stock: 150, id_marca: 3 },
        { codigo_barras: '1234567890126', nombre_repuesto: 'Cadena de transmisión', valor_unitario: 120.00, stock: 80, id_marca: 4 },
        { codigo_barras: '1234567890127', nombre_repuesto: 'Pastillas de freno', valor_unitario: 60.00, stock: 100, id_marca: 5 },
    ];

    return Promise.all(
        repuestosData.map(repuesto => this.repuestoService.create(repuesto)),
    );
    }

}
