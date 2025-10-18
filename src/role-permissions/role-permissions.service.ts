import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRolePermissionDto } from './dtos/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dtos/update-role-permission.dto';
import { RolePermissionResponseDto } from './dtos/role-permission.response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RoleResponseDto } from '../roles/dtos/role.response.dto';
import { PermissionResponseDto } from '../permissions/dtos/permission.response.dto';
import { CreateRolePermissionsDto } from './dtos/create-role-permissions.dto';
@Injectable()
export class RolePermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermissionResponseDto> {

    const role =await this.prisma.role.findFirst({
      where:{id:createRolePermissionDto.role_id}
    });

    const permission =await this.prisma.permission.findFirst({
      where:{id:createRolePermissionDto.permission_id}
    });

    if(!role)
    {
      throw new NotFoundException(
            'Role not found!',
          );
    }

    if(!permission)
    {
      throw new NotFoundException(
            'Permission not found!',
          );
    }

    if(role.type != permission.type)
    {
      throw new NotFoundException(
            'You can not assign this permission to this role!',
          );
    }

    try {
      const rolePermission = await this.prisma.rolePermission.create({
        data: createRolePermissionDto,
      });
      return this.mapToResponseDto(rolePermission);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'This role already has this permission assigned.',
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'One or both of the provided RoleID or PermissionID do not exist.',
          );
        }
      }
      throw error;
    }
  }

  async createMany(
    createRolePermissionDto: CreateRolePermissionsDto,
  ): Promise<RolePermissionResponseDto[]> {
    const { role_id, permissionIds } = createRolePermissionDto;

    const role = await this.prisma.role.findFirst({
      where: { id: role_id },
    });

    if (!role) {
      throw new NotFoundException('Role not found!');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('Some permissions not found!');
    }

    const hasDifferentType = permissions.some(
      (permission) => permission.type !== role.type,
    );

    if (hasDifferentType) {
      throw new NotFoundException('Invalid permission type found!');
    }

    // If all checks pass, you can prepare the data for insertion
    const data = permissionIds.map((permission_id) => ({
      role_id,
      permission_id,
    }));

    try {
      const createdRolePermissions = await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.rolePermission.create({
            data: item,
            include: { role: true, permission: true },
          }),
        ),
      );

      return createdRolePermissions.map(this.mapToResponseDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'One or more permissions are already assigned to this role.',
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'One or more provided RoleID or PermissionIDs do not exist.',
          );
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<RolePermissionResponseDto[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true,
      },
    });
    return rolePermissions.map(this.mapToResponseDto);
  }

  async findOne(id: string): Promise<RolePermissionResponseDto> {
    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: { id: id },
      include: {
        role: true,
        permission: true,
      },
    });
    if (!rolePermission) {
      throw new NotFoundException(`RolePermission with ID ${id} not found.`);
    }
    return this.mapToResponseDto(rolePermission);
  }

  async update(
    id: string,
    updateRolePermissionDto: UpdateRolePermissionDto,
  ): Promise<RolePermissionResponseDto> {
    try {
      const rolePermission = await this.prisma.rolePermission.update({
        where: { id: id },
        data: updateRolePermissionDto,
      });
      return this.mapToResponseDto(rolePermission);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `RolePermission with ID ${id} not found.`,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            'This role already has this permission assigned.',
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'One or both of the provided RoleID or PermissionID do not exist.',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.rolePermission.delete({
        where: { id: id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`RolePermission with ID ${id} not found.`);
      }
      throw error;
    }
  }

  private mapToResponseDto(rolePerm: any): RolePermissionResponseDto {
    const dto = new RolePermissionResponseDto();
    dto.id = rolePerm.id;
    dto.role_id = rolePerm.role_id;
    dto.permission_id = rolePerm.permissionId;
    dto.assigned_at= rolePerm.assigned_at;

    if (rolePerm.role) {
      dto.role = {
        id: rolePerm.role.id,
        role_name: rolePerm.role.role_name,
        description: rolePerm.role.description,
      } as RoleResponseDto;
    }

    if (rolePerm.permission) {
      dto.permission = {
        permissionId: rolePerm.permission.permissionId,
        permissionName: rolePerm.permission.permissionName,
        description: rolePerm.permission.description,
        createdAt: rolePerm.permission.createdAt,
        updatedAt: rolePerm.permission.updatedAt,
      } as PermissionResponseDto;
    }

    return dto;
  }

  async findPermissionsByRoleId(
    id: string,
  ): Promise<RolePermissionResponseDto[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { id },
      include: {
        permission: true,
      },
    });
    return rolePermissions.map(this.mapToResponseDto);
  }

  async syncRolePermissions(
    role_id: string,
    permissionIds: string[],
  ): Promise<RolePermissionResponseDto[]> {
    return this.prisma.$transaction(async (tx) => {
      const existingRolePermissions = await tx.rolePermission.findMany({
        where: { role_id },
        select: { id: true, permission_id: true },
      });

      const existingPermissionIds = existingRolePermissions.map(
        (rp) => rp.permission_id,
      );

      const permissionsToDelete = existingRolePermissions.filter(
        (rp) => !permissionIds.includes(rp.permission_id),
      );

      const permissionsToAdd = permissionIds.filter(
        (id) => !existingPermissionIds.includes(id),
      );
      if (permissionsToDelete.length > 0) {
        await tx.rolePermission.deleteMany({
          where: {
            id: {
              in: permissionsToDelete.map((rp) => rp.id),
            },
          },
        });
      }
      if (permissionsToAdd.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionsToAdd.map((permission_id) => ({
            role_id,
            permission_id,
          })),
        });
      }
      const updatedRolePermissions = await tx.rolePermission.findMany({
        where: { role_id },
        include: { role: true, permission: true },
      });

      return updatedRolePermissions.map(this.mapToResponseDto);
    });
  }

  async addPermissionsToRole(
    role_id: string,
    permissionIds: string[],
  ): Promise<RolePermissionResponseDto[]> {
    return this.prisma.$transaction(async (tx) => {
      const existingRolePermissions = await tx.rolePermission.findMany({
        where: { role_id },
        select: { permission_id: true },
      });
      const existingPermissionIds = existingRolePermissions.map(
        (rp) => rp.permission_id,
      );
      const permissionsToAdd = permissionIds.filter(
        (id) => !existingPermissionIds.includes(id),
      );

      if (permissionsToAdd.length === 0) {
        const currentRolePermissions = await tx.rolePermission.findMany({
          where: { role_id },
          include: { role: true, permission: true },
        });
        return currentRolePermissions.map(this.mapToResponseDto);
      }

      await tx.rolePermission.createMany({
        data: permissionsToAdd.map((permission_id) => ({
          role_id,
          permission_id,
        })),
      });
      const updatedRolePermissions = await tx.rolePermission.findMany({
        where: { role_id },
        include: { role: true, permission: true },
      });

      return updatedRolePermissions.map(this.mapToResponseDto);
    });
  }
}
