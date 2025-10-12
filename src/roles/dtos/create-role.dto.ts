import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role.',
    example: 'Administrator',
  })
  @IsString()
  @IsNotEmpty()
  role_name: string;

  @ApiPropertyOptional({
    description: 'A description of the role.',
    example: 'Full access to all system functionalities.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
