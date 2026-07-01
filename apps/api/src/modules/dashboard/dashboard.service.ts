import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsResponseDto } from './dto/dashboard-stats.dto';

interface CacheEntry {
  data: DashboardStatsResponseDto;
  timestamp: number;
}

@Injectable()
export class DashboardService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string, role: string): Promise<DashboardStatsResponseDto> {
    const cacheKey = `${userId}_${role}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }

    let kpis: any[] = [];

    if (role === 'student') {
      kpis = await this.getStudentStats(userId);
    } else if (role === 'teacher') {
      kpis = await this.getTeacherStats(userId);
    } else if (role === 'manager') {
      kpis = await this.getManagerStats();
    } else if (role === 'admin') {
      kpis = await this.getAdminStats();
    }

    const response: DashboardStatsResponseDto = { role, kpis };
    this.cache.set(cacheKey, { data: response, timestamp: now });
    return response;
  }

  private async getStudentStats(userId: string) {
    // 1. Tỷ lệ Chuyên cần cá nhân
    const studentAttendances = await this.prisma.attendance.findMany({
      where: {
        userId,
        session: { status: 'ended' },
      },
      select: { pct: true },
    });
    const avgPct = studentAttendances.length > 0
      ? studentAttendances.reduce((sum, item) => sum + item.pct, 0) / studentAttendances.length
      : 0;

    // 2. Số buổi đã học (chỉ tính đạt chuyên cần >= 70% thời lượng)
    const enrolledClasses = await this.prisma.enrollment.findMany({
      where: { userId, status: 'active' },
      select: { classId: true },
    });
    const classIds = enrolledClasses.map(c => c.classId);

    const totalEndedSessions = await this.prisma.session.count({
      where: {
        classId: { in: classIds },
        status: 'ended',
      },
    });

    const attendedCount = await this.prisma.attendance.count({
      where: {
        userId,
        pct: { gte: 70 },
        session: {
          classId: { in: classIds },
          status: 'ended',
        },
      },
    });

    // 3. Chất lượng kết nối cá nhân trung bình
    const networkStats = await this.prisma.attendance.aggregate({
      _avg: { avgPing: true },
      where: { userId },
    });
    const avgPing = networkStats._avg.avgPing || 0;
    const pingVal = avgPing === 0 ? '--' : `${Math.round(avgPing)}ms`;
    const pingDesc = avgPing === 0 
      ? 'Không có dữ liệu kết nối' 
      : `Đánh giá: ${avgPing < 100 ? 'Tốt' : avgPing <= 200 ? 'Khá' : 'Chậm'}`;

    return [
      {
        title: 'Tỷ lệ Chuyên cần',
        value: `${Math.round(avgPct)}%`,
        desc: 'Trung bình trên tổng số buổi học đã diễn ra',
        color: 'green',
        icon: 'attendance',
      },
      {
        title: 'Số buổi đã học',
        value: `${attendedCount} / ${totalEndedSessions}`,
        desc: 'Đạt điều kiện chuyên cần (≥ 70% thời lượng)',
        color: 'indigo',
        icon: 'calendar',
      },
      {
        title: 'Chất lượng kết nối TB',
        value: pingVal,
        desc: pingDesc,
        color: 'cyan',
        icon: 'quality',
      },
    ];
  }

  private async getTeacherStats(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Tiết dạy hôm nay (tất cả các trạng thái)
    const todaySessionsCount = await this.prisma.session.count({
      where: {
        class: { teacherId: userId },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 2. Tổng học viên đăng ký trong các lớp của giáo viên
    const enrollmentsCount = await this.prisma.enrollment.groupBy({
      by: ['userId'],
      where: {
        class: {
          teacherId: userId,
          status: { in: ['scheduled', 'ongoing'] },
        },
        status: 'active',
      },
    });
    const totalStudents = enrollmentsCount.length;

    // 3. Chuyên cần lớp trung bình (tính trên các phiên học đã kết thúc)
    const teacherEndedSessions = await this.prisma.session.findMany({
      where: {
        class: { teacherId: userId },
        status: 'ended',
      },
      select: { id: true },
    });
    const teacherSessionIds = teacherEndedSessions.map(s => s.id);

    const classAttendance = await this.prisma.attendance.aggregate({
      _avg: { pct: true },
      where: {
        sessionId: { in: teacherSessionIds },
      },
    });
    const classAvgPct = classAttendance._avg.pct || 0;

    // 4. Chất lượng kết nối của lớp học viên trung bình
    const connectionStats = await this.prisma.attendance.aggregate({
      _avg: { avgPing: true },
      where: {
        sessionId: { in: teacherSessionIds },
      },
    });
    const teacherAvgPing = connectionStats._avg.avgPing || 0;
    const teacherPingVal = teacherAvgPing === 0 ? '--' : `${Math.round(teacherAvgPing)}ms`;
    const teacherPingDesc = teacherAvgPing === 0 
      ? 'Chưa có dữ liệu kết nối học viên' 
      : `Đánh giá mạng: ${teacherAvgPing < 100 ? 'Tốt' : teacherAvgPing <= 200 ? 'Khá' : 'Chậm'}`;

    return [
      {
        title: 'Tiết dạy hôm nay',
        value: String(todaySessionsCount),
        desc: `${todaySessionsCount} lớp đang hoạt động hoặc đã dạy hôm nay`,
        color: 'indigo',
        icon: 'sessions',
      },
      {
        title: 'Tổng học viên',
        value: String(totalStudents),
        desc: 'Số học viên đăng ký trong các lớp phụ trách',
        color: 'cyan',
        icon: 'students',
      },
      {
        title: 'Chuyên cần lớp',
        value: `${Math.round(classAvgPct)}%`,
        desc: 'Tỷ lệ tham gia trung bình của học viên',
        color: 'green',
        icon: 'attendance',
      },
      {
        title: 'Chất lượng kết nối',
        value: teacherPingVal,
        desc: teacherPingDesc,
        color: 'cyan',
        icon: 'quality',
      },
    ];
  }

  private async getManagerStats() {
    // 1. Khóa học phụ trách
    const coursesCount = await this.prisma.course.count();

    // 2. Tổng số lượt đăng ký chủ động (Total Active Enrollments)
    const enrollmentsCount = await this.prisma.enrollment.count({
      where: { status: 'active' },
    });

    // 3. Tỷ lệ tham gia TB toàn hệ thống
    const totalAvgAttendance = await this.prisma.attendance.aggregate({
      _avg: { pct: true },
      where: { session: { status: 'ended' } },
    });
    const totalAvgPct = totalAvgAttendance._avg.pct || 0;

    // 4. Lớp đang diễn ra
    const liveSessionsCount = await this.prisma.session.count({
      where: { status: 'live' },
    });

    return [
      {
        title: 'Khóa học phụ trách',
        value: String(coursesCount),
        desc: 'Tổng số khóa học trong chương trình đào tạo',
        color: 'indigo',
        icon: 'courses',
      },
      {
        title: 'Tổng lượt đăng ký học',
        value: String(enrollmentsCount),
        desc: 'Lượt học viên đăng ký hoạt động trong các lớp',
        color: 'amber',
        icon: 'teachers',
      },
      {
        title: 'Tỷ lệ tham gia TB',
        value: `${Math.round(totalAvgPct)}%`,
        desc: 'Tỷ lệ điểm danh trung bình toàn hệ thống',
        color: 'green',
        icon: 'attendance',
      },
      {
        title: 'Lớp đang diễn ra',
        value: String(liveSessionsCount),
        desc: 'Số lượng lớp học trực tuyến đang chạy',
        color: 'cyan',
        icon: 'live',
      },
    ];
  }

  private async getAdminStats() {
    // 1. Tổng người dùng hoạt động & bị khóa
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({ where: { status: 'active' } });
    const suspendedUsers = await this.prisma.user.count({ where: { status: 'suspended' } });

    // 2. Lớp đang diễn ra
    const liveSessionsCount = await this.prisma.session.count({
      where: { status: 'live' },
    });

    // 3. Chất lượng kết nối hệ thống trong 1 giờ gần nhất
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const telemetry = await this.prisma.telemetrySample.aggregate({
      _avg: { pingMs: true, packetLoss: true },
      where: { createdAt: { gte: oneHourAgo } },
    });
    const avgPing = telemetry._avg.pingMs || 0;
    const avgLoss = telemetry._avg.packetLoss || 0;
    const systemQualityValue = avgPing === 0 ? '--' : `${Math.round(avgPing)}ms`;

    let scoreLabel = 'Tốt';
    if (avgPing === 0) scoreLabel = 'Không có dữ liệu';
    else if (avgPing < 100 && avgLoss < 5) scoreLabel = 'Tốt';
    else if (avgPing <= 200 && avgLoss <= 10) scoreLabel = 'Khá';
    else scoreLabel = 'Chậm';

    const systemQualityDesc = avgPing === 0 
      ? 'Hệ thống chưa có lưu lượng' 
      : `Ping TB (1h qua) · Mất gói: ${avgLoss.toFixed(1)}% (${scoreLabel})`;

    return [
      {
        title: 'Tổng người dùng',
        value: String(totalUsers),
        desc: `${activeUsers} đang hoạt động · ${suspendedUsers} bị khóa`,
        color: 'indigo',
        icon: 'users',
      },
      {
        title: 'Lớp đang diễn ra',
        value: String(liveSessionsCount),
        desc: 'Số lượng lớp học trực tuyến đang chạy',
        color: 'green',
        icon: 'live',
      },
      {
        title: 'Chất lượng hệ thống',
        value: systemQualityValue,
        desc: systemQualityDesc,
        color: 'cyan',
        icon: 'quality',
      },
      {
        title: 'Tài khoản bị khóa',
        value: String(suspendedUsers),
        desc: 'Tổng số tài khoản đã bị vô hiệu hóa',
        color: 'red',
        icon: 'lock',
      },
    ];
  }
}
