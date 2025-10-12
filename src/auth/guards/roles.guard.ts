// src/auth/guards/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service'; // adjust path as needed
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are specified, allow access
    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtAuthGuard

    if (!user) {
      throw new UnauthorizedException('You must log in first');
    }

    // ✅ Fetch the user's roles with their permissions
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      throw new ForbiddenException('User not found');
    }

    // ✅ Flatten all permissions the user has through their roles
    const userPermissions = userWithRoles.roles.flatMap((userRole) =>
      userRole.role.rolePermissions.map((rp) => rp.permission.permission_name),
    );

    // ✅ Check if the user has all required permissions
    const hasPermission = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have the required permission(s): ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
