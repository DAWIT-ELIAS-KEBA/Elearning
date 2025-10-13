
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
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WoredaService } from './woreda.service';
import type { Request } from 'express';
import { CreateWoredaDto } from './dto/create-woreda.dto';
import { UpdateWoredaDto } from './dto/update-woreda.dto';
import { DeleteWoredaDto } from './dto/delete-woreda.dto';

@ApiTags('Woreda')
@Controller('subcity/woredas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)

export class WoredaController {
  constructor(private readonly woredaService: WoredaService) {}

  @Get()
  @ApiOperation({ summary: 'View all woredas by subcity' })
  async findAll(@Req() req) {
    return this.woredaService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Register new woreda' })
  @ApiBody({ type: CreateWoredaDto })
  async create(@Body() dto: CreateWoredaDto, @Req() req) {
    const userId = req['user']?.id || 'system';
    return this.woredaService.create(dto, userId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update woreda' })
  @ApiBody({ type: UpdateWoredaDto })
  async update(@Body() dto: UpdateWoredaDto, @Req() req) {
    const userId = req['user']?.id || 'system';
    return this.woredaService.update(dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete woreda' })
  @ApiParam({ name: 'id', description: 'Woreda ID' })
  @ApiBody({ type: DeleteWoredaDto })
  async delete(@Param('id') id: string) {
    return this.woredaService.delete(id);
  }

}