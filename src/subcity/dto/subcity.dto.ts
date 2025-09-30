import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSubcityDto {
  @ApiProperty({
    description: 'Subcity name',
    example: 'Bole',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}

export class UpdateSubcityDto {
  @ApiProperty({
    description: 'Subcity ID',
    example: 'uuid-of-subcity',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Updated subcity name',
    example: 'Kirkos',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}

export class DeleteSubcityDto {
  @ApiProperty({
    description: 'Subcity ID to delete',
    example: 'uuid-of-subcity',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
