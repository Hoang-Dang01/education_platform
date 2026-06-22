import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getCourses(@Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'admin' || role === 'manager') {
      return this.prisma.course.findMany({
        orderBy: { code: 'asc' },
      });
    }

    if (role === 'teacher') {
      return this.prisma.course.findMany({
        where: {
          classes: {
            some: {
              teacherId: userId,
            },
          },
        },
        orderBy: { code: 'asc' },
      });
    }

    // Students see courses they are enrolled in
    return this.prisma.course.findMany({
      where: {
        classes: {
          some: {
            enrollments: {
              some: {
                userId,
                status: 'active',
              },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }
}
