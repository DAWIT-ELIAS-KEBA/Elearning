// src/blacklist/blacklist.module.ts
import { Module } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [BlacklistService, PrismaService],
  exports: [BlacklistService], // ✅ export it
})
export class BlacklistModule {}