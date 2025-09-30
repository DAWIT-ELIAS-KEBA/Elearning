import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsInt,
  MinLength,
  Matches,
  IsUUID,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Enter student name!!' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Enter user name!!' })
  user_name: string;

  @ApiProperty({ enum: ['Male', 'Female'] })
  @IsString()
  @IsIn(['Male', 'Female'], { message: 'Select valid gender!!' })
  gender: string;

  @ApiProperty()
  @IsInt({ message: 'Select student grade!!' })
  grade_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Enter student section!!' })
  section: string;
}


export class UpdateStudentDto extends CreateStudentDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the student to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Select a valid student!!' })
  student_id: string;
}


export class StudentChangePasswordDto {
  @ApiProperty()
  @IsInt({ message: 'Select valid student!!' })
  student_id: string;

  @ApiProperty()
  @IsString()
  @MinLength(4, { message: 'Enter atleast four(4) character for password!!' })
  password: string;

  @ApiProperty()
  @IsString()
  confirm_password: string;
}

export class DeleteStudentDto {
  @ApiProperty()
  @IsInt({ message: 'Select valid student to delete!!' })
  student_id: string;
}

export class ToggleStudentDto {
  @ApiProperty()
  @IsInt({ message: 'Select valid student to disable or enable!!' })
  student_id: string;
}
