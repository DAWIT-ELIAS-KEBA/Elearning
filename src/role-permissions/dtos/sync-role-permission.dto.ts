import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class SyncRolePermissionsDto {
  @ApiProperty({
    description: 'List of permission UUIDs to sync with the role',
    type: 'string',
    format: 'uuid',
    isArray: true,
    example: [
      '30d521f0-b8e6-488c-b007-0d7613964428',
      'd6d43219-6ef7-44cc-9e8b-4146b3d3c2e5',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
