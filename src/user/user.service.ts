// src/user/user.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, user_name: true, photo: true },
    });
  }

  async changePhoto(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Upload your profile photo!!');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Select valid profile photo!!');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Selected photo is larger than 2MB!!');
    }

    const randomName = randomBytes(10).toString('hex');
    const ext = file.originalname.split('.').pop();
    const objectName = `users/${userId}/${randomName}.${ext}`;

    // Upload file to MinIO using new service
    await this.minioService.uploadFile(objectName, file.buffer, {
      'Content-Type': file.mimetype,
    });

    // Generate presigned URL (optional) or use direct object name path
    const photoUrl = await this.minioService.getPresignedUrl(objectName);

    // Update user in database
    await this.prisma.user.update({
      where: { id: userId },
      data: { photo: photoUrl },
    });

    return { success: true, photo: photoUrl };
  }

  async changePassword(userId: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('Password confirmed incorrectly!!');
    }

    if (password.length < 4) {
      throw new BadRequestException('Password must be at least 4 characters!!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword,is_pwd_changed:true,first_password:"" },
    });

    return { success: true };
  }
}
