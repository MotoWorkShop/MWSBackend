import { Module } from '@nestjs/common';
import { ProveedorController } from './proveedor.controller';
import { ProveedorService } from './proveedor.service';

@Module({
  controllers: [ProveedorController],
  providers: [ProveedorService]
})
export class ProveedorModule {}
