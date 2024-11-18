import { Module } from '@nestjs/common';
import { VentaDirectaService } from './venta-directa.service';
import { VentaDirectaController } from './venta-directa.controller';

@Module({
  providers: [VentaDirectaService],
  controllers: [VentaDirectaController]
})
export class VentaDirectaModule {}
