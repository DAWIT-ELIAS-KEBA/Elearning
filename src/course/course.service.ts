import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async registerCourse(dto: CreateCourseDto, userId: string) {
    // Check for duplicate course
    const exists = await this.prisma.course.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('Duplicated course name!!');
    }

    const course = await this.prisma.course.create({
      data: {
        name: dto.name,
        added_by: userId,
      },
    });

    return { success: true, course };
  }

  async updateCourse(dto: UpdateCourseDto, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.course_id },
    });

    if (!course) {
      throw new BadRequestException('Select valid course!!');
    }

    // Check for duplicate name except current course
    const duplicate = await this.prisma.course.findFirst({
      where: {
        name: dto.name,
        NOT: { id: dto.course_id },
      },
    });

    if (duplicate) {
      throw new BadRequestException('Duplicated course name!!');
    }

    const updated = await this.prisma.course.update({
      where: { id: dto.course_id },
      data: {
        name: dto.name,
        updated_by: userId,
      },
    });

    return { success: true, updated };
  }

  async toggleCourse(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new BadRequestException('Select valid course!!');

    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: !course.status,
        updated_at: userId,
      },
    });

    return { success: true, updated };
  }

  async deleteCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new BadRequestException('Select valid course to delete!!');

    // Check relations
    const hasRelations =
      (await this.prisma.gradeCourse.count({ where: { course_id: courseId } })) > 0 ||
      (await this.prisma.resource.count({ where: { course_id: courseId } })) > 0 ||
      (await this.prisma.teacherGradeCourse.count({ where: { course_id: courseId } })) > 0;

    if (hasRelations) throw new BadRequestException('You cannot delete this course!!');

    await this.prisma.course.delete({ where: { id: courseId } });
    return { success: true };
  }

  async fetchCourses() {
    return this.prisma.course.findMany({
      orderBy: { name: 'asc' },
      include: {
        addedBy: true,
        updatedBy: true,
      },
    });
  }
}
