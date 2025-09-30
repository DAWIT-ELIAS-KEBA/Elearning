// dto/create-director.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateDirectorDto {
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

  @ApiProperty({ example: '12' })
  @IsNotEmpty()
  school_id: string;
}
