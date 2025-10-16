import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { PermissionResponseDto } from './dtos/permission.response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    try {
      const permission = await this.prisma.permission.create({
        data: createPermissionDto,
      });
      return this.mapToResponseDto(permission);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Permission with this name already exists.',
        );
      }
      throw error;
    }
  }

  async findAll() {
    const permissions = await this.prisma.permission.findMany();
    

    return permissions;
  }

  async findOne(id: string): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id: id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found.`);
    }

    return this.mapToResponseDto(permission);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    try {
      const permission = await this.prisma.permission.update({
        where: { id: id },
        data: updatePermissionDto,
      });
      return this.mapToResponseDto(permission);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Permission with ID ${id} not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Permission with this name already exists.',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.permission.delete({
        where: { id: id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Permission with ID ${id} not found.`);
      }
      throw error;
    }
  }

  private mapToResponseDto(permission: any): PermissionResponseDto {
    return {
      permissionId: permission.permissionId,
      permissionName: permission.permissionName,
      description: permission.description
    };
  }

  
}
