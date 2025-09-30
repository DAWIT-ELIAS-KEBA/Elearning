import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { TeacherCourseService } from './teacher-course.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Teacher Courses')
@Controller('teacher-course')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)

export class TeacherCourseController {
  constructor(private readonly service: TeacherCourseService) {}

  @Get('list')
  @ApiOperation({ summary: 'Fetch teachers and their grade-courses' })
  async list(@Req() req) {
    const schoolId = req.user?.school_id || '';
    return this.service.fetchTeacherCourses(schoolId);
  }

  @Get('grade-courses')
  @ApiOperation({ summary: 'Fetch courses for a grade and teacher' })
  async gradeCourses(@Query('teacher_id') teacherId: string, @Query('grade_id') gradeId: string) {
    return this.service.fetchGradeCourse(teacherId, gradeId);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign grade-course to teacher' })
  async assign(@Body() body: { teacher_id: string; grade_id: string; course_id: string }, @Req() req) {
    return this.service.assignTeacherCourse(body.teacher_id, body.grade_id, body.course_id, req.user.id);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete teacher grade-course assignment' })
  async delete(@Body() body: { assign_id: string }, @Req() req) {
    return this.service.deleteTeacherGradeCourse(body.assign_id, req.user.school_id);
  }
}
