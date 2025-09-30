import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ToggleSchoolDto {
  @ApiProperty({ example: 'uuid-of-school' })
  @IsNotEmpty()
  school_id: string;
}
