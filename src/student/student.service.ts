import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto, UpdateStudentDto, StudentChangePasswordDto, DeleteStudentDto } from './dto/student.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return this.prisma.user.findMany({
      where: { user_type: 'student', school_id: schoolId },
    });
  }

  async create(dto: CreateStudentDto, userId: string, schoolId: string) {
    // 1. Check duplicate user_name
    const exists = await this.prisma.user.findUnique({
      where: { user_name: dto.user_name },
    });
    if (exists) throw new BadRequestException('Duplicated student user name!!');

    // 2. Validate grade_id
    const grade = await this.prisma.grade.findUnique({
      where: { id: dto.grade_id },
    });
    if (!grade) {
      throw new BadRequestException('Invalid grade_id provided');
    }

    // 3. Create student
    return await this.prisma.user.create({
      data: {
        name: dto.name,
        user_name: dto.user_name,
        gender: dto.gender,
        user_type: 'student',
        password: await bcrypt.hash('12345678', 10),
        added_by: userId,
        school_id: schoolId,
        section: dto.section,
        grade_id: dto.grade_id,
      },
    });

  }


  async update(dto: UpdateStudentDto, userId: string, schoolId: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: dto.student_id,
        user_type: 'student',
        school_id: schoolId,
      },
    });
    if (!student) throw new NotFoundException('Invalid student selected!!');

    const duplicate = await this.prisma.user.findFirst({
      where: {
        user_name: dto.user_name,
        id: { not: dto.student_id },
      },
    });
    if (duplicate) throw new BadRequestException('Duplicated user name!!');

    return await this.prisma.user.update({
      where: { id: dto.student_id },
      data: {
        name: dto.name,
        user_name: dto.user_name,
        gender: dto.gender,
        grade_id: dto.grade_id,
        section: dto.section,
        updated_by: userId,
      },
    });

   
  }

  async changePassword(dto: StudentChangePasswordDto, userId: string, schoolId: string) {
    if (dto.password !== dto.confirm_password) {
      throw new BadRequestException('Password confirmed incorrectly!!');
    }

    const student = await this.prisma.user.findFirst({
      where: {
        id: dto.student_id,
        user_type: 'student',
        school_id: schoolId,
      },
    });
    if (!student) throw new NotFoundException('Select valid student to change password!!');

    await this.prisma.user.update({
      where: { id: dto.student_id },
      data: {
        password: await bcrypt.hash(dto.password, 10),
        password_changed_by: userId,
      },
    });

    return 'yes';
  }

  async delete(dto: DeleteStudentDto, schoolId: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: dto.student_id,
        user_type: 'student',
        school_id: schoolId,
      },
    });
    if (!student) throw new NotFoundException('Select valid student to delete!!');
    if (student.last_login) throw new BadRequestException('You can not delete this student!!');

    await this.prisma.user.delete({ where: { id: dto.student_id } });
    return 'yes';
  }

  async toggle(studentId: string, schoolId: string) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: studentId,
        user_type: 'student',
        school_id: schoolId,
      },
    });
    if (!student) throw new NotFoundException('Select valid student to disable or enable!!');

    await this.prisma.user.update({
      where: { id: studentId },
      data: { status: student.status ? false : true },
    });

    return 'yes';
  }
}
