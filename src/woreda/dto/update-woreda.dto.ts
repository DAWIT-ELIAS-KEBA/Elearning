import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';

export class UpdateWoredaDto {
  @ApiProperty({ description: 'Woreda ID', example: 'uuid-of-woreda' })
  @IsNotEmpty()
  @IsUUID()
  woreda_id: string;

  @ApiProperty({ description: 'Updated woreda name', example: 'New Woreda Name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  woreda_name: string;
}