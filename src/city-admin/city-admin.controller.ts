import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CityAdminService } from './city-admin.service';
import { RegisterCityAdminDto, UpdateCityAdminDto, CityChangePasswordDto, ToggleCityAdminDto, DeleteCityAdminDto } from './dto/city-admin.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';


interface AuthenticatedRequest extends Request {
  user: { id: string; user_name: string; user_type: string };
}


@Controller('city')
export class CityAdminController {
  constructor(private readonly cityAdminService: CityAdminService) {}

  
  @Get('fetch_city_admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  fetchCityAdmins(@Req() req: AuthenticatedRequest) {
    return this.cityAdminService.fetchCityAdmins();
  }

  @Post('register_city_admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  registerCityAdmin(
    @Req() req: AuthenticatedRequest, // typed request
    @Body() dto: RegisterCityAdminDto,
  ) {
    // now req.user is defined
    return this.cityAdminService.registerCityAdmin(req.user, dto);
  }

  @Post('update_city_admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateCityAdmin(@Req() req: AuthenticatedRequest, @Body() dto: UpdateCityAdminDto) {
    return this.cityAdminService.updateCityAdmin(req.user, dto);
  }

  @Post('change_password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changePassword(@Req() req: AuthenticatedRequest, @Body() dto: CityChangePasswordDto) {
    return this.cityAdminService.changePassword(req.user, dto);
  }

  @Post('toggle_city_admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleCityAdmin(@Body() dto: ToggleCityAdminDto) {
    return this.cityAdminService.toggleCityAdmin(dto.city_admin_id);
  }

  @Post('delete_city_admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteCityAdmin(@Body() dto: DeleteCityAdminDto) {
    return this.cityAdminService.deleteCityAdmin(dto.city_admin_id);
  }
}
