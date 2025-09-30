// dto/create-teacher.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john123' })
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @ApiProperty({ example: 'Male', enum: ['Male', 'Female'] })
  @IsNotEmpty()
  @IsIn(['Male', 'Female'])
  gender: string;
}


export class TeacherChangePasswordDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  teacher_id: string;

  @ApiProperty({ example: 'newPassword123!' })
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}


export class DeleteTeacherDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  teacher_id: string;
}


export class ToggleTeacherDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  teacher_id: string;
}



export class UpdateTeacherDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  teacher_id: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane123' })
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @ApiProperty({ example: 'Female', enum: ['Male', 'Female'] })
  @IsNotEmpty()
  @IsIn(['Male', 'Female'])
  gender: string;
}
