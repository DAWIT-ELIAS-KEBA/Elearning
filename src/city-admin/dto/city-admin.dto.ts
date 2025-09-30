import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, IsIn, IsOptional, MinLength, Matches } from 'class-validator';

export class RegisterCityAdminDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty(({
    description: 'Name of the admin',
    example: 'Ahmed Abraham',
  }))
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty(({
    description: 'User Name of the admin email or others',
    example: 'Ahmed.Abraham or  Ahmed.Abraham@gmail.com',
  }))
  user_name: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['Male', 'Female'])
  @ApiProperty(({
    description: 'Gender of the admin',
    example: 'Male or  Female',
  }))
  gender: string;
}

export class UpdateCityAdminDto {
  @IsNotEmpty()
  @ApiProperty(({
    description: 'ID of admin you are going to update!',
    example: 'scd63r7h4488tdn45bej'
  }))
  city_admin_id: string;

  @IsNotEmpty()
  @IsString()
   @ApiProperty(({
    description: 'Name of the admin',
    example: 'Ahmed Abraham',
  }))
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty(({
    description: 'User Name of the admin email or others',
    example: 'Ahmed.Abraham or  Ahmed.Abraham@gmail.com',
  }))
  user_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty(({
    description: 'Gender of the admin',
    example: 'Male or  Female',
  }))
  @IsIn(['Male', 'Female'])
  gender: string;
}

export class CityChangePasswordDto {
  @IsNotEmpty()
  @ApiProperty(({
    description: 'ID of admin you are going to change password for him',
    example: 'scd63r7h4488tdn45bej'
  }))
  city_admin_id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @ApiProperty(({
    description: 'Password to which you want to change the password',
    example: '12345678'
  }))
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty(({
    description: 'Confirm the new password',
    example: '12345678'
  }))
  password_confirmation: string;
}

export class ToggleCityAdminDto {
  @IsNotEmpty()
  @ApiProperty(({
    description: 'ID of admin you are going to change his status!',
    example: 'scd63r7h4488tdn45bej'
  }))
  city_admin_id: string;
}

export class DeleteCityAdminDto {
  @IsNotEmpty()
  @ApiProperty(({
    description: 'ID of admin you are going to delete!',
    example: 'scd63r7h4488tdn45bej'
  }))
  city_admin_id: string;
}
