import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from '../../roles/dtos/role.response.dto';

export class UserRoleResponseDto  {
  @ApiProperty({
    description: 'The unique identifier for the user-role assignment.',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ description: 'The ID of the user.', format: 'uuid' })
  user_id: string;

  @ApiProperty({ description: 'The ID of the role.', format: 'uuid' })
  role_id: string;

  @ApiProperty({
    description: 'The timestamp when the role was assigned.',
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
}
