import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRoleDto } from './dtos/create-user-role.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { UserRoleResponseDto } from './dtos/user-role.response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RoleResponseDto } from '../roles/dtos/role.response.dto';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserRoleDto: CreateUserRoleDto,
  ): Promise<UserRoleResponseDto> {
    try {
      const userRole = await this.prisma.userRole.create({
        data: createUserRoleDto,
      });
      return this.mapToResponseDto(userRole);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'This user already has this role assigned.',
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'One or both of the provided UserID or RoleID do not exist.',
          );
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<UserRoleResponseDto[]> {
    const userRoles = await this.prisma.userRole.findMany({
      include: {
        user: true,
        role: true,
      },
    });
    return userRoles.map(this.mapToResponseDto);
  }

  async findOne(id: string): Promise<UserRoleResponseDto> {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: id },
      include: {
        user: true,
        role: true,
      },
    });
    if (!userRole) {
      throw new NotFoundException(`UserRole with ID ${id} not found.`);
    }
    return this.mapToResponseDto(userRole);
  }

  async update(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserRoleResponseDto> {
    try {
      const userRole = await this.prisma.userRole.update({
        where: { id: id },
        data: updateUserRoleDto,
      });
      return this.mapToResponseDto(userRole);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`UserRole with ID ${id} not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            'This user already has this role assigned.',
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'One or both of the provided UserID or RoleID do not exist.',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.userRole.delete({
        where: { id: id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`UserRole with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async findByUserId(user_id: string): Promise<UserRoleResponseDto[]> {
  const userRoles = await this.prisma.userRole.findMany({
    where: { user_id },
    include: {
      role: true,
    },
  });
    return userRoles.map(this.mapToResponseDto);
  }

  async removeRoleForUser(user_id: string, role_id: string): Promise<void> {
  const userRole = await this.prisma.userRole.findFirst({
    where: { user_id, role_id },
  });
  if (!userRole) {
    throw new NotFoundException(
      `UserRole with userId ${user_id} and roleId ${role_id} not found.`,
    );
  }
  await this.prisma.userRole.delete({
    where: { id: userRole.id },
  });
  }

  private mapToResponseDto(userRole: any): UserRoleResponseDto {
    const dto = new UserRoleResponseDto();
    dto.id = userRole.id;
    dto.user_id = userRole.user_id;
    dto.role_id = userRole.role_id;

    

    if (userRole.role) {
      dto.role = {
        id: userRole.role.role_id,
        role_name: userRole.role.role_name,
        description: userRole.role.description,
        createdAt: userRole.role.createdAt,
        updatedAt: userRole.role.updatedAt,
      } as RoleResponseDto;
    }

    return dto;
  }
}
