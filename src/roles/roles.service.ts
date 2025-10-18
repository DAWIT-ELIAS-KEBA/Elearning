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

    if(createRoleDto.type!="admin" && createRoleDto.type!="director")
    {
      throw new ConflictException('Invalid role type!');
    }
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

  async findAll(){
    return await this.prisma.role.findMany({include:{rolePermissions:{include:{permission:true}}}});
    
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

    const updatingRole = await this.prisma.role.findFirst({
      where: { id: id },
      include:{
        rolePermissions:{include:{
          permission:true
        }

        }
      }
    });
    if(!updatingRole)
    {
      throw new NotFoundException(`Invalid role!`);
    }
    if(updateRoleDto.type!="admin" && updateRoleDto.type!="director")
    {
      throw new ConflictException('Invalid role type!');
    }
    if(updatingRole.type != updateRoleDto.type)
    {
       updatingRole.rolePermissions.forEach(rolePermission => {
          if(rolePermission.permission.type != updateRoleDto.type)
          {
            throw new NotFoundException(`Permission and role type miss matched. First remove `+updateRoleDto.type+` permissions from this role!` );
          }
       });
    }
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
