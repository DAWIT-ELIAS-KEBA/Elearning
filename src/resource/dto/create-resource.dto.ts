import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @ApiProperty({ description: 'Resource name', example: 'Physics Basics' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grade ID', example: 'uuid-of-grade' })
  @IsNotEmpty()
  @IsUUID()
  grade_id: string;

  @ApiProperty({ description: 'Course ID', example: 'uuid-of-course' })
  @IsNotEmpty()
  @IsUUID()
  course_id: string;

  @ApiPropertyOptional({ description: 'Optional chapter number', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  chapter?: number;

  @ApiPropertyOptional({ description: 'Optional lesson number', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lesson?: number;

  @ApiProperty({
    description: 'File type',
    example: 'pdf',
    enum: ResourceType,
  })
  @IsNotEmpty()
  @IsIn(Object.values(ResourceType))
  file_type: ResourceType;

  @ApiPropertyOptional({ description: 'Teacher guidance', example: false })
  @IsOptional()
  @IsBoolean()
  is_teacher_guidance?: string | boolean;

  @ApiPropertyOptional({ description: 'Active status', example: true })
  @IsOptional()
  @IsBoolean()
  status?: string |boolean;
}
