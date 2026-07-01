/**
 * MOCK DATA SYSTEM — EDUMEET PLATFORM
 * 
 * Lưu ý: Tệp này chứa toàn bộ dữ liệu giả lập (Mock Data) phục vụ cho giao diện.
 * Sau này khi tích hợp API thực tế, bạn chỉ cần thay đổi các hàm gọi hoặc import 
 * từ tệp này bằng các cuộc gọi API thực tế.
 */

import type { UserRole } from './roles';
import { getDeviceInfo } from './deviceInfo';

// 1. Dữ liệu Lớp học & Thành viên (Dùng cho ClassContext & VideoGrid)
export interface MockParticipant {
  id: string;
  name: string;
  role: UserRole;
  isLocal: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  handRaiseTime?: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
  joinedAt: Date;
  activeTimeSeconds: number;
  // Telemetry & thiết bị (để demo dashboard giám sát ở chế độ mock)
  device?: DeviceType;
  network?: NetworkType;
  networkLabel?: string;
  latency?: number;
  packetLoss?: number;
  jitter?: number;
  bitrate?: number;
  framerate?: number;
}

export interface MockChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: Date;
}

export const getMockParticipants = (localUserName: string, localUserRole: UserRole): MockParticipant[] => {
  const dev = getDeviceInfo();
  const localUser: MockParticipant = {
    id: 'local-user',
    name: localUserName,
    role: localUserRole,
    isLocal: true,
    isAudioMuted: false,
    isVideoMuted: false,
    isHandRaised: false,
    connectionQuality: 'excellent',
    joinedAt: new Date(),
    activeTimeSeconds: 0,
    device: dev.deviceType, network: dev.network, networkLabel: dev.networkLabel,
    latency: 28, packetLoss: 0.2, jitter: 4, bitrate: 1650, framerate: 30,
  };

  return [localUser];
};

export const getInitialChatMessages = (): MockChatMessage[] => [];


// 2. Dữ liệu Bảng điều khiển (Lịch học & Thông báo)
//    KPI dashboard nay được định nghĩa riêng theo vai trò trong `dashboardByRole` (mục 6).

export const mockUpcomingClasses = [];

export const mockNotifications = [];


// 3. Dữ liệu Môn học & Tài liệu học tập (Courses Page)
export interface MockMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'slide' | 'video';
  size?: string;
  url: string;
  uploadedBy?: string;
}

export interface MockCourse {
  id: string;
  name: string;
  code: string;
  teacher: string;
  materialsCount: number;
  progress: number;        // % bài học đã hoàn thành (góc nhìn Học viên)
  desc: string;
  materials: MockMaterial[];
  // Số liệu quản lý (góc nhìn Giáo viên / Quản lý / Admin)
  studentCount: number;
  attendanceRate: number;  // % chuyên cần trung bình của lớp
  sessionsDone: number;
  sessionsTotal: number;
}

export const mockCourses: MockCourse[] = [];


// 4. Dữ liệu Báo cáo Điểm danh & Telemetry kết nối (Reports Page)
export interface MockReportDetail {
  name: string;
  role: string;
  presentTimeMins: number;
  totalTimeMins: number;
  pct: number;
  telemetry: {
    ping: number;
    jitter: number;
    loss: number;
  };
}

export interface MockReportSession {
  id: string;
  roomName: string;
  date: string;
  presentStudents: number;
  totalStudents: number;
  avgDurationMins: number;
  avgConnectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
  details: MockReportDetail[];
}

// 5. Quản trị người dùng (Admin — BRD 2.1) & Giám sát lớp học (Admin/Manager — BRD 2.5)
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  lastActive: string;
}

export const mockUsers: MockUser[] = [];

// Trạng thái lớp học (BRD 7.3) và kết nối người tham gia (BRD 7.4)
export type ClassStatus = 'scheduled' | 'in_progress' | 'completed' | 'interrupted' | 'cancelled';
export type ConnState = 'connected' | 'reconnecting' | 'disconnected';
export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'mobile';
export type NetworkType = 'wifi' | 'ethernet' | 'mobile' | 'vpn';

// Chỉ số telemetry real-time của từng người tham gia (BRD 7.4 – 7.6)
export interface LiveParticipant {
  id: string;
  name: string;
  role: UserRole;
  connState: ConnState;
  cameraOn: boolean;
  micOn: boolean;
  latency: number;        // ms
  packetLoss: number;     // %
  jitter: number;         // ms
  device: DeviceType;
  network: NetworkType;
  joinedMinsAgo: number;  // phút đã tham gia
  disconnectCount: number;
}

export interface MockLiveClass {
  id: string;
  room: string;
  subject: string;
  teacher: string;
  participantCount: number;
  capacity: number;
  avgConnectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
  status: ClassStatus;
  startedAt: string;
  durationMins: number;
  participants: LiveParticipant[];
}

export const mockLiveClasses: MockLiveClass[] = [];

