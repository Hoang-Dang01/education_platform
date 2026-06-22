import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LivekitService } from './livekit.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    private prisma: PrismaService,
    private livekitService: LivekitService,
    private configService: ConfigService,
  ) {}

  /**
   * Validates if a user can join a class meeting based on schedules and enrollment configurations.
   */
  async canJoinMeeting(userId: string, classId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại.');

    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
    });
    if (!cls) throw new NotFoundException('Lớp học không tồn tại.');

    // Managers and Admins can join anything
    if (user.role === 'admin' || user.role === 'manager') {
      return true;
    }

    // Teacher check
    if (user.role === 'teacher') {
      if (cls.teacherId !== userId) {
        throw new ForbiddenException('Bạn không phải là giáo viên được gán của lớp học này.');
      }
      return true;
    }

    // Student enrollment check
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_classId: { userId, classId },
      },
    });

    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException('Bạn không có tên trong danh sách lớp học này.');
    }

    return true;
  }

  /**
   * Handles room joining logic, creates session and returns connection tokens.
   */
  async joinMeeting(userId: string, classId: string): Promise<any> {
    if (!classId) {
      throw new BadRequestException('Mã lớp học (classId) là bắt buộc.');
    }

    // 1. Verify user role & enrollment permissions
    await this.canJoinMeeting(userId, classId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        sessions: {
          where: { status: 'live' },
          take: 1,
        },
      },
    });

    if (!user || !cls) {
      throw new NotFoundException('Dữ liệu không khớp.');
    }

    let activeSession = cls.sessions[0];
    const isStaff = user.role === 'admin' || user.role === 'manager' || user.role === 'teacher';

    // 2. If no live session, check scheduled session
    if (!activeSession) {
      const scheduledSession = await this.prisma.session.findFirst({
        where: {
          classId,
          status: 'scheduled',
        },
        orderBy: { startTime: 'asc' },
      });

      const now = new Date();

      if (scheduledSession && scheduledSession.startTime) {
        const scheduledTime = new Date(scheduledSession.startTime);
        const diffMs = scheduledTime.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);

        // Check early join window (e.g. 15 minutes before scheduled start)
        if (diffMins > cls.earlyJoinMins) {
          throw new ForbiddenException(
            `Còn quá sớm để vào lớp. Bạn chỉ được vào trước giờ học tối đa ${cls.earlyJoinMins} phút.`,
          );
        }

        // Check late join window (if configured by the teacher)
        if (cls.lateJoinMins !== null && cls.lateJoinMins !== undefined) {
          const elapsedMs = now.getTime() - scheduledTime.getTime();
          const elapsedMins = elapsedMs / (1000 * 60);
          if (elapsedMins > cls.lateJoinMins) {
            throw new ForbiddenException(
              `Bạn đã trễ quá ${cls.lateJoinMins} phút. Cổng vào lớp học đã đóng.`,
            );
          }
        }

        // Within allowed join window -> Trigger session start (Model B)
        this.logger.log(`Activating scheduled session ${scheduledSession.id} for class ${cls.name}`);
        activeSession = await this.prisma.session.update({
          where: { id: scheduledSession.id },
          data: {
            status: 'live',
            startTime: now,
          },
        });

        // Initialize room on LiveKit
        await this.livekitService.createRoom(activeSession.roomName);
      } else {
        // No live session and no scheduled session found
        if (isStaff) {
          // Teachers / Admins / Managers can create ad-hoc rooms anytime
          const roomName = `room-${classId}-${Date.now()}`;
          this.logger.log(`Teacher initiated ad-hoc session for class ${cls.name}`);
          activeSession = await this.prisma.session.create({
            data: {
              classId,
              roomName,
              status: 'live',
              startTime: now,
            },
          });

          await this.livekitService.createRoom(roomName);
        } else {
          throw new ForbiddenException('Lớp học chưa bắt đầu và không có lịch học nào đang hoạt động.');
        }
      }
    } else {
      // Live session is already running, check if late join rule applies to student
      if (!isStaff && cls.lateJoinMins !== null && cls.lateJoinMins !== undefined && activeSession.startTime) {
        const sessionStart = new Date(activeSession.startTime);
        const elapsedMs = new Date().getTime() - sessionStart.getTime();
        const elapsedMins = elapsedMs / (1000 * 60);

        if (elapsedMins > cls.lateJoinMins) {
          throw new ForbiddenException(
            `Bạn đã trễ quá ${cls.lateJoinMins} phút. Cổng vào lớp học đã đóng.`,
          );
        }
      }
    }

    // 3. Generate LiveKit Join Token
    const isTeacher = user.role === 'teacher' || user.role === 'admin' || user.role === 'manager';
    const serverUrl = this.configService.get<string>('LIVEKIT_WS_URL') || 'ws://localhost:7880';
    const token = await this.livekitService.generateToken(
      activeSession.roomName,
      user.id,
      user.name,
      isTeacher,
    );

    return {
      roomId: activeSession.roomName,
      serverUrl,
      token,
    };
  }

  /**
   * Explicitly closes the class session and deletes the LiveKit room.
   */
  async endMeeting(classId: string): Promise<void> {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        sessions: {
          where: { status: 'live' },
          take: 1,
        },
      },
    });

    if (!cls || cls.sessions.length === 0) {
      throw new BadRequestException('Không tìm thấy phiên học đang hoạt động.');
    }

    const session = cls.sessions[0];

    // Close the room on LiveKit
    try {
      await this.livekitService.closeRoom(session.roomName);
    } catch (e) {
      this.logger.warn(`Failed to close LiveKit room on server: ${e.message}`);
    }

    // Update status in DB
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'ended',
        endTime: new Date(),
      },
    });

    this.logger.log(`Session ${session.roomName} successfully ended.`);
  }
}
