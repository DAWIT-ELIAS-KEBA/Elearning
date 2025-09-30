import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWoredaDto {
  @ApiProperty({ description: 'Woreda name', example: 'Woreda 01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  woreda_name: string;
}
