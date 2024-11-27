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
import { ProveedorService } from './proveedor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('proveedor')
@UseGuards(JwtAuthGuard)
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit?: number,
    @Query('search') search: string = '',
  ) {
    return this.proveedorService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.proveedorService.findOne(+id);
  }

  @Post()
  async create(@Body() createProveedorDto: any) {
    try {
      return await this.proveedorService.create(createProveedorDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProveedorDto: any) {
    return this.proveedorService.update(+id, updateProveedorDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return this.proveedorService.remove(+id);
  }
}
