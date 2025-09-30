// dto/exam.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------
// Exam Option DTO
// ---------------------
export class ExamOptionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id?: string; // only for updating existing option

  @ApiProperty()
  @IsUUID()
  question_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  option_text?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  option_image?: any;

  @ApiProperty()
  @IsBoolean()
  is_correct: boolean;
}

// ---------------------
// Create Exam Question DTO
// ---------------------
export class CreateExamQuestionDto {
  @ApiProperty()
  @IsString()
  question_text: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  question_image?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  answer_desc?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  answer_image?: any;

  @ApiProperty()
  @IsString()
  course_id: string;

  @ApiProperty()
  @IsString()
  grade_id: string;

  @ApiProperty()
  @IsNumber()
  chapter: number;

  @ApiProperty()
  @IsString()
  created_by: string;
}

// ---------------------
// Update Exam Question DTO
// ---------------------
export class UpdateExamQuestionDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  question_text?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  question_image?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  answer_desc?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  answer_image?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  course_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  grade_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  chapter?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  created_by?: string;
}

// ---------------------
// Save Result DTO
// ---------------------
export class SaveResultDto {
  @ApiProperty()
  @IsString()
  user_id: string;

  @ApiProperty()
  @IsString()
  grade_id: string;

  @ApiProperty()
  @IsString()
  course_id: string;

  @ApiProperty()
  @IsNumber()
  max_score: number;

  @ApiProperty()
  @IsNumber()
  result: number;
}

// ---------------------
// Get Exams Query DTO
// ---------------------
export class GetExamsQueryDto {
  @ApiProperty({ description: 'Grade ID' })
  @IsString()
  grade_id: string;

  @ApiProperty({ description: 'Course ID' })
  @IsString()
  course_id: string;
}


export class ToggleQuestionStatusDto {
  @ApiProperty({ description: 'Question ID to toggle status' })
  @IsUUID()
  question_id: string;
}