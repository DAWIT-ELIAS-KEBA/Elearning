import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteWoredaDto {
  @ApiProperty({ description: 'Woreda ID', example: 'uuid-of-woreda' })
  @IsNotEmpty()
  @IsUUID()
  woreda_id: string;
}
