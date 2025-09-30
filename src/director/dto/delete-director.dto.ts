// dto/delete-director.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteDirectorDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  director_id: string;
}
