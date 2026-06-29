import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthUserDto, AuthResponse } from '@edumeet/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthUserDto> {
    // Role default is student. In Milestone A, student email is optional.
    const roleDefault = 'student';
    
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          { username: dto.username }
        ].filter(cond => Object.keys(cond).length > 0)
      }
    });

    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new ConflictException('Tên đăng nhập này đã được sử dụng.');
      }
      throw new ConflictException('Email này đã được sử dụng.');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email || null,
        password: hashedPassword,
        name: dto.name,
        role: roleDefault,
        status: 'active',
      },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    const isMatch = await argon2.verify(user.password, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    const payload = { sub: user.id, username: user.username, role: user.role, name: user.name };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
      },
      accessToken,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại.');
    }

    const isOldMatch = await argon2.verify(user.password, dto.oldPassword);
    if (!isOldMatch) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác.');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new ConflictException('Mật khẩu mới không được trùng với mật khẩu cũ.');
    }

    const hashedNewPassword = await argon2.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
      },
    });
  }

  async getUserProfile(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại.');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    };
  }

  // Reserved words list for username generation
  private static readonly RESERVED_USERNAMES = new Set([
    'admin', 'root', 'system', 'teacher', 'manager', 'support', 'api', 'login', 'logout'
  ]);

  /**
   * Helper to generate a unique username based on the full name and handle collisions.
   */
  async generateUniqueUsername(name: string): Promise<string> {
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase();

    const words = normalized.trim().split(/\s+/);
    if (words.length === 0 || !words[0]) {
      return 'user' + Math.floor(1000 + Math.random() * 9000);
    }

    const firstName = words[words.length - 1];
    const initials = words.slice(0, words.length - 1).map(w => w.charAt(0)).join('');
    const basePrefix = `${firstName}${initials}`.replace(/[^a-z0-9]/g, '');

    let candidate = '';
    let isReserved = true;
    let attempts = 0;

    while (isReserved || attempts < 1000) {
      const randDigits = Math.floor(1000 + Math.random() * 9000);
      candidate = `${basePrefix}${randDigits}`;

      isReserved = AuthService.RESERVED_USERNAMES.has(candidate);
      if (!isReserved) {
        const exists = await this.prisma.user.findUnique({
          where: { username: candidate },
        });
        if (!exists) {
          return candidate;
        }
      }
      attempts++;
    }

    return `user${Date.now()}`;
  }

  /**
   * Helper to generate a unique student code in format STU-YYYY-XXXXX
   */
  async generateUniqueStudentCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}-`;

    const latestStudent = await this.prisma.studentProfile.findFirst({
      where: {
        studentCode: {
          startsWith: prefix,
        },
      },
      orderBy: {
        studentCode: 'desc',
      },
    });

    let nextNum = 1;
    if (latestStudent && latestStudent.studentCode) {
      const parts = latestStudent.studentCode.split('-');
      const numPart = parts[parts.length - 1];
      const parsed = parseInt(numPart!, 10);
      if (!parsed || isNaN(parsed)) {
        nextNum = 1;
      } else {
        nextNum = parsed + 1;
      }
    }

    const paddedNum = String(nextNum).padStart(5, '0');
    return `${prefix}${paddedNum}`;
  }
}
