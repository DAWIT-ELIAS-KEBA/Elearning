import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, MinLength } from 'class-validator';

export class RegisterSubcityAdminDto {
  @ApiProperty({ description: 'Subcity admin name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique user name for subcity admin' })
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @ApiProperty({ description: 'Gender', enum: ['Male', 'Female'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['Male', 'Female'])
  gender: string;

  @ApiProperty({ description: 'Subcity ID' })
  @IsNotEmpty()
  @IsString()
  subcity_id: string;
}

export class UpdateSubcityAdminDto extends RegisterSubcityAdminDto {
  @ApiProperty({ description: 'Subcity admin ID to update' })
  @IsNotEmpty()
  @IsString()
  subcity_admin_id: string;
}

export class SubcityAdminChangePasswordDto {
  @ApiProperty({ description: 'Subcity admin ID' })
  @IsNotEmpty()
  @IsString()
  subcity_admin_id: string;

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

export class SubcityAdminIdDto {
  @ApiProperty({ description: 'Subcity admin ID' })
  @IsNotEmpty()
  @IsString()
  subcity_admin_id: string;
}
