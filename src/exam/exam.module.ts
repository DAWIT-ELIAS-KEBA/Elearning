// src/exam/exam.module.ts
import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExamService],
  controllers: [ExamController],
})
export class ExamModule {}
