import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Course')
@ApiBearerAuth() // Tells Swagger these endpoints require auth
@Controller('course')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all courses' })
  findAll() {
    return this.courseService.fetchCourses();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new course' })
  @ApiBody({ type: CreateCourseDto })
  async register(@Body() dto: CreateCourseDto, @Req() req) {
    const userId = req.user.id;
    return this.courseService.registerCourse(dto, userId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update existing course' })
  @ApiBody({ type: UpdateCourseDto })
  async update(@Body() dto: UpdateCourseDto, @Req() req) {
    const userId = req.user.id;
    return this.courseService.updateCourse(dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  delete(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }

  @Patch('toggle/:id')
  @ApiOperation({ summary: 'Toggle course status (enable/disable)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  toggle(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.courseService.toggleCourse(id, userId);
  }
}
