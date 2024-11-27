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
import { MotoClienteService } from './moto-cliente.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('moto-cliente')
@UseGuards(JwtAuthGuard)
export class MotoClienteController {
  constructor(private readonly motoClienteService: MotoClienteService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.motoClienteService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.motoClienteService.findOne(+id);
  }

  @Post()
  async create(@Body() createMotoClienteDto: any) {
    try {
      return await this.motoClienteService.create(createMotoClienteDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMotoClienteDto: any) {
    return this.motoClienteService.update(+id, updateMotoClienteDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return this.motoClienteService.remove(+id);
  }
}
