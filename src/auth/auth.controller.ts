import { Controller, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthChangePasswordDto, AuthLoginDto } from './dto/auth.dto';
import { BlacklistService } from 'src/blacklist/blacklist.service';
// -------------------
// DTOs
// -------------------


// -------------------
// Extend Request
// -------------------
interface AuthenticatedRequest extends Request {
  user: { id: string; user_name: string };
}

// -------------------
// Controller
// -------------------
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,  private readonly blacklistService: BlacklistService) {}

  // -------------------
  // LOGIN
  // -------------------
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: AuthLoginDto })
  async login(@Body() body: AuthLoginDto) {
    return this.authService.login(body.user_name, body.password);
  }

  // -------------------
  // CHANGE PASSWORD
  // -------------------
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth() // Indicates JWT auth required
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: AuthChangePasswordDto })
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: AuthChangePasswordDto,
  ) {
    const userId = req.user.id; // safely typed
    return this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }

@Post('logout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async logout(@Req() req: AuthenticatedRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new UnauthorizedException('Authorization header missing');
  const token = authHeader.split(' ')[1];
  await this.blacklistService.add(token, new Date(Date.now() + 3600 * 1000));
  return { message: 'Successfully logged out' };
}

  
}
