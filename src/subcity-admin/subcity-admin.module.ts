import { Module } from '@nestjs/common';
import { SubcityAdminService } from './subcity-admin.service';
import { SubcityAdminController } from './subcity-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubcityAdminController],
  providers: [SubcityAdminService],
})
export class SubcityAdminModule {}
