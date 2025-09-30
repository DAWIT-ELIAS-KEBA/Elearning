// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UserChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '../user/user.decorator';
import { UserChangePhotoDto } from './dto/change-photo.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async profile(@Req() req) {
    return this.userService.getProfile(req.user.id);
  }

  @Post('change-photo')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UserChangePhotoDto })
  async changePhoto(
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.changePhoto(userId, file);
  }

  @Post('change-password')
  async changePassword(
  @User('id') userId: string,
  @Body() dto: UserChangePasswordDto,
  ) {
      return this.userService.changePassword(userId, dto.password, dto.confirmPassword);
  }
}
