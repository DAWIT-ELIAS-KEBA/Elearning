import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, ArrayNotEmpty, IsArray } from 'class-validator';

export class CreateRolePermissionsDto {
  @ApiProperty({
    description: 'The ID of the role.',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  role_id: string;

  @ApiProperty({
    description: 'An array of permission IDs to assign to the role.',
    type: [String],
    format: 'uuid',
    example: [
      'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      'f1e2d3c4-b5a6-9876-5432-10fedcba9876',
    ],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  permissionIds: string[];
}
