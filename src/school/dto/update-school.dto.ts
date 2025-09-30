import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateSchoolDto {
  @ApiProperty({ example: 'uuid-of-school' })
  @IsNotEmpty()
  school_id: string;

  @ApiProperty({ example: 'New School Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Private', enum: ['Government', 'Private'] })
  @IsNotEmpty()
  @IsIn(['Government', 'Private'])
  school_type: string;
}
