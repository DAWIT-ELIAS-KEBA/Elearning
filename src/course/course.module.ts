import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService], // if you need to use this service elsewhere
})
export class CourseModule {}