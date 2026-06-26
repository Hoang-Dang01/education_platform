import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MEDIA_PROVIDER } from './media/media-provider.interface';
import type { MediaProvider } from './media/media-provider.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(MEDIA_PROVIDER) private mediaProvider: MediaProvider,
    private configService: ConfigService,
  ) {}

  /**
   * Validates if a user can join a class meeting based on schedules and enrollment configurations.
   */
  async canJoinSession(userId: string, sessionId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại.');

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: true },
    });
    if (!session) throw new NotFoundException('Buổi học không tồn tại.');

    const cls = session.class;

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
        userId_classId: { userId, classId: cls.id },
      },
    });

    if (!enrollment || enrollment.status !== 'active') {
      throw new ForbiddenException('Bạn không có tên trong danh sách lớp học này.');
    }

    return true;
  }

  /**
   * Starts a scheduled session (Teacher only)
   */
  async startSession(userId: string, sessionId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'manager')) {
      throw new ForbiddenException('Chỉ giáo viên hoặc quản lý mới có quyền bắt đầu buổi học.');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: true },
    });
    if (!session) throw new NotFoundException('Buổi học không tồn tại.');

    if (user.role === 'teacher' && session.class.teacherId !== userId) {
      throw new ForbiddenException('Bạn không phải là giáo viên phụ trách lớp học này.');
    }

    if (session.status === 'ended') {
      throw new BadRequestException('Buổi học này đã kết thúc.');
    }

    const now = new Date();
    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'live',
        startTime: session.startTime || now,
      },
      include: { class: true },
    });

    // Initialize room on media provider
    try {
      await this.mediaProvider.createRoom(session.roomName);
    } catch (e) {
      this.logger.warn(`Failed to initialize media room: ${e.message}`);
    }

    return updatedSession;
  }

  /**
   * Handles session joining logic, returns connection tokens and session info.
   */
  async joinSession(userId: string, sessionId: string): Promise<any> {
    if (!sessionId) {
      throw new BadRequestException('Mã buổi học (sessionId) là bắt buộc.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    let session;

    if (!isUuid && this.configService.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV MODE] Auto-handling non-UUID join session for roomName: ${sessionId}`);
      session = await this.prisma.session.findFirst({
        where: { roomName: sessionId, status: 'live' },
        include: { class: true },
      });

      if (!session) {
        this.logger.log(`[DEV MODE] Live session not found for roomName: ${sessionId}. Auto-creating...`);
        let cls = await this.prisma.class.findFirst();
        if (!cls) {
          const teacher = await this.prisma.user.findFirst({ where: { role: 'teacher' } })
            || await this.prisma.user.findFirst({ where: { role: 'admin' } })
            || await this.prisma.user.findFirst();
          let course = await this.prisma.course.findFirst();
          if (!course) {
            course = await this.prisma.course.create({
              data: {
                name: 'Khóa học Thử nghiệm',
                code: 'TEST-101',
                description: 'Khóa học dùng để test WebRTC',
              }
            });
          }
          if (teacher) {
            cls = await this.prisma.class.create({
              data: {
                name: 'Lớp học Thử nghiệm',
                courseId: course.id,
                teacherId: teacher.id,
                earlyJoinMins: 15,
              }
            });
          }
        }
        if (!cls) {
          throw new BadRequestException('Không thể tự động tạo phiên học thử do thiếu giáo viên/khóa học trong DB.');
        }

        session = await this.prisma.session.create({
          data: {
            classId: cls.id,
            roomName: sessionId,
            status: 'live',
            startTime: new Date(),
          },
          include: { class: true },
        });

        try {
          await this.mediaProvider.createRoom(sessionId);
        } catch (e) {
          this.logger.warn(`Failed to initialize media room: ${e.message}`);
        }
      }
    } else {
      // 1. Verify user role & enrollment permissions
      await this.canJoinSession(userId, sessionId);
      session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: { class: true },
      });
    }

    if (!user || !session) {
      throw new NotFoundException('Dữ liệu không khớp.');
    }
    const cls = session.class;
    const isStaff = user.role === 'admin' || user.role === 'manager' || user.role === 'teacher';

    // 2. Handle status transitions
    if (session.status === 'scheduled') {
      if (isStaff) {
        // Teacher/Staff joins a scheduled session -> Automatically starts it
        session = await this.startSession(userId, sessionId);
      } else {
        // Student joins a scheduled session -> check early join window
        const now = new Date();
        if (session.startTime) {
          const scheduledTime = new Date(session.startTime);
          const diffMs = scheduledTime.getTime() - now.getTime();
          const diffMins = diffMs / (1000 * 60);

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

          // Within allowed join window -> Trigger session start automatically
          this.logger.log(`Activating scheduled session ${session.id} for class ${cls.name}`);
          session = await this.prisma.session.update({
            where: { id: session.id },
            data: {
              status: 'live',
              startTime: now,
            },
            include: { class: true },
          });

          await this.mediaProvider.createRoom(session.roomName);
        } else {
          throw new ForbiddenException('Lớp học chưa bắt đầu và không có lịch học nào đang hoạt động.');
        }
      }
    } else if (session.status === 'live') {
      // Live session is already running, check if late join rule applies to student
      if (!isStaff && cls.lateJoinMins !== null && cls.lateJoinMins !== undefined && session.startTime) {
        const sessionStart = new Date(session.startTime);
        const elapsedMs = new Date().getTime() - sessionStart.getTime();
        const elapsedMins = elapsedMs / (1000 * 60);

        if (elapsedMins > cls.lateJoinMins) {
          throw new ForbiddenException(
            `Bạn đã trễ quá ${cls.lateJoinMins} phút. Cổng vào lớp học đã đóng.`,
          );
        }
      }
    } else if (session.status === 'ended') {
      throw new ForbiddenException('Buổi học này đã kết thúc.');
    }

    // 3. Register initial attendance for students
    if (user.role === 'student') {
      await this.recordAttendanceJoin(session.id, user.id);
    }

    // 4. Generate LiveKit Join Token
    const isTeacher = user.role === 'teacher' || user.role === 'admin' || user.role === 'manager';
    const serverUrl = this.configService.get<string>('LIVEKIT_WS_URL') || 'ws://localhost:7880';
    let token = '';

    try {
      token = await this.mediaProvider.generateAccessToken(
        session.roomName,
        { id: user.id, name: user.name, isTeacher, role: user.role },
      );
    } catch (e) {
      this.logger.warn(`Failed to generate media token: ${e.message}`);
    }

    return {
      sessionId: session.id,
      roomId: session.roomName,
      serverUrl,
      token,
    };
  }

  /**
   * Creates an ad-hoc session for a class (Teacher/Staff only)
   */
  async createAdhocSession(userId: string, classId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'manager')) {
      throw new ForbiddenException('Chỉ giáo viên hoặc quản lý mới có quyền tạo buổi học đột xuất.');
    }

    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Lớp học không tồn tại.');

    if (user.role === 'teacher' && cls.teacherId !== userId) {
      throw new ForbiddenException('Bạn không phải là giáo viên được gán của lớp học này.');
    }

    const now = new Date();
    const roomName = `room-${classId}-${Date.now()}`;

    const session = await this.prisma.session.create({
      data: {
        classId,
        roomName,
        status: 'live',
        startTime: now,
      },
    });

    try {
      await this.mediaProvider.createRoom(roomName);
    } catch (e) {
      this.logger.warn(`Failed to create media room: ${e.message}`);
    }

    const isTeacher = true;
    const serverUrl = this.configService.get<string>('LIVEKIT_WS_URL') || 'ws://localhost:7880';
    let token = '';
    try {
      token = await this.mediaProvider.generateAccessToken(
        roomName,
        { id: user.id, name: user.name, isTeacher, role: user.role },
      );
    } catch (e) {
      this.logger.warn(`Failed to generate token: ${e.message}`);
    }

    return {
      sessionId: session.id,
      roomId: roomName,
      serverUrl,
      token,
    };
  }

  /**
   * Explicitly closes the class session, aggregates attendance, and deletes the LiveKit room.
   */
  async endSession(userId: string, sessionId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'manager')) {
      throw new ForbiddenException('Chỉ giáo viên hoặc quản lý mới có quyền đóng buổi học.');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: true },
    });

    if (!session || session.status !== 'live') {
      throw new BadRequestException('Buổi học không hoạt động hoặc đã kết thúc.');
    }

    if (user.role === 'teacher' && session.class.teacherId !== userId) {
      throw new ForbiddenException('Bạn không phải là giáo viên phụ trách buổi học này.');
    }

    // 1. Close the room on media provider
    try {
      await this.mediaProvider.deleteRoom(session.roomName);
    } catch (e) {
      this.logger.warn(`Failed to close media room on server: ${e.message}`);
    }

    // 2. Update status in DB
    const endTime = new Date();
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'ended',
        endTime,
      },
    });

    // 3. Trigger Attendance Engine Aggregation
    await this.aggregateAttendance(sessionId, session.startTime || session.createdAt, endTime);

    this.logger.log(`Session ${session.roomName} successfully ended.`);
  }

  /**
   * Records that a student joined the meeting
   */
  async recordAttendanceJoin(sessionId: string, userId: string): Promise<void> {
    await this.prisma.attendance.upsert({
      where: {
        sessionId_userId: { sessionId, userId },
      },
      update: {},
      create: {
        sessionId,
        userId,
        status: 'fail',
      },
    });
  }

  /**
   * Records that a student left the meeting, calculating duration of the segment
   */
  async recordAttendanceLeave(sessionId: string, userId: string, joinedAtSeconds: number): Promise<void> {
    const durationSeconds = Math.max(0, Math.floor(Date.now() / 1000) - joinedAtSeconds);
    const durationMins = Math.ceil(durationSeconds / 60);

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });

    if (!attendance) return;

    await this.prisma.attendance.update({
      where: {
        sessionId_userId: { sessionId, userId },
      },
      data: {
        presentTimeMins: attendance.presentTimeMins + durationMins,
        disconnectCount: attendance.disconnectCount + 1,
      },
    });
  }

  /**
   * Attendance Engine: computes final duration, percentage, and passing status for each participant
   */
  async aggregateAttendance(sessionId: string, startTime: Date, endTime: Date): Promise<void> {
    const totalDurationMins = Math.max(1, Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60)));

    const attendances = await this.prisma.attendance.findMany({
      where: { sessionId },
    });

    for (const att of attendances) {
      const pct = totalDurationMins > 0 ? (att.presentTimeMins / totalDurationMins) * 100 : 100;
      const roundedPct = Math.min(100, Math.round(pct * 10) / 10);
      const passed = roundedPct >= 80 ? 'pass' : 'fail';
      // Compensate disconnect count (subtract 1 for clean logout)
      const finalDisconnects = Math.max(0, att.disconnectCount - 1);

      // Compute telemetry averages from samples in database
      const telemetryStats = await this.prisma.telemetrySample.aggregate({
        where: {
          sessionId,
          userId: att.userId,
        },
        _avg: {
          pingMs: true,
          packetLoss: true,
          jitterMs: true,
        },
      });

      const avgPing = telemetryStats._avg.pingMs ?? 0.0;
      const avgLoss = telemetryStats._avg.packetLoss ?? 0.0;
      const avgJitter = telemetryStats._avg.jitterMs ?? 0.0;

      await this.prisma.attendance.update({
        where: { id: att.id },
        data: {
          totalTimeMins: totalDurationMins,
          pct: roundedPct,
          disconnectCount: finalDisconnects,
          status: passed,
          avgPing,
          avgLoss,
          avgJitter,
        },
      });
    }

    this.logger.log(`Session ${sessionId} attendance aggregated successfully for ${attendances.length} students.`);
  }
}
