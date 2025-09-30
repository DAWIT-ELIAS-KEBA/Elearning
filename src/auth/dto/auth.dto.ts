

import { ApiProperty } from '@nestjs/swagger';



export class AuthLoginDto {
  @ApiProperty({ example: 'admin', description: 'Unique username of the user' })
  user_name: string;

  @ApiProperty({ example: '12345678', description: 'User password' })
  password: string;
}

export class AuthChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', description: 'Current password' })
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword456!', description: 'New password to be set' })
  newPassword: string;
}
