import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleResponseDto } from './dtos/role.response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.create({
        data: createRoleDto
      });
      return this.mapToResponseDto(role);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Role with this name already exists.');
      }
      throw error;
    }
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.prisma.role.findMany();
    return roles.map((role) => this.mapToResponseDto(role));
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id: id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    return this.mapToResponseDto(role);
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    try {
      const role = await this.prisma.role.update({
        where: { id: id },
        data: updateRoleDto,
      });
      return this.mapToResponseDto(role);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Role with ID ${id} not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Role with this name already exists.');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.role.delete({
        where: { id: id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }
      throw error;
    }
  }

  private mapToResponseDto(role: {
    id: string;
    role_name: string;
    description?: string | null;
    created_at: Date;
    updated_at: Date;
  }): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.id = role.id;
    dto.role_name = role.role_name;
    dto.description = role.description ?? null;
  
    return dto;
  }
}
