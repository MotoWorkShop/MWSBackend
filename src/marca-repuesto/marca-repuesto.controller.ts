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
import { MarcaRepuestoService } from './marca-repuesto.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('marca-repuesto')
@UseGuards(JwtAuthGuard)
export class MarcaRepuestoController {
  constructor(private readonly marcaRepuestoService: MarcaRepuestoService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.marcaRepuestoService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.marcaRepuestoService.findOne(+id);
  }

  @Post()
  async create(@Body() createMarcaRepuestoDto: any) {
    try {
      return await this.marcaRepuestoService.create(createMarcaRepuestoDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMarcaRepuestoDto: any) {
    return this.marcaRepuestoService.update(+id, updateMarcaRepuestoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return this.marcaRepuestoService.remove(+id);
  }

}
