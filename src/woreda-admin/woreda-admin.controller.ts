import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WoredaAdminService } from './woreda-admin.service';
import { RegisterWoredaAdminDto, UpdateWoredaAdminDto, WoredaChangePasswordDto, WoredaAdminIdDto } from './dto/woreda-admin.dto';

@ApiTags('Woreda Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('woreda-admin')
export class WoredaAdminController {
  constructor(private readonly service: WoredaAdminService) {}

  @ApiOperation({ summary: 'Get all woredas in subcity' })
  @Get('view')
  async view(@Req() req) {
    return this.service.getWoredasBySubcity(req.user.subcity_id);
  }

  @ApiOperation({ summary: 'Fetch all woreda admins' })
  @Get('list')
  async fetch(@Req() req) {
    return this.service.fetchWoredaAdmins(req.user.subcity_id);
  }

  @ApiOperation({ summary: 'Register new woreda admin' })
  @ApiBody({ type: RegisterWoredaAdminDto })
  @Post('register')
  async register(@Req() req, @Body() body: RegisterWoredaAdminDto) {
    return this.service.registerWoredaAdmin(req.user, body);
  }

  @ApiOperation({ summary: 'Update woreda admin' })
  @ApiBody({ type: UpdateWoredaAdminDto })
  @Post('update')
  async update(@Req() req, @Body() body: UpdateWoredaAdminDto) {
    return this.service.updateWoredaAdmin(req.user, body);
  }

  @ApiOperation({ summary: 'Change woreda admin password' })
  @ApiBody({ type: WoredaChangePasswordDto })
  @Post('change-password')
  async changePassword(@Req() req, @Body() body: WoredaChangePasswordDto) {
    return this.service.changePassword(req.user, body);
  }

  @ApiOperation({ summary: 'Toggle woreda admin status' })
  @ApiBody({ type: WoredaAdminIdDto })
  @Post('toggle')
  async toggle(@Req() req, @Body() body: WoredaAdminIdDto) {
    return this.service.toggleWoredaAdmin(req.user, body.woreda_admin_id);
  }

  @ApiOperation({ summary: 'Delete woreda admin' })
  @ApiBody({ type: WoredaAdminIdDto })
  @Post('delete')
  async delete(@Req() req, @Body() body: WoredaAdminIdDto) {
    return this.service.deleteWoredaAdmin(req.user, body.woreda_admin_id);
  }
}
