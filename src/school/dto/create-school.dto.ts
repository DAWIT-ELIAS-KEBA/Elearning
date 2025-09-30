import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Addis Ababa Primary School' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Government', enum: ['Government', 'Private'] })
  @IsNotEmpty()
  @IsIn(['Government', 'Private'])
  school_type: string;
}
