import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto  {
  @ApiProperty({
    description: 'The unique identifier of the permission.',
    format: 'uuid',
  })
  permissionId: string;

  @ApiProperty({ description: 'The name of the permission.' })
  permissionName: string;

  @ApiProperty({
    description: 'A description of the permission.',
    nullable: true,
  })
  description: string | null;
}
