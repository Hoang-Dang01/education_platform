import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../../database/prisma.service';
import { MeetingService } from './meeting.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(
    private prisma: PrismaService,
    private meetingService: MeetingService,
  ) {}


  /**
   * For backwards compatibility: returns all sessions associated with user role
   */
  @Get()
  async getSessions(@Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;

    const includeRelations = {
      class: {
        include: {
          course: true,
          teacher: {
            select: { id: true, email: true, name: true, role: true },
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
          class: { teacherId: userId },
        },
        include: includeRelations,
        orderBy: { startTime: 'desc' },
      });
    }

    return this.prisma.session.findMany({
      where: {
        class: {
          enrollments: {
            some: { userId, status: 'active' },
          },
        },
      },
      include: includeRelations,
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * GET /sessions/upcoming
   * Returns active/live and future scheduled sessions
   */
  @Get('upcoming')
  async getUpcomingSessions(@Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;

    const includeRelations = {
      class: {
        include: {
          course: true,
          teacher: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      },
    };

    const whereCondition: any = {
      status: { in: ['scheduled', 'live'] },
    };

    if (role === 'teacher') {
      whereCondition.class = { teacherId: userId };
    } else if (role === 'student') {
      whereCondition.class = {
        enrollments: {
          some: { userId, status: 'active' },
        },
      };
    }

    return this.prisma.session.findMany({
      where: whereCondition,
      include: includeRelations,
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * GET /sessions/history
   * Returns ended sessions (for Reports page)
   */
  @Get('history')
  async getHistorySessions(@Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;

    const includeRelations = {
      class: {
        include: {
          course: true,
          teacher: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      },
    };

    const whereCondition: any = {
      status: 'ended',
    };

    if (role === 'teacher') {
      whereCondition.class = { teacherId: userId };
    } else if (role === 'student') {
      whereCondition.class = {
        enrollments: {
          some: { userId, status: 'active' },
        },
      };
    }

    return this.prisma.session.findMany({
      where: whereCondition,
      include: includeRelations,
      orderBy: { endTime: 'desc' },
    });
  }

  /**
   * GET /sessions/:id/report
   * Returns detailed session report with participant attendances & telemetry
   */
  @Get(':id/report')
  async getSessionReport(@Req() req: any, @Param('id') id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            course: true,
            teacher: {
              select: { id: true, email: true, name: true, role: true },
            },
          },
        },
        attendances: {
          include: {
            user: {
              select: { id: true, email: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy phiên học.');
    }

    return session;
  }

  /**
   * POST /sessions/:id/start
   * Bắt đầu buổi học theo lịch. Chỉ dành cho Teacher / Admin / Manager.
   */
  @Post(':id/start')
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin', 'manager')
  async startSession(@Req() req: any, @Param('id') id: string) {
    return this.meetingService.startSession(req.user.id, id);
  }

  /**
   * POST /sessions/:id/join
   * Request to join session (Student & Teacher)
   */
  @Post(':id/join')
  async joinSession(@Req() req: any, @Param('id') id: string) {
    return this.meetingService.joinSession(req.user.id, id);
  }

  /**
   * POST /sessions/:id/end
   * Kết thúc buổi học. Chỉ dành cho Teacher / Admin / Manager.
   */
  @Post(':id/end')
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin', 'manager')
  async endSession(@Req() req: any, @Param('id') id: string) {
    await this.meetingService.endSession(req.user.id, id);
    return { success: true };
  }

  /**
   * POST /sessions/adhoc
   * Tạo buổi học đột xuất. Chỉ dành cho Teacher / Admin / Manager.
   */
  @Post('adhoc')
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin', 'manager')
  async createAdhocSession(@Req() req: any, @Body('classId') classId: string) {
    return this.meetingService.createAdhocSession(req.user.id, classId);
  }

  /**
   * POST /sessions/:id/attendance/join
   * Sự kiện tham gia buổi học từ WebRTC client. Chỉ dành cho Học viên.
   */
  @Post(':id/attendance/join')
  @UseGuards(RolesGuard)
  @Roles('student')
  async attendanceJoin(@Req() req: any, @Param('id') id: string) {
    await this.meetingService.recordAttendanceJoin(id, req.user.id);
    return { success: true };
  }

  /**
   * POST /sessions/:id/attendance/leave
   * Sự kiện rời buổi học từ WebRTC client. Chỉ dành cho Học viên.
   */
  @Post(':id/attendance/leave')
  @UseGuards(RolesGuard)
  @Roles('student')
  async attendanceLeave(
    @Req() req: any,
    @Param('id') id: string,
    @Body('joinedAtSeconds') joinedAtSeconds: number,
  ) {
    await this.meetingService.recordAttendanceLeave(id, req.user.id, joinedAtSeconds);
    return { success: true };
  }
}
