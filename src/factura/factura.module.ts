import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';

@Module({
  providers: [FacturaService],
  controllers: [FacturaController]
})
export class FacturaModule {}
