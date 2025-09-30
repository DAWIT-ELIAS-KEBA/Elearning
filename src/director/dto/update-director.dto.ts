// dto/update-director.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateDirectorDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  director_id: string;

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
