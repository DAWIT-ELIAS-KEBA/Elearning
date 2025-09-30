import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubcityIdDto {
  @ApiProperty({
    description: 'Id of the subcity',
    example: 'fg5y5t45y66y66y554',
  })
  @IsString()
  subcityId: string;
}

export class WoredaIdDto {
  @ApiProperty({
    description: 'Id of the woreda',
    example: 'fg5y5t45y66y66y554',
  })
  @IsString()
  woredaId: string;
}

export class SchoolIdDto {
  @ApiProperty({
    description: 'Id of the school',
    example: 'fg5y5t45y66y66y554',
  })
  @IsString()
  schoolId: string;
}
