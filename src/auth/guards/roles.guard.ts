// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtAuthGuard

    if (!user) {
      throw new UnauthorizedException('You must login first');
    }

    const roleChecks: Record<string, (u: any) => boolean> = {
      student: (u) => u.user_type === 'student',
      teacher: (u) => u.user_type === 'teacher',
      director: (u) =>
        u.user_type === 'admin' && u.admin_level === 'school' && !!u.school_id,
      woreda_admin: (u) =>
        u.user_type === 'admin' && u.admin_level === 'woreda' && !!u.woreda_id,
      subcity_admin: (u) =>
        u.user_type === 'admin' && u.admin_level === 'subcity' && !!u.subcity_id,
      city_admin: (u) =>
        u.user_type === 'admin' && u.admin_level === 'city',
    };

    const hasRole = requiredRoles.some((role) => roleChecks[role]?.(user));

    if (!hasRole) {
      throw new ForbiddenException('You are not authorized for this role');
    }

    return true;
  }
}
