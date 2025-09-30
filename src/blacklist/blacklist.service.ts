// src/blacklist/blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlacklistService {
  constructor(private readonly prisma: PrismaService) {}

  async add(token: string, expireAt: Date) {
    return this.prisma.blacklistedToken.create({
      data: { token, expireAt },
    });
  }

  async isBlacklisted(token: string) {
    const record = await this.prisma.blacklistedToken.findUnique({
      where: { token },
    });
    return !!record;
  }
}