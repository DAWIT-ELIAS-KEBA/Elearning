import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class WoredaAdminService {
  constructor(private prisma: PrismaService) {}

  async getWoredasBySubcity(subcityId: string) {
    return this.prisma.woreda.findMany({ where: { subcity_id: subcityId } });
  }

  async fetchWoredaAdmins(subcityId: string) {
    const woredas = await this.getWoredasBySubcity(subcityId);
    const woredaIds = woredas.map(w => w.id);
    if (woredaIds.length === 0) woredaIds.push('00000000-0000-0000-0000-000000000000');

    return this.prisma.user.findMany({
      where: {
        user_type: 'admin',
        admin_level: 'woreda',
        woreda_id: { in: woredaIds },
      },
      include: {
        woreda: true,
        addedBy: true,
        updatedBy: true,
        passwordChangedBy: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Register new Woreda Admin
async registerWoredaAdmin(user: any, data: any) {
  // Check if Woreda exists
  const woreda = await this.prisma.woreda.findFirst({
    where: { id: data.woreda_id, subcity_id: user.subcity_id },
  });
  if (!woreda) throw new BadRequestException('Invalid woreda selected');

  // Check for duplicate username
  const existing = await this.prisma.user.findFirst({
    where: { user_name: data.user_name },
  });
  if (existing) throw new BadRequestException('Duplicated woreda admin user name!');

  return this.prisma.user.create({
    data: {
      name: data.name,
      user_name: data.user_name,
      gender: data.gender,
      user_type: 'admin',
      admin_level: 'woreda',
      password: await bcrypt.hash('12345678', 10),
      added_by: user.id,
      woreda_id: data.woreda_id,
    },
  });
}

// Update Woreda Admin
async updateWoredaAdmin(user: any, data: any) {
  const woredaIds = (await this.getWoredasBySubcity(user.subcity_id)).map(w => w.id);

  // Find the Woreda admin
  const admin = await this.prisma.user.findFirst({
    where: {
      id: data.woreda_admin_id,
      user_type: 'admin',
      admin_level: 'woreda',
      woreda_id: { in: woredaIds },
    },
  });
  if (!admin) throw new NotFoundException('Invalid woreda admin selected');

  // Check for duplicate username excluding current admin
  const duplicate = await this.prisma.user.findFirst({
    where: {
      user_name: data.user_name,
      NOT: { id: data.woreda_admin_id },
    },
  });
  if (duplicate) throw new BadRequestException('Duplicated woreda admin user name!');

  return this.prisma.user.update({
    where: { id: data.woreda_admin_id },
    data: {
      name: data.name,
      user_name: data.user_name,
      gender: data.gender,
      woreda_id: data.woreda_id,
      updated_by: user.id,
    },
  });
}

  async changePassword(user: any, data: any) {
    const woredaIds = (await this.getWoredasBySubcity(user.subcity_id)).map(w => w.id);
    const admin = await this.prisma.user.findFirst({
      where: {
        id: data.woreda_admin_id,
        user_type: 'admin',
        admin_level: 'woreda',
        woreda_id: { in: woredaIds },
      },
    });
    if (!admin) throw new NotFoundException('Invalid woreda admin selected');

    return this.prisma.user.update({
      where: { id: data.woreda_admin_id },
      data: {
        password: await bcrypt.hash(data.password, 10),
        password_changed_by: user.id,
      },
    });
  }

  async deleteWoredaAdmin(user: any, woredaAdminId: string) {
    const woredaIds = (await this.getWoredasBySubcity(user.subcity_id)).map(w => w.id);
    const admin = await this.prisma.user.findFirst({
      where: {
        id: woredaAdminId,
        user_type: 'admin',
        admin_level: 'woreda',
        woreda_id: { in: woredaIds },
      },
    });
    if (!admin) throw new NotFoundException('Invalid woreda admin selected');

    if (admin.last_login) throw new BadRequestException('You cannot delete this admin');

    await this.prisma.user.delete({ where: { id: woredaAdminId } });
    return { message: 'Deleted successfully' };
  }

  async toggleWoredaAdmin(user: any, woredaAdminId: string) {
    const woredaIds = (await this.getWoredasBySubcity(user.subcity_id)).map(w => w.id);
    const admin = await this.prisma.user.findFirst({
      where: {
        id: woredaAdminId,
        user_type: 'admin',
        admin_level: 'woreda',
        woreda_id: { in: woredaIds },
      },
    });
    if (!admin) throw new NotFoundException('Invalid woreda admin selected');

    return this.prisma.user.update({
      where: { id: woredaAdminId },
      data: { status: !admin.status },
    });
  }
}
