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
import { ServicioService } from './servicio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('servicio')
@UseGuards(JwtAuthGuard)
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.servicioService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicioService.findOne(+id);
  }

  @Post()
  async create(@Body() createServicioDto: any) {
    try {
      return await this.servicioService.create(createServicioDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateServicioDto: any) {
    try {
      return await this.servicioService.update(+id, updateServicioDto);
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
    return this.servicioService.remove(+id);
  }
  
  @Post('create-initial-services')
async createInitialServices() {
  const servicesData = [
    { nombre_servicio: 'Aceite barras' },
    { nombre_servicio: 'Ajuste general' },
    { nombre_servicio: 'Aire de llantas' },
    { nombre_servicio: 'Análisis de gases' },
    { nombre_servicio: 'Cambio de aceite' },
    { nombre_servicio: 'Limpieza filtro de aire' },
    { nombre_servicio: 'Limpieza y calibración de bujías' },
    { nombre_servicio: 'Lubricación de guayas' },
    { nombre_servicio: 'Revisión bujes de tijera' },
    { nombre_servicio: 'Revisión bujías' },
    { nombre_servicio: 'Revisión cunas' },
    { nombre_servicio: 'Revisión de aceite' },
    { nombre_servicio: 'Revisión de líquido de frenos' },
    { nombre_servicio: 'Revisión de luces' },
    { nombre_servicio: 'Revisión filtros' },
    { nombre_servicio: 'Revisión frenos' },
    { nombre_servicio: 'Revisión guayas' },
    { nombre_servicio: 'Revisión kit de arrastre y cauchos' },
    { nombre_servicio: 'Revisión rodamientos' },
    { nombre_servicio: 'Revisión sistema de carga' },
    { nombre_servicio: 'Revisión y carga de batería' },
    { nombre_servicio: 'Tensión y lubricación de la cadena' },
  ];

  return Promise.all(
    servicesData.map(service => this.servicioService.create(service)),
  );
}


}
