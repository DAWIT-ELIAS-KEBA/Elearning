import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Client } from 'minio';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResourceService {
  private minioClient: Client;
  private readonly bucketName = 'resources';

  constructor(private readonly prisma: PrismaService) {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  async uploadFile(file: Express.Multer.File, fileType: string): Promise<string> {
    const exists = await this.minioClient.bucketExists(this.bucketName).catch(() => false);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
    }

    if (fileType === 'pdf' && file.mimetype !== 'application/pdf') throw new BadRequestException('Only PDF allowed');
    if (fileType === 'video' && !file.mimetype.startsWith('video/')) throw new BadRequestException('Only video allowed');
    if (fileType === 'image' && !file.mimetype.startsWith('image/')) throw new BadRequestException('Only image allowed');

    const objectName = `${randomUUID()}-${file.originalname}`;
    await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size, { 'Content-Type': file.mimetype });
    return `${this.bucketName}/${objectName}`;
  }

  async create(dto: CreateResourceDto, file: Express.Multer.File, userId: string) {
    if (!file) throw new BadRequestException('File is required');
    const filePath = await this.uploadFile(file, dto.file_type);

    const grade = await this.prisma.grade.findUnique({ where: { id: dto.grade_id } });
    if (!grade) throw new BadRequestException('Invalid grade_id');

    const course = await this.prisma.course.findUnique({ where: { id: dto.course_id } });
    if (!course) throw new BadRequestException('Invalid course_id');


    const chapter = dto.chapter !== undefined ? Number(dto.chapter) : undefined;
    const lesson = dto.lesson !== undefined ? Number(dto.lesson) : undefined;

    // is_teacher_guidance and status are booleans
    const isTeacherGuidance = dto.is_teacher_guidance !== undefined
      ? dto.is_teacher_guidance === 'true' || dto.is_teacher_guidance === true
      : false;

    const status = dto.status !== undefined
      ? dto.status === 'true' || dto.status === true
      : true;

      return this.prisma.resource.create({
        data: {
          id: randomUUID(),
          name: dto.name,
          grade_id: dto.grade_id,
          course_id: dto.course_id,
          chapter,
          lesson,
          file_path: filePath,
          added_by: userId,
          is_teacher_guidance: isTeacherGuidance,
          status,
          resource_type: dto.file_type,
        },
      });
  }


  async update(dto: UpdateResourceDto, file: Express.Multer.File | undefined, userId: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id: dto.resource_id } });
    if (!resource) throw new NotFoundException('Resource not found');

    let filePath = resource.file_path;
    if (file) {
      if (!dto.file_type) throw new BadRequestException('file_type is required when uploading a new file');
      filePath = await this.uploadFile(file, dto.file_type);
    }


    const grade = await this.prisma.grade.findUnique({ where: { id: dto.grade_id } });
    if (!grade) throw new BadRequestException('Invalid grade_id');

    const course = await this.prisma.course.findUnique({ where: { id: dto.course_id } });
    if (!course) throw new BadRequestException('Invalid course_id');



   let chapter = dto.chapter !== undefined ? Number(dto.chapter) : resource.chapter;
    let lesson = dto.lesson !== undefined ? Number(dto.lesson) : resource.lesson;
    let isTeacherGuidance = dto.is_teacher_guidance !== undefined
      ? dto.is_teacher_guidance === 'true' || dto.is_teacher_guidance === true
      : resource.is_teacher_guidance;
    let status = dto.status !== undefined
      ? dto.status === 'true' || dto.status === true
      : resource.status;

    return this.prisma.resource.update({
      where: { id: dto.resource_id },
      data: {
        name: dto.name ?? resource.name,
        grade_id: dto.grade_id ?? resource.grade_id,
        course_id: dto.course_id ?? resource.course_id,
        chapter,
        lesson,
        file_path: filePath,
        is_teacher_guidance: isTeacherGuidance,
        status,
        resource_type: dto.file_type ?? resource.resource_type,
        updated_by: userId,
      },
    });
  }

  async toggle(resourceId: string, userId: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new NotFoundException('Resource not found');

    return this.prisma.resource.update({
      where: { id: resourceId },
      data: { status: !resource.status, updated_by: userId },
    });
  }

  async delete(resourceId: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new NotFoundException('Resource not found');

    const objectName = resource.file_path.split('/').slice(1).join('/');
    await this.minioClient.removeObject(this.bucketName, objectName).catch(() => null);

    await this.prisma.resource.delete({ where: { id: resourceId } });
    return { success: true, deleted: resourceId };
  }

  async fetchAll() {
    return this.prisma.resource.findMany({
      include: { grade: true, course: true, addedBy: true, updatedBy: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async fetchOne(resourceId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: { grade: true, course: true, addedBy: true, updatedBy: true, studentDownloads: true, teacherDownloads: true },
    });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }
}
