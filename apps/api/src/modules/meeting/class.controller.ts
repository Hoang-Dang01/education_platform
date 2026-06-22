import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getClasses(@Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;

    const includeRelations = {
      course: true,
      teacher: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    };

    if (role === 'admin' || role === 'manager') {
      return this.prisma.class.findMany({
        include: includeRelations,
        orderBy: { name: 'asc' },
      });
    }

    if (role === 'teacher') {
      return this.prisma.class.findMany({
        where: { teacherId: userId },
        include: includeRelations,
        orderBy: { name: 'asc' },
      });
    }

    // Students see classes they are enrolled in
    return this.prisma.class.findMany({
      where: {
        enrollments: {
          some: {
            userId,
            status: 'active',
          },
        },
      },
      include: includeRelations,
      orderBy: { name: 'asc' },
    });
  }
}
