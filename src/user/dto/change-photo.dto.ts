import { ApiProperty } from '@nestjs/swagger';

export class UserChangePhotoDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload your profile photo',
  })
  photo: any; // Swagger expects a placeholder type
}