// 6. Dashboard riêng theo vai trò (BRD 2 — mỗi nhóm người dùng thấy nội dung phù hợp)
export type KpiColor = 'green' | 'indigo' | 'cyan' | 'amber' | 'red';
export type KpiIconName = 'attendance' | 'calendar' | 'quality' | 'users' | 'live' | 'lock' | 'courses' | 'teachers' | 'students' | 'sessions';

export interface DashboardKpi {
  title: string;
  value: string;
  desc: string;
  color: KpiColor;
  icon: KpiIconName;
}

export interface DashboardNotif {
  id: string;
  title: string;
  desc: string;
  time: string;
  tag: string;
}

export interface RoleDashboard {
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBadge: string;
  kpis: DashboardKpi[];
  /** Panel trái: 'schedule' = lịch học/dạy, 'live' = lớp đang diễn ra để giám sát */
  listType: 'schedule' | 'live';
  listTitle: string;
  notifTitle: string;
  notifications: DashboardNotif[];
}

export const dashboardByRole: Record<UserRole, RoleDashboard> = {
  admin: {
    bannerTitle: 'Tổng quan hệ thống ⚙️',
    bannerSubtitle: 'Hệ thống đang vận hành ổn định.',
    bannerBadge: 'Hệ thống ổn định',
    listType: 'live',
    listTitle: 'Lớp đang diễn ra',
    notifTitle: 'Nhật ký hệ thống',
    kpis: [
      { title: 'Tổng người dùng', value: '0', desc: '0 đang hoạt động · 0 bị khóa', color: 'indigo', icon: 'users' },
      { title: 'Lớp đang diễn ra', value: '0', desc: '0 người tham gia trực tuyến', color: 'green', icon: 'live' },
      { title: 'Chất lượng hệ thống', value: '--', desc: 'Uptime 100% · Ping --', color: 'cyan', icon: 'quality' },
      { title: 'Tài khoản bị khóa', value: '0', desc: 'Không có tài khoản bị khóa', color: 'red', icon: 'lock' },
    ],
    notifications: [],
  },
  manager: {
    bannerTitle: 'Điều phối đào tạo 📋',
    bannerSubtitle: 'Không có lớp học trực tuyến nào đang diễn ra.',
    bannerBadge: 'Hệ thống sẵn sàng',
    listType: 'live',
    listTitle: 'Lớp đang diễn ra cần theo dõi',
    notifTitle: 'Cập nhật đào tạo',
    kpis: [
      { title: 'Khóa học phụ trách', value: '0', desc: 'Không có khóa học', color: 'indigo', icon: 'courses' },
      { title: 'Giáo viên phụ trách', value: '0', desc: 'Không có giáo viên', color: 'amber', icon: 'teachers' },
      { title: 'Tỷ lệ tham gia TB', value: '0%', desc: 'Không có dữ liệu', color: 'green', icon: 'attendance' },
      { title: 'Lớp đang diễn ra', value: '0', desc: '0 lớp đang chạy', color: 'cyan', icon: 'live' },
    ],
    notifications: [],
  },
  teacher: {
    bannerTitle: 'Chào mừng trở lại, Thầy/Cô! 👋',
    bannerSubtitle: 'Hôm nay bạn không có tiết dạy nào.',
    bannerBadge: 'Sẵn sàng lên lớp',
    listType: 'schedule',
    listTitle: 'Lịch dạy hôm nay',
    notifTitle: 'Cập nhật & Thông báo',
    kpis: [
      { title: 'Tiết dạy hôm nay', value: '0', desc: 'Không có tiết dạy', color: 'indigo', icon: 'sessions' },
      { title: 'Tổng học viên', value: '0', desc: 'Không có học viên', color: 'cyan', icon: 'students' },
      { title: 'Chuyên cần lớp', value: '0%', desc: 'Không có dữ liệu', color: 'green', icon: 'attendance' },
      { title: 'Chất lượng kết nối', value: '--', desc: 'Không có dữ liệu', color: 'cyan', icon: 'quality' },
    ],
    notifications: [],
  },
  student: {
    bannerTitle: 'Chào mừng trở lại! 👋',
    bannerSubtitle: 'Hôm nay bạn không có tiết học nào.',
    bannerBadge: 'Học tập đạt hiệu quả cao',
    listType: 'schedule',
    listTitle: 'Lịch học hôm nay',
    notifTitle: 'Cập nhật & Thông báo',
    kpis: [
      { title: 'Tỷ lệ Chuyên cần', value: '0%', desc: 'Không có dữ liệu', color: 'green', icon: 'attendance' },
      { title: 'Số buổi đã học', value: '0 / 0', desc: 'Không có tiết học', color: 'indigo', icon: 'calendar' },
      { title: 'Chất lượng kết nối TB', value: '--', desc: 'Không có dữ liệu', color: 'cyan', icon: 'quality' },
    ],
    notifications: [],
  },
};

export const mockReportSessions: MockReportSession[] = [];
