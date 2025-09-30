
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WoredaService } from './woreda.service';
import type { Request } from 'express';
import type { CreateWoredaDto } from './dto/create-woreda.dto';
import type { UpdateWoredaDto } from './dto/update-woreda.dto';
import type { DeleteWoredaDto } from './dto/delete-woreda.dto';

@ApiTags('Woreda')
@Controller('subcity/woredas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)

export class WoredaController {
  constructor(private readonly woredaService: WoredaService) {}

  @Get()
  @ApiOperation({ summary: 'View all woredas by subcity' })
  async findAll(@Req() req) {
    const subcityId = req['user']?.subcity_id;
    return this.woredaService.findAllBySubcity(subcityId);
  }

  @Post()
  @ApiOperation({ summary: 'Register new woreda' })
  async create(@Body() dto: CreateWoredaDto, @Req() req) {
    const userId = req['user']?.id || 'system';
    const subcityId = req['user']?.subcity_id;
    return this.woredaService.create(dto, userId, subcityId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update woreda' })
  async update(@Body() dto: UpdateWoredaDto, @Req() req) {
    const userId = req['user']?.id || 'system';
    return this.woredaService.update(dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete woreda' })
  @ApiParam({ name: 'id', description: 'Woreda ID' })
  async delete(@Param('id') id: string) {
    return this.woredaService.delete(id);
  }

  @Get('/subcity-info')
  @ApiOperation({ summary: 'Get subcity info for logged-in user' })
  async getSubcityInfo(@Req() req: Request) {
    return this.woredaService.getSubcityInfo(req['user']);
  }
}