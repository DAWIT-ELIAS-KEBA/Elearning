import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'The name of the permission.',
    example: 'create_organization',
  })
  @IsString()
  @IsNotEmpty()
  permission_name: string;

  @ApiPropertyOptional({
    description: 'A description of the permission.',
    example: 'Allows creation of new organization records.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
