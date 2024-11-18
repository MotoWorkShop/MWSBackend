import { Module } from '@nestjs/common';
import { RepuestoController } from './repuesto.controller';
import { RepuestoService } from './repuesto.service';

@Module({
  controllers: [RepuestoController],
  providers: [RepuestoService]
})
export class RepuestoModule {}
