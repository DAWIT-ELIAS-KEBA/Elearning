import { Module } from '@nestjs/common';
import { TeacherCourseService } from './teacher-course.service';
import { TeacherCourseController } from './teacher-course.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TeacherCourseController],
  providers: [TeacherCourseService, PrismaService],
  exports: [TeacherCourseService],
})
export class TeacherCourseModule {}
