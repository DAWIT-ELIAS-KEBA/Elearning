import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeacherCourseService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch all teachers with their grade-courses for a school
  async fetchTeacherCourses(schoolId: string) {
    const teachers = await this.prisma.user.findMany({
      where: { user_type: 'teacher', school_id: schoolId },
      orderBy: { name: 'asc' },
    });

    // Define a type for the array elements
    type TeacherWithGradeCourses = {
    teacher: {
        id: string;
        name: string;
        user_name: string;
        gender: string;
        // ...add any other fields you need
    };
    gradeCourses: {
        id: string;
        grade: string;
        course: string;
    }[];
    };

    // Initialize the array with the correct type
    const result: TeacherWithGradeCourses[] = [];

    for (const teacher of teachers) {
      const gradeCourses = await this.prisma.teacherGradeCourse.findMany({
        where: { teacher_id: teacher.id },
        orderBy: { grade_id: 'asc' },
        include: { grade: true,course: true },
      });

      result.push({
        teacher,
        gradeCourses: gradeCourses.map(gc => ({
          id: gc.id,
          grade: gc.grade.name,
          course: gc.course.name,
        })),
      });
    }

    return result;
  }

  // Fetch grade courses and mark if assigned to teacher
  // Fetch grade courses and mark if assigned to teacher
    async fetchGradeCourse(teacherId: string, gradeId: string) {
    const grade = await this.prisma.grade.findUnique({
        where: { id: gradeId },
        include: {
        grade_courses: {
            include: { course: true }, // include course to access its name
        },
        },
    });

    if (!grade) return [];

    return Promise.all(
        grade.grade_courses.map(async (gc) => {
        const isAssigned = await this.prisma.teacherGradeCourse.findFirst({
            where: {
            teacher_id: teacherId,
            grade_id: gradeId,
            course_id: gc.course_id,
            },
        });

        return {
            id: gc.id,
            name: gc.course.name, // now you can access name
            is_assigned: !!isAssigned,
        };
        })
    );
    }

  // Assign grade-course to teacher
  async assignTeacherCourse(teacherId: string, gradeId: string, courseId: string, addedBy: string) {
    const teacher = await this.prisma.user.findFirst({
      where: { id: teacherId, user_type: 'teacher' },
    });
    if (!teacher) throw new BadRequestException('Invalid teacher');

    const grade = await this.prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade) throw new BadRequestException('Invalid grade');

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new BadRequestException('Invalid course');

    const exists = await this.prisma.teacherGradeCourse.findFirst({
      where: { teacher_id: teacherId, grade_id: gradeId, course_id: courseId },
    });
    if (exists) throw new BadRequestException('Grade-course already assigned');

    return this.prisma.teacherGradeCourse.create({
      data: { teacher_id: teacherId, grade_id: gradeId, course_id: courseId, added_by: addedBy },
    });
  }

  // Delete teacher grade-course assignment
  async deleteTeacherGradeCourse(assignId: string, schoolId: string) {
    const tgc = await this.prisma.teacherGradeCourse.findUnique({ where: { id: assignId } });
    if (!tgc) throw new NotFoundException('Teacher-grade-course not found');

    const teacher = await this.prisma.user.findFirst({
      where: { id: tgc.teacher_id, user_type: 'teacher' },
    });
    if (!teacher) throw new BadRequestException('Cannot delete assignment');

    await this.prisma.teacherGradeCourse.delete({ where: { id: assignId } });
    return 'Deleted successfully';
  }
}
