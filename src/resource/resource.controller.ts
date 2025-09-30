import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@ApiTags('Resource')
@ApiBearerAuth()
@Controller('resource')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all resources' })
  fetchAll() {
    return this.resourceService.fetchAll();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new resource' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        grade_id: { type: 'string' },
        course_id: { type: 'string' },
        chapter: { type: 'number' },
        lesson: { type: 'number' },
        file_type: { type: 'string', enum: ['pdf', 'video', 'image'] },
        is_teacher_guidance: { type: 'boolean' },
        status: { type: 'boolean' },
        file: { type: 'string', format: 'binary' }, // file input
      },
      required: ['name', 'grade_id', 'course_id', 'file_type', 'file'],
    },
  })
  register(
    @Body() dto: CreateResourceDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.resourceService.create(dto, file, req.user.id);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update existing resource' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resource_id: { type: 'string' },
        name: { type: 'string' },
        grade_id: { type: 'string' },
        course_id: { type: 'string' },
        chapter: { type: 'number' },
        lesson: { type: 'number' },
        file_type: { type: 'string', enum: ['pdf', 'video', 'image'] },
        is_teacher_guidance: { type: 'boolean' },
        status: { type: 'boolean' },
        file: { type: 'string', format: 'binary' }, // optional
      },
      required: ['resource_id'],
    },
  })
  update(
    @Body() dto: UpdateResourceDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.resourceService.update(dto, file, req.user.id);
  }

  @Patch('toggle/:id')
  @ApiOperation({ summary: 'Enable/Disable a resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  toggle(@Param('id') id: string, @Req() req) {
    return this.resourceService.toggle(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  delete(@Param('id') id: string) {
    return this.resourceService.delete(id);
  }

  @Get('fileUrl/:id')
  @ApiOperation({ summary: 'Get presigned download URL for a resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  getPresignedUrl(@Param('id') id: string) {
    return this.resourceService.getResourcePresignedUrl(id);
  }


}
