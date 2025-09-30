import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DirectorService } from './director.service';
import { CreateDirectorDto, UpdateDirectorDto, DirectorChangePasswordDto, DeleteDirectorDto, ToggleDirectorDto } from './dto/director.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Director')
@ApiBearerAuth() 
@Controller('woreda/director')
@UseGuards(JwtAuthGuard)
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Get('fetch')
  async fetchDirectors(@Req() req) {
    return this.directorService.fetchDirectors(req.user.woreda_id);
  }

  @Post('register')
  async registerDirector(@Body() dto: CreateDirectorDto, @Req() req) {
    return this.directorService.registerDirector(dto, req.user.id, req.user.woreda_id);
  }

  @Post('update')
  async updateDirector(@Body() dto: UpdateDirectorDto, @Req() req) {
    return this.directorService.updateDirector(dto, req.user.id, req.user.woreda_id);
  }

  @Post('change-password')
  async changePassword(@Body() dto: DirectorChangePasswordDto, @Req() req) {
    return this.directorService.changePassword(dto, req.user.id, req.user.woreda_id);
  }

  @Post('delete')
  async deleteDirector(@Body() dto: DeleteDirectorDto, @Req() req) {
    return this.directorService.deleteDirector(dto, req.user.woreda_id);
  }

  @Post('toggle')
  async toggleDirector(@Body() dto: ToggleDirectorDto, @Req() req) {
    return this.directorService.toggleDirector(dto, req.user.woreda_id);
  }
}
