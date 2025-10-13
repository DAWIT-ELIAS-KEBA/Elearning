import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Addis Ababa Primary School' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Government', enum: ['Government', 'Private'] })
  @IsNotEmpty()
  @IsIn(['Government', 'Private'])
  school_type: string;

  @ApiProperty({ description: 'Woreda ID', example: 'uuid-of-woreda' })
  @IsNotEmpty()
  @IsUUID()
  woreda_id: string;
}
