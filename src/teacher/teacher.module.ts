// teacher.module.ts
import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
  imports: [PrismaModule, MinioModule], // 👈 added
})
export class TeacherModule {}
