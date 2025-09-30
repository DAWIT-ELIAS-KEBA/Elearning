import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseDto {
@ApiProperty({
  description: 'Name of the course',
  example: 'Mathematics 101',
})
@IsNotEmpty({ message: 'Course name is required' })
@IsString()
name: string;
}