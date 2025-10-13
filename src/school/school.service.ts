import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.school.findMany({
      orderBy: { created_at: 'desc' },
       include: {
        woreda: {
          include:{
            subcity:true
          }
        }
       }
    });
  }

  async create(dto: CreateSchoolDto, user: any) {
    // Check duplicate in same woreda
    const exists = await this.prisma.school.findFirst({
      where: {
        name: dto.name,
        woreda_id: dto.woreda_id,
      },
    });
    if (exists) {
      throw new BadRequestException('Duplicated School name!');
    }
    

   return this.prisma.school.create({
      data: {
        name: dto.name,
        school_type: dto.school_type,
        woreda_id: dto.woreda_id, // must be a real ID from Woreda table
        added_by: user.id,
        status: true,
      },
    });
  }

  async update(dto: UpdateSchoolDto, user: any) {
    const school = await this.prisma.school.findFirst({
      where: { id: dto.school_id},
    });
    if (!school) throw new NotFoundException('School not found!');

    const duplicate = await this.prisma.school.findFirst({
      where: {
        name: dto.name,
        woreda_id: dto.woreda_id,
        NOT: { id: dto.school_id },
      },
    });
    if (duplicate) throw new BadRequestException('Duplicated School name!');

    return this.prisma.school.update({
      where: { id: dto.school_id },
      data: {
        name: dto.name,
        school_type: dto.school_type,
        woreda_id: dto.woreda_id,
        updated_by: user.id,
        updated_at: new Date(),
      },
    });
  }

  async delete(schoolId: string, user: any) {
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId },
      include:{
        users:true
      }
    });
    if (!school) throw new NotFoundException('Select valid school to delete!');
    if (school.users.length>0) throw new NotFoundException('There is student or teacher registered with this school so you can not delete it!');

    try {
      await this.prisma.school.delete({ where: { id: schoolId } });
      return { message: 'School deleted successfully' };
    } catch (err) {
      // Handle foreign key constraint errors
      if (err.code === 'P2003') {
        throw new BadRequestException('You cannot delete this school (it has users).');
      }
      throw err;
    }
  }

  async toggle(schoolId: string, user: any) {
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId },
    });
    if (!school) throw new NotFoundException('School not found!');

    return this.prisma.school.update({
      where: { id: schoolId },
      data: {
        status: school.status ? false : true,
        updated_by: user.id,
      },
    });
  }
}
