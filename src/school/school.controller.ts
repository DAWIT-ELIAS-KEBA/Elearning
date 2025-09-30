import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@ApiTags('School')
@Controller('schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  @ApiOperation({ summary: 'View all schools in user woreda' })
  async findAll(@Req() req) {
    return this.schoolService.findAllByWoreda(req.user.woreda_id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new school' })
  async create(@Body() dto: CreateSchoolDto, @Req() req) {
    return this.schoolService.create(dto, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update school' })
  @ApiParam({ name: 'id', description: 'School ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateSchoolDto, @Req() req) {
    dto.school_id = id;
    return this.schoolService.update(dto, req['user']);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete school' })
  @ApiParam({ name: 'id', description: 'School ID' })
  async delete(@Param('id') id: string, @Req() req) {
    return this.schoolService.delete(id, req['user']);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Enable/disable school' })
  @ApiParam({ name: 'id', description: 'School ID' })
  async toggle(@Param('id') id: string, @Req() req) {
    return this.schoolService.toggle(id, req['user']);
  }
}
