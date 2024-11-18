import { Module } from '@nestjs/common';
import { MarcaRepuestoController } from './marca-repuesto.controller';
import { MarcaRepuestoService } from './marca-repuesto.service';

@Module({
  controllers: [MarcaRepuestoController],
  providers: [MarcaRepuestoService]
})
export class MarcaRepuestoModule {}
