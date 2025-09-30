import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddGradeCourseDto } from './dto/add-grade-course.dto';
import { RemoveGradeCourseDto } from './dto/remove-grade-course.dto';

@Injectable()
export class GradeService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------
  // VIEW GRADES
  // -------------------------------
  async viewGrades() {
    const grades = await this.prisma.grade.findMany({
      include: {
        grade_courses: {
          include: { course: true },
        },
      },
    });

    return grades;
  }

  // -------------------------------
  // UNASSIGNED COURSES
  // -------------------------------
  async unassignedCourses(gradeId: string) {
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        grade_courses: { include: { course: true } },
      },
    });

    if (!grade) {
      throw new NotFoundException('Select valid grade!!');
    }

    const allCourses = await this.prisma.course.findMany();

    return allCourses.map((course) => ({
      ...course,
      status: grade.grade_courses.some((gc) => gc.course_id === course.id)
        ? 1
        : 0,
    }));
  }

  // -------------------------------
  // ADD GRADE COURSE
  // -------------------------------
  async addGradeCourse(dto: AddGradeCourseDto, userId: string) {
    const grade = await this.prisma.grade.findUnique({
      where: { id: dto.grade_id },
    });
    if (!grade) throw new NotFoundException('Select valid grade!!');

    const course = await this.prisma.course.findUnique({
      where: { id: dto.course_id },
    });
    if (!course) throw new NotFoundException('Select valid course!!');

    const existing = await this.prisma.gradeCourse.findUnique({
      where: {
        grade_id_course_id: {
          grade_id: dto.grade_id,
          course_id: dto.course_id,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'This course is already assigned for this grade!!',
      );
    }

    const relation = await this.prisma.gradeCourse.create({
      data: {
        grade_id: dto.grade_id,
        course_id: dto.course_id,
        added_by: userId,
      },
    });

    return { success: true, relation };
  }

  // -------------------------------
  // REMOVE GRADE COURSE
  // -------------------------------
  async removeGradeCourse(dto: RemoveGradeCourseDto) {
    await this.prisma.gradeCourse.deleteMany({
      where: {
        grade_id: dto.grade_id,
        course_id: dto.course_id,
      },
    });

    return { success: true };
  }
}
