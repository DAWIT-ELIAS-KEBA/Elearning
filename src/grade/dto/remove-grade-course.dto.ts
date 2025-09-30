import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RemoveGradeCourseDto {
  @ApiProperty({ description: 'Grade ID', example: 'uuid-of-grade' })
  @IsNotEmpty()
  @IsUUID()
  grade_id: string;

  @ApiProperty({ description: 'Course ID', example: 'uuid-of-course' })
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}

