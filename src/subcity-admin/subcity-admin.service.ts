import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterSubcityAdminDto, UpdateSubcityAdminDto, SubcityAdminChangePasswordDto } from './dto/subcity-admin.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SubcityAdminService {
  constructor(private readonly prisma: PrismaService) {}



  async fetchSubcityAdmins() {
    return this.prisma.user.findMany({
      where: {
        user_type: 'admin',
        admin_level: 'subcity',
      },
      orderBy: { name: 'asc' },
      include: {
        subcity: true,
        addedBy: true,
        updatedBy: true,
        passwordChangedBy: true,
      },
    });
  }

 // Register new Subcity Admin
  async registerSubcityAdmin(authUser: any, dto: RegisterSubcityAdminDto) {
    // Check if username already exists
    const existing = await this.prisma.user.findUnique({
      where: { user_name: dto.user_name },
    });
    if (existing) throw new BadRequestException('Duplicated subcity admin user name!');

    return this.prisma.user.create({
      data: {
        name: dto.name,
        user_name: dto.user_name,
        gender: dto.gender,
        user_type: 'admin',
        admin_level: 'subcity',
        password: await bcrypt.hash('12345678', 10),
        added_by: authUser.id,
        subcity_id: dto.subcity_id,
      },
    });
  }

  // Update Subcity Admin
  async updateSubcityAdmin(authUser: any, dto: UpdateSubcityAdminDto) {
    // Check if subcity admin exists
    const subcityAdmin = await this.prisma.user.findFirst({
      where: { id: dto.subcity_admin_id, user_type: 'admin', admin_level: 'subcity' },
    });
    if (!subcityAdmin) throw new NotFoundException('Invalid subcity admin selected!');

    // Check for duplicate username excluding current subcity admin
    const duplicate = await this.prisma.user.findFirst({
      where: {
        user_name: dto.user_name,
        NOT: { id: dto.subcity_admin_id },
      },
    });
    if (duplicate) throw new BadRequestException('Duplicated subcity admin user name!');

    return this.prisma.user.update({
      where: { id: dto.subcity_admin_id },
      data: {
        name: dto.name,
        user_name: dto.user_name,
        gender: dto.gender,
        updated_by: authUser.id,
        subcity_id: dto.subcity_id,
      },
    });
  }

  async changePassword(authUser: any, dto: SubcityAdminChangePasswordDto) {
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException('Password confirmed incorrectly!');
    }

    const subcityAdmin = await this.prisma.user.findFirst({
      where: { id: dto.subcity_admin_id, user_type: 'admin', admin_level: 'subcity' },
    });
    if (!subcityAdmin) throw new NotFoundException('Invalid subcity admin selected!');

    return this.prisma.user.update({
      where: { id: dto.subcity_admin_id },
      data: {
        password: await bcrypt.hash(dto.password, 10),
        password_changed_by: authUser.id,
      },
    });
  }

  async toggleSubcityAdmin(authUser: any, subcityAdminId: string) {
    const subcityAdmin = await this.prisma.user.findFirst({
      where: { id: subcityAdminId, user_type: 'admin', admin_level: 'subcity' },
    });
    if (!subcityAdmin) throw new NotFoundException('Invalid subcity admin selected!');

    return this.prisma.user.update({
      where: { id: subcityAdminId },
      data: { status: subcityAdmin.status ? false : true },
    });
  }

  async deleteSubcityAdmin(authUser: any, subcityAdminId: string) {
    const subcityAdmin = await this.prisma.user.findFirst({
      where: { id: subcityAdminId, user_type: 'admin', admin_level: 'subcity' },
    });
    if (!subcityAdmin) throw new NotFoundException('Invalid subcity admin selected!');

    if (subcityAdmin.last_login) {
      throw new BadRequestException('You cannot delete this subcity admin!');
    }

    return this.prisma.user.delete({ where: { id: subcityAdminId } });
  }
}
