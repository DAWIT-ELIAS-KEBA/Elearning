import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from '../../permissions/dtos/permission.response.dto';

export class RoleResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the role.',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ description: 'The name of the role.' })
  role_name: string;

  @ApiProperty({ description: 'A description of the role.', nullable: true })
  description: string | null;

  @ApiProperty({
    type: [PermissionResponseDto],
    description: 'A list of permissions associated with this role.',
    nullable: true,
  })
  permissions?: PermissionResponseDto[];
}
