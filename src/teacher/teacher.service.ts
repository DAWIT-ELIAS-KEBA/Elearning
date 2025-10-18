import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  // Fetch all teachers in the same school
  async fetchTeachers(schoolId: string) {
    return this.prisma.user.findMany({
      where: { user_type: 'teacher', school_id: schoolId },
      orderBy: { name: 'asc' },
    });
  }

 // Register new teacher
async registerTeacher(dto: any, addedBy: string, schoolId: string) {
  // Check if username already exists
  const existing = await this.prisma.user.findFirst({
    where: { user_name: dto.user_name },
  });
  if (existing) {
    throw new BadRequestException('Username already exists!');
  }


  const firstPassword = Array.from({ length: 4 }, () =>
      String.fromCharCode(
        Math.random() < 0.5
          ? 65 + Math.floor(Math.random() * 26) // A–Z
          : 97 + Math.floor(Math.random() * 26) // a–z
      )
    ).join('');


  return this.prisma.user.create({
    data: {
      name: dto.name,
      user_name: dto.user_name,
      gender: dto.gender,
      user_type: 'teacher',
      password: await bcrypt.hash(firstPassword, 10),
      first_password:firstPassword,
      added_by: addedBy,
      school_id: schoolId,
    },
  });
}

// Update teacher info
async updateTeacher(teacherId: string, dto: any, updatedBy: string, schoolId: string) {
  // Check if teacher exists
  const teacher = await this.prisma.user.findFirst({
    where: { id: teacherId, user_type: 'teacher' },
  });
  if (!teacher) throw new NotFoundException('Teacher not found');

  // Check for duplicate username excluding current teacher
  const duplicate = await this.prisma.user.findFirst({
    where: {
      user_name: dto.user_name,
      NOT: { id: teacherId },
    },
  });
  if (duplicate) {
    throw new BadRequestException('Username already exists!');
  }

  return this.prisma.user.update({
    where: { id: teacherId },
    data: {
      name: dto.name,
      user_name: dto.user_name,
      gender: dto.gender,
      updated_by: updatedBy,
    },
  });
}

  // Change teacher password
  async changePassword(teacherId: string, password: string, changedBy: string, schoolId: string) {
    const teacher = await this.prisma.user.findFirst({
      where: { id: teacherId, user_type: 'teacher', school_id: schoolId },
    });
    if (!teacher) throw new Error('Invalid teacher');

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.update({
      where: { id: teacherId },
      data: { password: hashedPassword, password_changed_by: changedBy },
    });
  }

  // Toggle teacher status (active / deactive)
  async toggleTeacher(teacherId: string, schoolId: string) {
    const teacher = await this.prisma.user.findFirst({
      where: { id: teacherId, user_type: 'teacher', school_id: schoolId },
    });
    if (!teacher) throw new Error('Invalid teacher');

    return this.prisma.user.update({
      where: { id: teacherId },
      data: { status: !teacher.status },
    });
  }

  // Delete teacher
  async deleteTeacher(teacherId: string, schoolId: string) {
    const teacher = await this.prisma.user.findFirst({
      where: { id: teacherId, user_type: 'teacher', school_id: schoolId },
    });
    if (!teacher) throw new Error('Invalid teacher');
    if (teacher.last_login) throw new Error('Cannot delete teacher with login history');

    return this.prisma.user.delete({ where: { id: teacherId } });
  }

  // Get books for teacher's assigned grade-courses
  async getBooks(teacherId: string) {
    const gradeCourses = await this.prisma.teacherGradeCourse.findMany({
      where: { teacher_id: teacherId },
      orderBy: { grade_id: 'asc' },
    });

     type GradeCourseWithBooks = {
    grade_course: {
        id: string;
        grade_id: string;
        teacher_id: string;
        course_id: string;
        added_by: string;
        created_at: Date;
        updated_at: Date;
    };
    books: {
        id: string;
        name: string;
        grade_id: string;
        course_id: string;
        status: boolean;
        resource_type: string; // adjust type if using enum
        created_at: Date;
        updated_at: Date;
    }[];
    };

  const result: GradeCourseWithBooks[] = [];

    for (const gc of gradeCourses) {
      const books = await this.prisma.resource.findMany({
        where: { course_id: gc.course_id, grade_id: gc.grade_id, status: true },
      });
      result.push({ grade_course: gc, books });
    }

    return result;
  }

  // Mark book/resource as downloaded by student or teacher
  async bookDownloaded(userId: string, userType: 'student' | 'teacher', bookId: string) {
    const currentYear = new Date().getFullYear();

    const book = await this.prisma.resource.findFirst({ where: { id: bookId, status: true } });
    if (!book) return;

    if (userType === 'student') {
      const existing = await this.prisma.studentDownload.findFirst({
        where: { resource_id: bookId, student_id: userId },
      });
      if (!existing || existing.year !== currentYear) {
        await this.prisma.studentDownload.create({
          data: { resource_id: bookId, student_id: userId, year: currentYear },
        });
      }
    } else if (userType === 'teacher') {
      const existing = await this.prisma.teacherDownload.findFirst({
        where: { resource_id: bookId, teacher_id: userId },
      });
      if (!existing || existing.year !== currentYear) {
        await this.prisma.teacherDownload.create({
          data: { resource_id: bookId, teacher_id: userId, year: currentYear },
        });
      }
    }
  }

  // Load book file as base64 via MinIO and mark download
  async loadBookFile(bookId: string, userId: string, userType: 'student' | 'teacher') {
    const book = await this.prisma.resource.findFirst({ where: { id: bookId, status: true } });
    if (!book) return '';

    try {
      // Use MinioService helper to get file as base64
      const base64Content = await this.minioService.getFileAsBase64(book.file_path);

      // Log download
      await this.bookDownloaded(userId, userType, bookId);

      return base64Content;
    } catch (err) {
      console.error('Error loading book from MinIO:', err);
      return '';
    }
  }
}
