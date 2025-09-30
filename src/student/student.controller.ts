import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto, StudentChangePasswordDto } from './dto/student.dto';
import { UpdateStudentDto } from './dto/student.dto';
import { DeleteStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Student')
@Controller('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)

export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: 'View all students' })
  async findAll( @Req() req) {
    const schoolId = req['user']?.school_id || 0;
    return this.studentService.findAll(schoolId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new student' })
  async create(@Body() dto: CreateStudentDto, @Req() req) {
    const userId = req['user']?.id || 0;
    const schoolId = req['user']?.school_id || 0;
    return this.studentService.create(dto, userId,schoolId);
  }

  @Patch(':id')
@ApiOperation({ summary: 'Update student' })
async update(@Body() dto: UpdateStudentDto, @Req() req) {
  const userId = req['user']?.id || 0;
  const schoolId = req['user']?.school_id || 0;
  return this.studentService.update(dto, userId, schoolId);
}

  @Post('change-password')
  @ApiOperation({ summary: 'Change student password' })
  async changePassword(@Body() dto: StudentChangePasswordDto, @Req() req) {
    const userId = req['user']?.id || 0;
    const schoolId = req['user']?.school_id || 0;
    return this.studentService.changePassword(dto, userId,schoolId);
  }

  @Get('toggle')
  @ApiOperation({ summary: 'Enable/disable student' })
  async toggle(@Query('student_id') studentId: string, @Req() req) {
    const schoolId = req['user']?.school_id || 0;
    return this.studentService.toggle(studentId,schoolId);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete student' })
  async delete(@Body() dto: DeleteStudentDto, @Req() req) {
    const schoolId = req['user']?.school_id || 0;
    return this.studentService.delete(dto,schoolId);
  }
}
