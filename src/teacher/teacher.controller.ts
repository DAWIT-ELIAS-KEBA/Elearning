// teacher.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/teacher.dto';
import { UpdateTeacherDto } from './dto/teacher.dto';
import { TeacherChangePasswordDto } from './dto/teacher.dto';
import { DeleteTeacherDto } from './dto/teacher.dto';
import { ToggleTeacherDto } from './dto/teacher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Teachers')
@Controller('teacher')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('list')
  @ApiOperation({ summary: 'List all teachers' })
  async findAll(@Req() req) {
    const schoolId = req.user?.school_id;
    return this.teacherService.fetchTeachers(schoolId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new teacher' })
  async create(@Body() dto: CreateTeacherDto, @Req() req) {
    const addedBy = req.user?.id;
    const schoolId = req.user?.school_id;
    return this.teacherService.registerTeacher(dto, addedBy, schoolId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update teacher details' })
  async update(@Body() dto: UpdateTeacherDto, @Req() req) {
    const schoolId = req.user?.school_id;
    return this.teacherService.updateTeacher(dto.teacher_id, dto, req.user.id, schoolId);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change teacher password' })
  async changePassword(@Body() dto: TeacherChangePasswordDto, @Req() req) {
    const schoolId = req.user?.school_id;
    return this.teacherService.changePassword(dto.teacher_id, dto.password, req.user.id, schoolId);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete teacher' })
  async delete(@Body() dto: DeleteTeacherDto, @Req() req) {
    const schoolId = req.user?.school_id;
    return this.teacherService.deleteTeacher(dto.teacher_id, schoolId);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Enable or disable teacher' })
  async toggle(@Body() dto: ToggleTeacherDto, @Req() req) {
    const schoolId = req.user?.school_id;
    return this.teacherService.toggleTeacher(dto.teacher_id, schoolId);
  }

  @Get('books')
  @ApiOperation({ summary: 'Get teacher assigned books' })
  async books(@Req() req) {
    const userId = req.user?.id;
    return this.teacherService.getBooks(userId);
  }

  @Get('load-book-file')
  @ApiOperation({ summary: 'Load book file as base64' })
  async loadBookFile(@Query('book_id') bookId: string, @Req() req) {
    const userId = req.user?.id;
    const userType: 'student' | 'teacher' = req.user?.user_type;
    return this.teacherService.loadBookFile(bookId, userId, userType);
  }
}
