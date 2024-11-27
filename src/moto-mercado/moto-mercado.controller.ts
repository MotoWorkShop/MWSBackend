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
import { MotoMercadoService } from './moto-mercado.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('moto-mercado')
@UseGuards(JwtAuthGuard)
export class MotoMercadoController {
  constructor(private readonly motoMercadoService: MotoMercadoService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.motoMercadoService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.motoMercadoService.findOne(+id);
  }

  @Post()
  async create(@Body() createMotoMercadoDto: any) {
    try {
      return await this.motoMercadoService.create(createMotoMercadoDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMotoMercadoDto: any) {
    return this.motoMercadoService.update(+id, updateMotoMercadoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return this.motoMercadoService.remove(+id);
  }
}
