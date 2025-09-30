
import { Module } from '@nestjs/common';
import { WoredaService } from './woreda.service';
import { WoredaController } from './woreda.controller';

@Module({
  controllers: [WoredaController],
  providers: [WoredaService],
})
export class WoredaModule {}
