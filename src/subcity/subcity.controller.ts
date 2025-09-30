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
import type { Request } from 'express';
import { SubcityService } from './subcity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSubcityDto, UpdateSubcityDto, DeleteSubcityDto } from './dto/subcity.dto';

@ApiTags('Subcity')
@Controller('city/subcities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SubcityController {
  constructor(private readonly subcityService: SubcityService) {}

  @Get()
  @ApiOperation({ summary: 'View all subcities' })
  async findAll() {
    return this.subcityService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Register a new subcity' })
  async create(@Body() dto: CreateSubcityDto, @Req() req) {
    const userId = req['user']?.id || 'system';
    return this.subcityService.create(dto, userId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update subcity details' })
  async update(@Body() dto: UpdateSubcityDto) {
    return this.subcityService.update(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subcity' })
  @ApiParam({ name: 'id', description: 'Subcity ID', example: 'uuid-of-subcity' })
  async delete(@Param('id') id: string) {
    return this.subcityService.delete(id);
  }
}
