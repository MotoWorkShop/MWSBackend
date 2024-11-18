import { Module } from '@nestjs/common';
import { MotoClienteService } from './moto-cliente.service';
import { MotoClienteController } from './moto-cliente.controller';

@Module({
  providers: [MotoClienteService],
  controllers: [MotoClienteController]
})
export class MotoClienteModule {}
