import { Module } from '@nestjs/common';
import { SubcityController } from './subcity.controller';
import { SubcityService } from './subcity.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubcityController],
  providers: [SubcityService, PrismaService],
  exports: [SubcityService],
})
export class SubcityModule {}