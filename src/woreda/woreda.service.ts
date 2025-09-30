import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWoredaDto } from './dto/create-woreda.dto';
import { UpdateWoredaDto } from './dto/update-woreda.dto';

@Injectable()
export class WoredaService {
  private woredas: any[] = []; // Mock storage, replace with DB repo

  async findAllBySubcity(subcityId: string) {
    return this.woredas.filter(w => w.subcity_id === subcityId);
  }

  async create(dto: CreateWoredaDto, userId: string, subcityId: string) {
    const newWoreda = {
      id: Date.now().toString(),
      name: dto.woreda_name,
      subcity_id: subcityId,
      added_by: userId,
    };
    this.woredas.push(newWoreda);
    return newWoreda;
  }

  async update(dto: UpdateWoredaDto, userId: string) {
    const woreda = this.woredas.find(w => w.id === dto.woreda_id);
    if (!woreda) throw new NotFoundException('Woreda not found');

    woreda.name = dto.woreda_name;
    woreda.updated_by = userId;
    return woreda;
  }

  async delete(woredaId: string) {
    const index = this.woredas.findIndex(w => w.id === woredaId);
    if (index === -1) throw new NotFoundException('Woreda not found');
    const deleted = this.woredas.splice(index, 1);
    return { message: 'Woreda deleted successfully', deleted };
  }

  async getSubcityInfo(user: any) {
    return {
      id: user.subcity_id,
      subcity_name: user.subcity_name || 'Unknown',
    };
  }
}
