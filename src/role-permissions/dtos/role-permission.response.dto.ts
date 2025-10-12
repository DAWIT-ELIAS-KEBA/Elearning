import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from '../../roles/dtos/role.response.dto';
import { PermissionResponseDto } from '../../permissions/dtos/permission.response.dto';

export class RolePermissionResponseDto  {
  @ApiProperty({
    description: 'The unique identifier for the role-permission assignment.',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ description: 'The ID of the role.', format: 'uuid' })
  role_id: string;

  @ApiProperty({ description: 'The ID of the permission.', format: 'uuid' })
  permission_id: string;

  @ApiProperty({
    description: 'The timestamp when the permission was assigned to the role.',
    type: String,
    format: 'date-time',
  })
  assigned_at: Date;

  @ApiProperty({
    type: RoleResponseDto,
    description: 'The associated role details (if loaded).',
    nullable: true,
  })
  role?: RoleResponseDto;

  @ApiProperty({
    type: PermissionResponseDto,
    description: 'The associated permission details (if loaded).',
    nullable: true,
  })
  permission?: PermissionResponseDto;
}
