import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteSchoolDto {
  @ApiProperty({ example: 'uuid-of-school' })
  @IsNotEmpty()
  school_id: string;


}
