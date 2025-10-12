import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // -------------------
  // LOGIN
  // -------------------
 async login(user_name: string, password: string) {
  // Fetch user with relations
  const user = await this.prisma.user.findUnique({
    where: { user_name },
    include: {
      school: true,
      woreda: true,
      subcity: true,
      grade: true,
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
        }
      }
    },
  });

  if (!user) throw new UnauthorizedException('Invalid credentials');

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

  // Sign JWT
  const payload = { sub: user.id, user_name: user.user_name, user_type: user.user_type, subcity_id: user.subcity_id, woreda_id: user.woreda_id, school_id: user.school_id };
  const access_token = this.jwtService.sign(payload);

  // Return token + user info

  const permissions = user.roles.flatMap((userRole) =>
    userRole.role.rolePermissions.map((rp) => rp.permission.permission_name),
  );

  // 🔹 Remove duplicates (if same permission appears via multiple roles)
  const uniquePermissions = [...new Set(permissions)];


  return {
    access_token,
    user: {
      id: user.id,
      name: user.name,
      user_name: user.user_name,
      gender: user.gender,
      user_type: user.user_type,
      woreda_id: user.woreda_id,
      status: user.status,
      last_login: user.last_login,
      photo: user.photo,
      school: user.school ? { id: user.school.id, name: user.school.name } : null,
      woreda: user.woreda ? { id: user.woreda.id, name: user.woreda.name } : null,
      subcity: user.subcity ? { id: user.subcity.id, name: user.subcity.name } : null,
      grade: user.grade ? { id: user.grade.id, name: user.grade.name } : null,
       roles: user.roles.map((r) => ({
        id: r.role.id,
        name: r.role.role_name,
      })),
      permissions: uniquePermissions, 
    },
  };
}


  // -------------------
  // CHANGE PASSWORD
  // -------------------
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    changedById?: string, // optional, e.g., admin changing password
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId },select: {
    id: true,
    name: true,
    user_name: true,
    password: true, // must include password
    // any other fields needed
  } });
  
    if (!user) throw new NotFoundException('User not found');

    // Validate current password if user is changing own password
    if (!changedById) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        password_changed_by: changedById || userId,
      },
    });
  }



  

  
}
