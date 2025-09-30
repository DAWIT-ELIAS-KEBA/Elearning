import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, IsNumber, MinLength } from 'class-validator';

export class CreateDirectorDto {
  @ApiProperty({ example: 'John Doe', description: 'Director full name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john123', description: 'Unique username' })
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @ApiProperty({ example: 'Male', description: 'Gender of the director' })
  @IsNotEmpty()
  @IsIn(['Male', 'Female'])
  gender: string;

  @ApiProperty({ example: 5, description: 'School ID belonging to woreda' })
  @IsNotEmpty()
  @IsNumber()
  school_id: string;
}

export class UpdateDirectorDto {
  @ApiProperty({ example: 1, description: 'Director ID' })
  @IsNotEmpty()
  director_id: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Director updated name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane123', description: 'Updated username' })
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @ApiProperty({ example: 'Female', description: 'Gender' })
  @IsNotEmpty()
  @IsIn(['Male', 'Female'])
  gender: string;
}

export class DirectorChangePasswordDto {
  @ApiProperty({ example: 1, description: 'Director ID' })
  @IsNotEmpty()
  director_id: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class DeleteDirectorDto {
  @ApiProperty({ example: 1, description: 'Director ID' })
  @IsNotEmpty()
  director_id: string;
}

export class ToggleDirectorDto {
  @ApiProperty({ example: 1, description: 'Director ID' })
  @IsNotEmpty()
  director_id: string;
}
