import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

import {
  CreateDirectorDto,
  UpdateDirectorDto,
  DirectorChangePasswordDto,
  DeleteDirectorDto,
  ToggleDirectorDto,
} from './dto/director.dto';

@Injectable()
export class DirectorService {
  constructor(private prisma: PrismaService) {}

  // Fetch all directors in a woreda
  async fetchDirectors(woredaId: string) {
    const schools = await this.prisma.school.findMany({
      where: { woreda_id: woredaId },
      select: { id: true },
    });
    const schoolIds = schools.length ? schools.map((s) => s.id) : ['-1'];

    return this.prisma.user.findMany({
      where: {
        user_type: 'admin',
        admin_level: 'school',
        school_id: { in: schoolIds },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Register new Director
async registerDirector(dto: CreateDirectorDto, addedBy: string, woredaId: string) {
  // Validate school belongs to woreda
  const school = await this.prisma.school.findFirst({
    where: { id: dto.school_id, woreda_id: woredaId },
  });
  if (!school) throw new BadRequestException('Invalid school selected');

  // Check for duplicate username
  const existing = await this.prisma.user.findFirst({
    where: { user_name: dto.user_name },
  });
  if (existing) throw new BadRequestException('Duplicated director user name!');

  return this.prisma.user.create({
    data: {
      name: dto.name,
      user_name: dto.user_name,
      gender: dto.gender,
      user_type: 'admin',
      admin_level: 'school',
      password: await bcrypt.hash('12345678', 10),
      added_by: addedBy,
      school_id: dto.school_id,
    },
  });
}

// Update Director info
async updateDirector(dto: UpdateDirectorDto, userId: string, woredaId: string) {
  const schools = await this.prisma.school.findMany({
    where: { woreda_id: woredaId },
    select: { id: true },
  });
  const schoolIds = schools.length ? schools.map((s) => s.id) : ['-1'];

  // Find director
  const director = await this.prisma.user.findFirst({
    where: {
      id: dto.director_id,
      user_type: 'admin',
      admin_level: 'school',
      school_id: { in: schoolIds },
    },
  });
  if (!director) throw new NotFoundException('Invalid director selected');

  // Check for duplicate username excluding current director
  const duplicate = await this.prisma.user.findFirst({
    where: {
      user_name: dto.user_name,
      NOT: { id: dto.director_id },
    },
  });
  if (duplicate) throw new BadRequestException('Duplicated director user name!');

  return this.prisma.user.update({
    where: { id: dto.director_id },
    data: {
      name: dto.name,
      user_name: dto.user_name,
      gender: dto.gender,
      updated_by: userId,
    },
  });
}

  // Change director password
  async changePassword(dto: DirectorChangePasswordDto, userId: string, woredaId: string) {
    const schools = await this.prisma.school.findMany({
      where: { woreda_id: woredaId },
      select: { id: true },
    });
    const schoolIds = schools.length ? schools.map((s) => s.id) : ['-1'];

    const director = await this.prisma.user.findFirst({
      where: {
        id: dto.director_id,
        user_type: 'admin',
        admin_level: 'school',
        school_id: { in: schoolIds },
      },
    });

    if (!director) throw new NotFoundException('Director not found');

    return this.prisma.user.update({
      where: { id: dto.director_id },
      data: {
        password: await bcrypt.hash(dto.password, 10),
        password_changed_by: userId,
      },
    });
  }

  // Delete director
  async deleteDirector(dto: DeleteDirectorDto, woredaId: string) {
    const schools = await this.prisma.school.findMany({
      where: { woreda_id: woredaId },
      select: { id: true },
    });
    const schoolIds = schools.length ? schools.map((s) => s.id) : ['-1'];

    const director = await this.prisma.user.findFirst({
      where: {
        id: dto.director_id,
        user_type: 'admin',
        admin_level: 'school',
        school_id: { in: schoolIds },
      },
    });

    if (!director) throw new NotFoundException('Director not found');
    if (director.last_login) throw new BadRequestException('You cannot delete this director');

    await this.prisma.user.delete({ where: { id: dto.director_id } });
    return 'Director deleted successfully';
  }

  // Toggle director status
  async toggleDirector(dto: ToggleDirectorDto, woredaId: string) {
    const schools = await this.prisma.school.findMany({
      where: { woreda_id: woredaId },
      select: { id: true },
    });
    const schoolIds = schools.length ? schools.map((s) => s.id) : ['-1'];

    const director = await this.prisma.user.findFirst({
      where: {
        id: dto.director_id,
        user_type: 'admin',
        admin_level: 'school',
        school_id: { in: schoolIds },
      },
    });

    if (!director) throw new NotFoundException('Director not found');

    return this.prisma.user.update({
      where: { id: dto.director_id },
      data: { status: !director.status },
    });
  }
}
