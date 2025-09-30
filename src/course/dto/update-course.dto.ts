import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Course ID to update',
    example: 'b1f5a8c2-3f0d-4f10-9c9b-1234567890ab',
  })
  @IsNotEmpty({ message: 'Course ID is required' })
  @IsString()
  course_id: string;

  @ApiProperty({
    description: 'Updated name of the course',
    example: 'Physics 101',
  })
  @IsNotEmpty({ message: 'Course name is required' })
  @IsString()
  name: string;
}