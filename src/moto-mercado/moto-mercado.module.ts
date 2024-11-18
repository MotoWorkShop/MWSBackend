import { Module } from '@nestjs/common';
import { MotoMercadoService } from './moto-mercado.service';
import { MotoMercadoController } from './moto-mercado.controller';

@Module({
  providers: [MotoMercadoService],
  controllers: [MotoMercadoController]
})
export class MotoMercadoModule {}
