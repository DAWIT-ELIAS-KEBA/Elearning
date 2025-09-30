import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlacklistService } from 'src/blacklist/blacklist.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService,  private readonly blacklistService: BlacklistService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
      passReqToCallback: true, // ✅ important
    });
  }

  async validate(req: any, payload: any) {
    // Get raw token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) throw new UnauthorizedException('No token found');

    if (await this.blacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token invalidated');
    }

    return { id: payload.sub, user_name: payload.user_name, user_type: payload.user_type,subcity_id: payload.subcity_id, woreda_id: payload.woreda_id,school_id: payload.school_id };
  }
}
