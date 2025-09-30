import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubcityAdminService } from './subcity-admin.service';
import { RegisterSubcityAdminDto, UpdateSubcityAdminDto, SubcityAdminChangePasswordDto, SubcityAdminIdDto } from './dto/subcity-admin.dto';

@ApiTags('Subcity Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subcity-admin')
export class SubcityAdminController {
  constructor(private readonly service: SubcityAdminService) {}


  @ApiOperation({ summary: 'Fetch all subcity admins' })
  @Get('list')
  async fetch() {
    return this.service.fetchSubcityAdmins();
  }

  @ApiOperation({ summary: 'Register new subcity admin' })
  @ApiBody({ type: RegisterSubcityAdminDto })
  @Post('register')
  async register(@Req() req, @Body() body: RegisterSubcityAdminDto) {
    return this.service.registerSubcityAdmin(req.user, body);
  }

  @ApiOperation({ summary: 'Update subcity admin' })
  @ApiBody({ type: UpdateSubcityAdminDto })
  @Post('update')
  async update(@Req() req, @Body() body: UpdateSubcityAdminDto) {
    return this.service.updateSubcityAdmin(req.user, body);
  }

  @ApiOperation({ summary: 'Change subcity admin password' })
  @ApiBody({ type: SubcityAdminChangePasswordDto })
  @Post('change-password')
  async changePassword(@Req() req, @Body() body: SubcityAdminChangePasswordDto) {
    return this.service.changePassword(req.user, body);
  }

  @ApiOperation({ summary: 'Toggle subcity admin status' })
  @ApiBody({ type: SubcityAdminIdDto })
  @Post('toggle')
  async toggle(@Req() req, @Body() body: SubcityAdminIdDto) {
    return this.service.toggleSubcityAdmin(req.user, body.subcity_admin_id);
  }

  @ApiOperation({ summary: 'Delete subcity admin' })
  @ApiBody({ type: SubcityAdminIdDto })
  @Post('delete')
  async delete(@Req() req, @Body() body: SubcityAdminIdDto) {
    return this.service.deleteSubcityAdmin(req.user, body.subcity_admin_id);
  }
}
