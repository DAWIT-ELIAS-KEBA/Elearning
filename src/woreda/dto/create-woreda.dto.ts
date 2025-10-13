import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateWoredaDto {
  @ApiProperty({ description: 'Woreda name', example: 'Woreda 01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  woreda_name: string;

  @ApiProperty({ description: 'Subcity ID', example: 'uuid-of-subcity' })
  @IsNotEmpty()
  @IsUUID()
  subcityId: string;

}
