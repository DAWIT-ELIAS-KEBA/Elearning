import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MinLength, IsIn } from 'class-validator';

export class RegisterWoredaAdminDto {
  @ApiProperty({ description: 'Woreda admin name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique user name for woreda admin' })
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @ApiProperty({ description: 'Gender', enum: ['Male', 'Female'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['Male', 'Female'])
  gender: string;

  @ApiProperty({ description: 'Woreda ID' })
  @IsNotEmpty()
  @IsString()
  woreda_id: string;
}

export class UpdateWoredaAdminDto extends RegisterWoredaAdminDto {
  @ApiProperty({ description: 'Woreda admin ID to update' })
  @IsNotEmpty()
  @IsString()
  woreda_admin_id: string;
}

export class WoredaChangePasswordDto {
  @ApiProperty({ description: 'Woreda admin ID' })
  @IsNotEmpty()
  @IsString()
  woreda_admin_id: string;

  @ApiProperty({ description: 'New password', minLength: 4 })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty({ description: 'Confirm password', minLength: 4 })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password_confirmation: string;
}

export class WoredaAdminIdDto {
  @ApiProperty({ description: 'Woreda admin ID' })
  @IsNotEmpty()
  @IsString()
  woreda_admin_id: string;
}
