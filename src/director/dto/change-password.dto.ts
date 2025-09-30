// dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  director_id: string;

  @ApiProperty({ example: 'newPass1234' })
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
