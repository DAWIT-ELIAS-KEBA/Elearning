import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GradeService } from './grade.service';
import { AddGradeCourseDto } from './dto/add-grade-course.dto';
import { RemoveGradeCourseDto } from './dto/remove-grade-course.dto';

@ApiTags('Grade')
@ApiBearerAuth()
@Controller('grade')
@UseGuards(JwtAuthGuard)
export class GradeController {
  constructor(private gradeService: GradeService) {}

  @Get('view')
  @ApiOperation({ summary: 'View all grades' })
  viewGrades() {
    return this.gradeService.viewGrades();
  }

  @Get('unassigned-course')
  @ApiOperation({ summary: 'List courses with assigned/unassigned status for a grade' })
  @ApiQuery({ name: 'grade_id', description: 'Grade ID', required: true })
  unassignedCourses(@Query('grade_id') gradeId: string) {
    return this.gradeService.unassignedCourses(gradeId);
  }

  @Post('add-course')
  @ApiOperation({ summary: 'Assign a course to a grade' })
  @ApiBody({ type: AddGradeCourseDto })
  addGradeCourse(@Body() dto: AddGradeCourseDto, @Req() req) {
    return this.gradeService.addGradeCourse(dto, req.user.id);
  }

  @Post('remove-course')
  @ApiOperation({ summary: 'Remove a course from a grade' })
  @ApiBody({ type: RemoveGradeCourseDto })
  removeGradeCourse(@Body() dto: RemoveGradeCourseDto) {
    return this.gradeService.removeGradeCourse(dto);
  }
}