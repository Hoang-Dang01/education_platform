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

    const selectFields = {
      id: true,
      code: true,
      name: true,
      description: true,
      status: true,
      materials: {
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          title: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          filePath: true,
          isPrivate: true,
          uploadedBy: {
            select: {
              name: true,
            },
          },
          uploadedAt: true,
        },
      },
      classes: {
        select: {
          id: true,
          name: true,
          teacher: {
            select: {
              name: true,
            },
          },
          enrollments: {
            select: {
              id: true,
            },
          },
          sessions: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    };

    const mapCourses = (coursesList: any[]) => {
      return coursesList.map(course => ({
        ...course,
        materials: (course.materials || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          fileName: m.fileName,
          fileType: m.fileType,
          fileSize: m.fileSize,
          filePath: m.filePath,
          isPrivate: m.isPrivate,
          uploadedBy: m.uploadedBy?.name || 'Hệ thống',
          uploadedAt: m.uploadedAt,
        })),
      }));
    };

    if (role === 'admin' || role === 'manager') {
      const list = await this.prisma.course.findMany({
        select: selectFields,
        orderBy: { code: 'asc' },
      });
      return mapCourses(list);
    }

    if (role === 'teacher') {
      const list = await this.prisma.course.findMany({
        where: {
          classes: {
            some: {
              teacherId: userId,
            },
          },
        },
        select: selectFields,
        orderBy: { code: 'asc' },
      });
      return mapCourses(list);
    }

    // Students see courses they are enrolled in
    const list = await this.prisma.course.findMany({
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
      select: selectFields,
      orderBy: { code: 'asc' },
    });
    return mapCourses(list);
  }
}
