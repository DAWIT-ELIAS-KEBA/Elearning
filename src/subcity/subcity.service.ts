import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubcityDto } from './dto/subcity.dto';
import {  UpdateSubcityDto } from './dto/subcity.dto';


@Injectable()
export class SubcityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subcity.findMany({
      orderBy: { name: 'asc' },
      include: {
        addedBy: true,
        updatedBy: true,
      },
    });
  }

  async create(dto: CreateSubcityDto, userId: string) {
    // Check if subcity with the same name already exists
    const existing = await this.prisma.subcity.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Subcity with this name already exists!');
    }

    const subcity = await this.prisma.subcity.create({
      data: {
        name: dto.name,
        added_by: userId,
      },
    });

    return { message: 'Subcity registered successfully', subcity };
  }

  async update(dto: UpdateSubcityDto) {
    // Check if the subcity exists
    const subcity = await this.prisma.subcity.findUnique({
      where: { id: dto.id },
    });
    if (!subcity) throw new NotFoundException('Subcity not found');

    // Check for duplicate name excluding the current subcity
    const duplicate = await this.prisma.subcity.findFirst({
      where: {
        name: dto.name,
        NOT: { id: dto.id }, // exclude current id
      },
    });
    if (duplicate) {
      throw new BadRequestException('Another subcity with this name already exists!');
    }

    // Update subcity
    const updatedSubcity=await this.prisma.subcity.update({
      where: { id: dto.id },
      data: { name: dto.name },
    });

    return { message: 'Subcity updated successfully',updatedSubcity };
  }

  async delete(id: string) {
    // Find the subcity
    const subcity = await this.prisma.subcity.findUnique({
      where: { id },
      include: {
        users: true,   // Include related users
        woredas: true, // Include related woredas
      },
    });

    if (!subcity) throw new NotFoundException('Subcity not found');

    // Check if it has related users or woredas
    if (subcity.users.length > 0 || subcity.woredas.length > 0) {
      throw new BadRequestException(
        'Subcity cannot be deleted because it has associated users or woredas'
      );
    }

    // Safe to delete
    await this.prisma.subcity.delete({ where: { id } });

    return { message: 'Subcity deleted successfully' };
  }
}
