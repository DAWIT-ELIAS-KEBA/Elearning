import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWoredaDto } from './dto/create-woreda.dto';
import { UpdateWoredaDto } from './dto/update-woreda.dto';

@Injectable()
export class WoredaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.woreda.findMany({
      where: { status: true },
      include: {
        subcity: true,
        addedBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });
  }

  async create(dto: CreateWoredaDto, userId: string) {
    return this.prisma.woreda.create({
      data: {
        name: dto.woreda_name,
        subcity_id: dto.subcityId,
        added_by: userId,
      },
    });
  }

  async update(dto: UpdateWoredaDto, userId: string) {
    const woreda = await this.prisma.woreda.findUnique({
      where: { id: dto.woreda_id },
    });

    if (!woreda) throw new NotFoundException('Woreda not found');

    return this.prisma.woreda.update({
      where: { id: dto.woreda_id },
      data: {
        name: dto.woreda_name,
        subcity_id: dto.subcityId,
        updated_by: userId,
      },
    });
  }

  async delete(woredaId: string) {
    const woreda = await this.prisma.woreda.findUnique({
      where: { id: woredaId },
      include: {
        schools:true}
    });

    if (!woreda) throw new NotFoundException('Woreda not found');

    if(woreda.schools.length>0)
    {
       if (!woreda) throw new NotFoundException('First delete all schools under this woredas!');
    }

    await this.prisma.woreda.delete({ where: { id: woredaId } });
    return { message: 'Woreda deleted successfully' };
  }

 
}
