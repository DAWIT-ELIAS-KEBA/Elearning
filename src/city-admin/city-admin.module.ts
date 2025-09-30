import { Module } from '@nestjs/common';
import { CityAdminController } from './city-admin.controller';
import { CityAdminService } from './city-admin.service';
import { PrismaService } from '../prisma/prisma.service'; // assuming you have a PrismaService

@Module({
  controllers: [CityAdminController],
  providers: [CityAdminService, PrismaService],
})
export class CityAdminModule {}
