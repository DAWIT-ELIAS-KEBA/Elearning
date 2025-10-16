import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCityAdminDto, UpdateCityAdminDto, CityChangePasswordDto } from './dto//city-admin.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CityAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchCityAdmins() {
    return this.prisma.user.findMany({
      where: {
        user_type: 'admin',
        admin_level: 'city',
        NOT: { name: 'adminadmin' },
      },
      orderBy: { name: 'asc' },
    });
  }

  async registerCityAdmin(authUser: any, dto: RegisterCityAdminDto) {
    const existing = await this.prisma.user.findUnique({ where: { user_name: dto.user_name } });
    if (existing) throw new BadRequestException('Duplicated city admin username!');

    if(dto.school_id)
    {
       const school=await this.prisma.school.findUnique({ where: { id: dto.school_id } });
       if(!school)
       {
          throw new BadRequestException('Invalid school selected!')
       }
    }

    return this.prisma.user.create({
      data: {
        name: dto.name,
        user_name: dto.user_name,
        gender: dto.gender,
        user_type: 'admin',
        admin_level: dto.school_id?'city':'school',
        password: await bcrypt.hash('12345678', 10),
        school_id: dto.school_id?dto.school_id:null,
        added_by: authUser.id,
      },
    });
  }

  async updateCityAdmin(authUser: any, dto: UpdateCityAdminDto) {
    const cityAdmin = await this.prisma.user.findFirst({
      where: { id: dto.city_admin_id, user_type: 'admin', admin_level: 'city' },
    });
    if (!cityAdmin) throw new NotFoundException('Invalid city admin selected!');

    if(dto.school_id)
    {
       const school=await this.prisma.school.findUnique({ where: { id: dto.school_id } });
       if(!school)
       {
          throw new BadRequestException('Invalid school selected!')
       }
    }
    
    return this.prisma.user.update({
      where: { id: dto.city_admin_id },
      data: {
        name: dto.name,
        user_name: dto.user_name,
        gender: dto.gender,
        admin_level: dto.school_id?'city':'school',
        updated_by: authUser.id,
        school_id: dto.school_id?dto.school_id:null,
      },
    });
  }

  async changePassword(authUser: any, dto: CityChangePasswordDto) {
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException('Password confirmed incorrectly!');
    }

    const cityAdmin = await this.prisma.user.findFirst({
      where: { id: dto.city_admin_id, user_type: 'admin', admin_level: 'city' },
    });
    if (!cityAdmin) throw new NotFoundException('Invalid city admin selected!');

    return this.prisma.user.update({
      where: { id: dto.city_admin_id },
      data: {
        password: await bcrypt.hash(dto.password, 10),
        password_changed_by: authUser.id,
      },
    });
  }

  async toggleCityAdmin(city_admin_id: string) {
    const cityAdmin = await this.prisma.user.findFirst({
      where: { id: city_admin_id, user_type: 'admin', admin_level: 'city' },
    });
    if (!cityAdmin) throw new NotFoundException('Invalid city admin selected!');

    return this.prisma.user.update({
      where: { id: city_admin_id },
      data: { status: cityAdmin.status ? false : true },
    });
  }

  async deleteCityAdmin(city_admin_id: string) {
    const cityAdmin = await this.prisma.user.findFirst({
      where: { id: city_admin_id, user_type: 'admin', admin_level: 'city' },
    });
    if (!cityAdmin) throw new NotFoundException('Invalid city admin selected!');

    if (cityAdmin.last_login) throw new BadRequestException('You cannot delete this city admin!');

    return this.prisma.user.delete({ where: { id: city_admin_id } });
  }

  // Optional: implement backup logic here if needed
}
