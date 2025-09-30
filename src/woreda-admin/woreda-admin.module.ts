import { Module } from '@nestjs/common';
import { WoredaAdminService } from './woreda-admin.service';
import { WoredaAdminController } from './woreda-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WoredaAdminController],
  providers: [WoredaAdminService],
})
export class WoredaAdminModule {}
