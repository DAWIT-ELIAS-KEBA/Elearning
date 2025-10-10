import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '@prisma/client';

export class UpdateResourceDto {
  @ApiProperty({ description: 'Resource ID', example: 'uuid-of-resource' })
  @IsUUID()
  resource_id: string;

  @ApiPropertyOptional({ description: 'Resource name', example: 'Updated Name' })
  @IsOptional()
  @IsString()
  name?: string;


  @ApiProperty({ description: 'Resource description', example: 'Extreme Physics refrence book' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Grade ID', example: 'uuid-of-grade' })
  @IsOptional()
  @IsUUID()
  grade_id?: string;

  @ApiPropertyOptional({ description: 'Course ID', example: 'uuid-of-course' })
  @IsOptional()
  @IsUUID()
  course_id?: string;

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

  @ApiPropertyOptional({
    description: 'File type',
    enum: ['pdf', 'video', 'image'],
  })
  @IsOptional()
  @IsIn(Object.values(ResourceType))
  file_type?: ResourceType;

  @ApiPropertyOptional({ description: 'Teacher guidance', example: false })
  @IsOptional()
  @IsBoolean()
  is_teacher_guidance?: string | boolean;

  @ApiPropertyOptional({ description: 'Active status', example: true })
  @IsOptional()
  @IsBoolean()
  status?: string |boolean;
}
