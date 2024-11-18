import { Module } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';

@Module({
  providers: [ServicioService],
  controllers: [ServicioController]
})
export class ServicioModule {}
