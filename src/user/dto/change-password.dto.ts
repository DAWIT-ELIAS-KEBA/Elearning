import { ApiProperty } from '@nestjs/swagger';

export class UserChangePasswordDto {
  @ApiProperty({
    description: 'New password',
    example: 'StrongPassword123!',
  })
  password: string;

  @ApiProperty({
    description: 'Confirm the new password',
    example: 'StrongPassword123!',
  })
  confirmPassword: string;
}