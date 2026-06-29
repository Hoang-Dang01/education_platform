import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUserDto, AuthResponse } from '@edumeet/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthUserDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.id, dto);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any): Promise<AuthUserDto> {
    return this.authService.getUserProfile(req.user.id);
  }
}
