import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getSessions(@Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;

    const includeRelations = {
      class: {
        include: {
          course: true,
          teacher: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      },
    };

    if (role === 'admin' || role === 'manager') {
      return this.prisma.session.findMany({
        include: includeRelations,
        orderBy: { startTime: 'desc' },
      });
    }

    if (role === 'teacher') {
      return this.prisma.session.findMany({
        where: {
          class: {
            teacherId: userId,
          },
        },
        include: includeRelations,
        orderBy: { startTime: 'desc' },
      });
    }

    // Students see sessions for classes they are enrolled in
    return this.prisma.session.findMany({
      where: {
        class: {
          enrollments: {
            some: {
              userId,
              status: 'active',
            },
          },
        },
      },
      include: includeRelations,
      orderBy: { startTime: 'desc' },
    });
  }
}
