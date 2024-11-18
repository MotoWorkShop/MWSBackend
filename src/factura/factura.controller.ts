import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FacturaService } from './factura.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('factura')
@UseGuards(JwtAuthGuard)
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit?: number,
    @Query('search') search: string = '',
  ) {
    return this.facturaService.findAll(page, limit, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.facturaService.findOne(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Error interno del servidor');
    }
  }
}
