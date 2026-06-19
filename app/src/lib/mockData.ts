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

  const list: MockParticipant[] = [localUser];

  // Luôn có giáo viên chủ phòng — TRỪ khi chính người dùng là giáo viên (tránh trùng).
  // Sửa lỗi: trước đây chỉ thêm khi là Học viên nên Quản lý/Admin vào giám sát bị thiếu GV.
  if (localUserRole !== 'teacher') {
    list.push({
      id: 'teacher-1', name: 'Thầy Nguyễn Hải Nam', role: 'teacher',
      isLocal: false, isAudioMuted: false, isVideoMuted: false, isHandRaised: false,
      connectionQuality: 'excellent', joinedAt: new Date(Date.now() - 300000), activeTimeSeconds: 300,
      device: 'desktop', network: 'ethernet', networkLabel: 'Mạng dây',
      latency: 22, packetLoss: 0, jitter: 3, bitrate: 1850, framerate: 30,
    });
  }

  // Danh sách học sinh cùng lớp + telemetry/thiết bị mẫu (1 em mạng yếu để demo cảnh báo)
  const classmates: Array<{ name: string; device: DeviceType; network: NetworkType; networkLabel: string; latency: number; packetLoss: number; jitter: number; quality: MockParticipant['connectionQuality'] }> = [
    { name: 'Trần Minh Tâm', device: 'laptop', network: 'wifi', networkLabel: 'Wi-Fi', latency: 45, packetLoss: 0.3, jitter: 6, quality: 'excellent' },
    { name: 'Lê Thị Hoa', device: 'mobile', network: 'mobile', networkLabel: 'Mạng di động (4g)', latency: 95, packetLoss: 1.2, jitter: 14, quality: 'good' },
    { name: 'Phạm Quốc Bảo', device: 'desktop', network: 'wifi', networkLabel: 'Wi-Fi', latency: 60, packetLoss: 0.5, jitter: 8, quality: 'excellent' },
    { name: 'Nguyễn Thu Thảo', device: 'mobile', network: 'mobile', networkLabel: 'Mạng di động (3g)', latency: 185, packetLoss: 4.2, jitter: 24, quality: 'poor' },
    { name: 'Hoàng Gia Huy', device: 'tablet', network: 'wifi', networkLabel: 'Wi-Fi', latency: 70, packetLoss: 0.8, jitter: 10, quality: 'good' },
  ];
  classmates.forEach((s, idx) => {
    list.push({
      id: `student-${idx}`, name: s.name, role: 'student', isLocal: false,
      isAudioMuted: idx !== 3, isVideoMuted: idx === 0 || idx === 3,
      isHandRaised: idx === 1, handRaiseTime: idx === 1 ? Date.now() - 10000 : undefined,
      connectionQuality: s.quality, joinedAt: new Date(Date.now() - (idx + 1) * 60000), activeTimeSeconds: (idx + 1) * 60,
      device: s.device, network: s.network, networkLabel: s.networkLabel,
      latency: s.latency, packetLoss: s.packetLoss, jitter: s.jitter,
      bitrate: 1200 + idx * 80, framerate: s.quality === 'poor' ? 18 : 30,
    });
  });

  return list;
};

export const getInitialChatMessages = (): MockChatMessage[] => [
  {
    id: 'm1',
    senderId: 'teacher-1',
    senderName: 'Thầy Nguyễn Hải Nam',
    senderRole: 'teacher',
    text: 'Chào cả lớp, các em đã chuẩn bị bài tập về nhà hôm nay chưa?',
    timestamp: new Date(Date.now() - 200000),
  },
  {
    id: 'm2',
    senderId: 'student-0',
    senderName: 'Trần Minh Tâm',
    senderRole: 'student',
    text: 'Dạ em làm rồi thầy ơi!',
    timestamp: new Date(Date.now() - 150000),
  },
];


// 2. Dữ liệu Bảng điều khiển (Lịch học & Thông báo)
//    KPI dashboard nay được định nghĩa riêng theo vai trò trong `dashboardByRole` (mục 6).

export const mockUpcomingClasses = [
  {
    id: 'c1',
    subject: 'Toán Học Giải Tích 12',
    time: '10:00 - 11:30',
    teacher: 'Thầy Nguyễn Hải Nam',
    room: 'toan-tin-k12',
    status: 'live',
  },
  {
    id: 'c2',
    subject: 'Vật Lý Đại Cương',
    time: '14:00 - 15:30',
    teacher: 'Cô Lê Thu Thảo',
    room: 'vat-ly-12',
    status: 'scheduled',
  },
];

export const mockNotifications = [
  {
    id: 'n1',
    title: 'Cập nhật lịch học hình học giải tích',
    time: '2 phút trước',
    desc: 'Lịch học lớp Toán được cập nhật sang phòng toan-tin-k12 (đã gộp các điều chỉnh gần nhất).',
    tag: 'Cập nhật',
  },
  {
    id: 'n2',
    title: 'Hệ thống Telemetry chẩn đoán mạng nâng cấp',
    time: '3 giờ trước',
    desc: 'Giao diện hiển thị ping, jitter và mất gói tin theo 4 mức tiêu chuẩn mới.',
    tag: 'Hệ thống',
  },
];


// 3. Dữ liệu Môn học & Tài liệu học tập (Courses Page)
export interface MockMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'slide' | 'video';
  size?: string;
  url: string;
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

export const mockCourses: MockCourse[] = [
  {
    id: 'c1',
    name: 'Toán Học Giải Tích 12',
    code: 'TOAN-12',
    teacher: 'Thầy Nguyễn Hải Nam',
    materialsCount: 4,
    progress: 80,
    desc: 'Khóa học cung cấp kiến thức nền tảng và nâng cao về Đạo hàm, Tích phân và Ứng dụng trong các bài toán hình học giải tích.',
    materials: [
      { id: 'm1', title: 'Bài giảng Đạo hàm & Khảo sát hàm số', type: 'slide', size: '4.2 MB', url: '#' },
      { id: 'm2', title: 'Tài liệu ôn tập Nguyên hàm - Tích phân', type: 'pdf', size: '1.8 MB', url: '#' },
      { id: 'm3', title: 'Bài tập trắc nghiệm chương 2 giải tích', type: 'pdf', size: '850 KB', url: '#' },
      { id: 'm4', title: 'Video ghi lại buổi học Giải tích ngày 15/06', type: 'video', url: '#' },
    ],
    studentCount: 6,
    attendanceRate: 95.8,
    sessionsDone: 24,
    sessionsTotal: 28,
  },
  {
    id: 'c2',
    name: 'Vật Lý Lớp 12',
    code: 'LY-12',
    teacher: 'Cô Lê Thu Thảo',
    materialsCount: 3,
    progress: 65,
    desc: 'Tìm hiểu về các định luật Vật Lý cơ bản: Dao động cơ học, Sóng cơ và Sóng âm, Dòng điện xoay chiều.',
    materials: [
      { id: 'm5', title: 'Đề cương ôn tập học kỳ Dao động cơ', type: 'pdf', size: '2.1 MB', url: '#' },
      { id: 'm6', title: 'Slide bài giảng Sóng âm & Đặc tính vật lý', type: 'slide', size: '3.6 MB', url: '#' },
      { id: 'm7', title: 'Video thực hành Đo bước sóng ánh sáng', type: 'video', url: '#' },
    ],
    studentCount: 18,
    attendanceRate: 91.2,
    sessionsDone: 20,
    sessionsTotal: 28,
  },
  {
    id: 'c3',
    name: 'Hóa Học Hữu Cơ',
    code: 'HOA-12',
    teacher: 'Thầy Phạm Quốc Bảo',
    materialsCount: 2,
    progress: 45,
    desc: 'Giới thiệu về thế giới hóa học hữu cơ: Este, Lipit, Cacbohidrat và các phản ứng hữu cơ quan trọng.',
    materials: [
      { id: 'm8', title: 'Tóm tắt lý thuyết phản ứng xà phòng hóa', type: 'pdf', size: '1.1 MB', url: '#' },
      { id: 'm9', title: 'Bài tập peptit và chuỗi phản ứng Amin', type: 'pdf', size: '940 KB', url: '#' },
    ],
    studentCount: 22,
    attendanceRate: 84.4,
    sessionsDone: 18,
    sessionsTotal: 28,
  },
];


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

export const mockUsers: MockUser[] = [
  { id: 'u1', name: 'Quản trị viên Hệ thống', email: 'admin@edumeet.com', role: 'admin', status: 'active', lastActive: 'Đang hoạt động' },
  { id: 'u2', name: 'Cô Trần Điều Phối', email: 'manager@edumeet.com', role: 'manager', status: 'active', lastActive: '5 phút trước' },
  { id: 'u3', name: 'Thầy Nguyễn Hải Nam', email: 'nam.nguyen@edumeet.com', role: 'teacher', status: 'active', lastActive: 'Đang hoạt động' },
  { id: 'u4', name: 'Cô Lê Thu Thảo', email: 'thao.le@edumeet.com', role: 'teacher', status: 'active', lastActive: '1 giờ trước' },
  { id: 'u5', name: 'Thầy Phạm Quốc Bảo', email: 'bao.pham@edumeet.com', role: 'teacher', status: 'suspended', lastActive: '3 ngày trước' },
  { id: 'u6', name: 'Nguyễn Đăng', email: 'dang.nguyen@edumeet.com', role: 'student', status: 'active', lastActive: 'Đang hoạt động' },
  { id: 'u7', name: 'Trần Minh Tâm', email: 'tam.tran@edumeet.com', role: 'student', status: 'active', lastActive: '2 phút trước' },
  { id: 'u8', name: 'Lê Thị Hoa', email: 'hoa.le@edumeet.com', role: 'student', status: 'active', lastActive: '10 phút trước' },
  { id: 'u9', name: 'Hoàng Gia Huy', email: 'huy.hoang@edumeet.com', role: 'student', status: 'suspended', lastActive: '1 tuần trước' },
];

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

export const mockLiveClasses: MockLiveClass[] = [
  {
    // Kịch bản 1: lớp khỏe mạnh — mọi chỉ số tốt
    id: 'lc1', room: 'toan-tin-k12', subject: 'Toán Học Giải Tích 12', teacher: 'Thầy Nguyễn Hải Nam',
    participantCount: 6, capacity: 30, avgConnectionQuality: 'excellent', status: 'in_progress', startedAt: '10:00', durationMins: 42,
    participants: [
      { id: 'p1', name: 'Thầy Nguyễn Hải Nam', role: 'teacher', connState: 'connected', cameraOn: true, micOn: true, latency: 22, packetLoss: 0, jitter: 3, device: 'desktop', network: 'ethernet', joinedMinsAgo: 42, disconnectCount: 0 },
      { id: 'p2', name: 'Nguyễn Đăng', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 35, packetLoss: 0.1, jitter: 4, device: 'laptop', network: 'wifi', joinedMinsAgo: 41, disconnectCount: 0 },
      { id: 'p3', name: 'Trần Minh Tâm', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 45, packetLoss: 0.2, jitter: 6, device: 'laptop', network: 'wifi', joinedMinsAgo: 40, disconnectCount: 1 },
      { id: 'p4', name: 'Lê Thị Hoa', role: 'student', connState: 'connected', cameraOn: false, micOn: false, latency: 55, packetLoss: 0, jitter: 5, device: 'mobile', network: 'mobile', joinedMinsAgo: 38, disconnectCount: 0 },
      { id: 'p5', name: 'Phạm Quốc Bảo', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 60, packetLoss: 0.5, jitter: 8, device: 'desktop', network: 'wifi', joinedMinsAgo: 42, disconnectCount: 0 },
      { id: 'p6', name: 'Nguyễn Thu Thảo', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 48, packetLoss: 0.3, jitter: 5, device: 'tablet', network: 'wifi', joinedMinsAgo: 39, disconnectCount: 0 },
    ],
  },
  {
    // Kịch bản 2: lỗi phía 1 học viên — chỉ một người mất gói cao
    id: 'lc2', room: 'vat-ly-12', subject: 'Vật Lý Đại Cương', teacher: 'Cô Lê Thu Thảo',
    participantCount: 6, capacity: 25, avgConnectionQuality: 'good', status: 'in_progress', startedAt: '10:15', durationMins: 27,
    participants: [
      { id: 'p7', name: 'Cô Lê Thu Thảo', role: 'teacher', connState: 'connected', cameraOn: true, micOn: true, latency: 28, packetLoss: 0.2, jitter: 4, device: 'desktop', network: 'ethernet', joinedMinsAgo: 27, disconnectCount: 0 },
      { id: 'p8', name: 'Đỗ Quang Minh', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 52, packetLoss: 0.4, jitter: 7, device: 'laptop', network: 'wifi', joinedMinsAgo: 26, disconnectCount: 0 },
      { id: 'p9', name: 'Vũ Thị Lan', role: 'student', connState: 'reconnecting', cameraOn: false, micOn: false, latency: 110, packetLoss: 8.5, jitter: 22, device: 'mobile', network: 'mobile', joinedMinsAgo: 20, disconnectCount: 4 },
      { id: 'p10', name: 'Bùi Anh Tuấn', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 60, packetLoss: 0.6, jitter: 9, device: 'laptop', network: 'wifi', joinedMinsAgo: 25, disconnectCount: 1 },
      { id: 'p11', name: 'Ngô Hải Yến', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 47, packetLoss: 0.1, jitter: 5, device: 'desktop', network: 'ethernet', joinedMinsAgo: 27, disconnectCount: 0 },
      { id: 'p12', name: 'Phan Đức Anh', role: 'student', connState: 'connected', cameraOn: false, micOn: false, latency: 65, packetLoss: 1.2, jitter: 11, device: 'tablet', network: 'wifi', joinedMinsAgo: 24, disconnectCount: 0 },
    ],
  },
  {
    // Kịch bản 3: lỗi phía giáo viên (Host) — host mất gói cao, đa số học viên bị ảnh hưởng
    id: 'lc3', room: 'hoa-huu-co-12', subject: 'Hóa Học Hữu Cơ', teacher: 'Thầy Phạm Quốc Bảo',
    participantCount: 7, capacity: 25, avgConnectionQuality: 'poor', status: 'interrupted', startedAt: '09:45', durationMins: 57,
    participants: [
      { id: 'p13', name: 'Thầy Phạm Quốc Bảo', role: 'teacher', connState: 'reconnecting', cameraOn: true, micOn: true, latency: 320, packetLoss: 7.4, jitter: 38, device: 'laptop', network: 'mobile', joinedMinsAgo: 57, disconnectCount: 3 },
      { id: 'p14', name: 'Lý Gia Hân', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 260, packetLoss: 2.1, jitter: 28, device: 'laptop', network: 'wifi', joinedMinsAgo: 55, disconnectCount: 2 },
      { id: 'p15', name: 'Trịnh Văn Khoa', role: 'student', connState: 'connected', cameraOn: false, micOn: false, latency: 290, packetLoss: 3.0, jitter: 31, device: 'desktop', network: 'wifi', joinedMinsAgo: 56, disconnectCount: 2 },
      { id: 'p16', name: 'Đặng Mỹ Linh', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 245, packetLoss: 1.8, jitter: 26, device: 'mobile', network: 'mobile', joinedMinsAgo: 50, disconnectCount: 1 },
      { id: 'p17', name: 'Hồ Minh Quân', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 275, packetLoss: 2.4, jitter: 29, device: 'laptop', network: 'wifi', joinedMinsAgo: 54, disconnectCount: 2 },
      { id: 'p18', name: 'Tô Thanh Hằng', role: 'student', connState: 'connected', cameraOn: false, micOn: false, latency: 58, packetLoss: 0.4, jitter: 7, device: 'desktop', network: 'ethernet', joinedMinsAgo: 57, disconnectCount: 0 },
      { id: 'p19', name: 'Cao Đức Thắng', role: 'student', connState: 'connected', cameraOn: true, micOn: false, latency: 250, packetLoss: 2.0, jitter: 27, device: 'tablet', network: 'wifi', joinedMinsAgo: 48, disconnectCount: 1 },
    ],
  },
];

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
    bannerSubtitle: 'Hệ thống đang vận hành ổn định với 3 lớp học trực tuyến đang diễn ra.',
    bannerBadge: 'Hệ thống ổn định',
    listType: 'live',
    listTitle: 'Lớp đang diễn ra',
    notifTitle: 'Nhật ký hệ thống',
    kpis: [
      { title: 'Tổng người dùng', value: '9', desc: '7 đang hoạt động · 2 bị khóa', color: 'indigo', icon: 'users' },
      { title: 'Lớp đang diễn ra', value: '3', desc: '19 người tham gia trực tuyến', color: 'green', icon: 'live' },
      { title: 'Chất lượng hệ thống', value: 'Excellent', desc: 'Uptime 99.9% · Ping ~45ms', color: 'cyan', icon: 'quality' },
      { title: 'Tài khoản bị khóa', value: '2', desc: 'Cần xem xét mở khóa', color: 'red', icon: 'lock' },
    ],
    notifications: [
      { id: 'an1', tag: 'Bảo mật', time: '10 phút trước', title: 'Phát hiện đăng nhập bất thường', desc: 'Tài khoản huy.hoang@edumeet.com đăng nhập từ thiết bị mới — đã tạm khóa để xác minh.' },
      { id: 'an2', tag: 'Hệ thống', time: '1 giờ trước', title: 'Máy chủ Jitsi nâng cấp thành công', desc: 'Cụm media bridge đã chuyển sang serviceUrl WebSocket, độ trễ giảm ~15%.' },
    ],
  },
  manager: {
    bannerTitle: 'Điều phối đào tạo 📋',
    bannerSubtitle: 'Có 3 lớp đang diễn ra, tỷ lệ tham gia trung bình đạt 92.4% tuần này.',
    bannerBadge: 'Đào tạo đúng tiến độ',
    listType: 'live',
    listTitle: 'Lớp đang diễn ra cần theo dõi',
    notifTitle: 'Cập nhật đào tạo',
    kpis: [
      { title: 'Khóa học phụ trách', value: '3', desc: 'Toán, Vật Lý, Hóa Học', color: 'indigo', icon: 'courses' },
      { title: 'Giáo viên phụ trách', value: '3', desc: '1 tài khoản đang bị khóa', color: 'amber', icon: 'teachers' },
      { title: 'Tỷ lệ tham gia TB', value: '92.4%', desc: '+1.2% so với tuần trước', color: 'green', icon: 'attendance' },
      { title: 'Lớp đang diễn ra', value: '3', desc: '1 lớp có kết nối yếu', color: 'cyan', icon: 'live' },
    ],
    notifications: [
      { id: 'mn1', tag: 'Phân công', time: '30 phút trước', title: 'Cần phân công giáo viên thay thế', desc: 'Thầy Phạm Quốc Bảo (Hóa Học) đang bị khóa tài khoản — cân nhắc phân công thay thế.' },
      { id: 'mn2', tag: 'Chất lượng', time: '2 giờ trước', title: 'Lớp Hóa Hữu Cơ kết nối yếu', desc: 'Phòng hoa-huu-co-12 có chất lượng mạng ở mức Yếu, nên kiểm tra hạ tầng.' },
    ],
  },
  teacher: {
    bannerTitle: 'Chào mừng trở lại, Thầy/Cô! 👋',
    bannerSubtitle: 'Hôm nay bạn có 1 tiết đang diễn ra và 1 tiết sắp tới cần chuẩn bị.',
    bannerBadge: 'Sẵn sàng lên lớp',
    listType: 'schedule',
    listTitle: 'Lịch dạy hôm nay',
    notifTitle: 'Cập nhật & Thông báo',
    kpis: [
      { title: 'Tiết dạy hôm nay', value: '2', desc: '1 đang diễn ra trực tuyến', color: 'indigo', icon: 'sessions' },
      { title: 'Tổng học viên', value: '6', desc: 'Lớp Toán Giải Tích 12', color: 'cyan', icon: 'students' },
      { title: 'Chuyên cần lớp', value: '95.8%', desc: '+1.2% so với tuần trước', color: 'green', icon: 'attendance' },
      { title: 'Chất lượng kết nối', value: 'Excellent', desc: 'Ping trung bình ~45ms', color: 'cyan', icon: 'quality' },
    ],
    notifications: mockNotifications,
  },
  student: {
    bannerTitle: 'Chào mừng trở lại! 👋',
    bannerSubtitle: 'Hôm nay bạn có 1 tiết học đang diễn ra trực tuyến.',
    bannerBadge: 'Học tập đạt hiệu quả cao',
    listType: 'schedule',
    listTitle: 'Lịch học hôm nay',
    notifTitle: 'Cập nhật & Thông báo',
    kpis: [
      { title: 'Tỷ lệ Chuyên cần', value: '95.8%', desc: '+1.2% so với tuần trước', color: 'green', icon: 'attendance' },
      { title: 'Số buổi đã học', value: '24 / 28', desc: 'Còn lại 4 tiết trong học kỳ', color: 'indigo', icon: 'calendar' },
      { title: 'Chất lượng kết nối TB', value: 'Excellent', desc: 'Ping trung bình ~45ms', color: 'cyan', icon: 'quality' },
    ],
    notifications: mockNotifications,
  },
};

export const mockReportSessions: MockReportSession[] = [
  {
    id: 'rs1',
    roomName: 'toan-tin-k12',
    date: '19/06/2026',
    presentStudents: 6,
    totalStudents: 6,
    avgDurationMins: 42,
    avgConnectionQuality: 'excellent',
    details: [
      { name: 'Thầy Nguyễn Hải Nam', role: 'Giáo viên', presentTimeMins: 45, totalTimeMins: 45, pct: 100, telemetry: { ping: 22, jitter: 3, loss: 0 } },
      { name: 'Nguyễn Đăng', role: 'Học sinh', presentTimeMins: 43, totalTimeMins: 45, pct: 95.5, telemetry: { ping: 35, jitter: 4, loss: 0.1 } },
      { name: 'Trần Minh Tâm', role: 'Học sinh', presentTimeMins: 42, totalTimeMins: 45, pct: 93.3, telemetry: { ping: 45, jitter: 6, loss: 0.2 } },
      { name: 'Lê Thị Hoa', role: 'Học sinh', presentTimeMins: 44, totalTimeMins: 45, pct: 97.7, telemetry: { ping: 55, jitter: 5, loss: 0.0 } },
      { name: 'Phạm Quốc Bảo', role: 'Học sinh', presentTimeMins: 38, totalTimeMins: 45, pct: 84.4, telemetry: { ping: 95, jitter: 12, loss: 1.5 } },
      { name: 'Nguyễn Thu Thảo', role: 'Học sinh', presentTimeMins: 41, totalTimeMins: 45, pct: 91.1, telemetry: { ping: 165, jitter: 18, loss: 2.2 } },
    ],
  },
  {
    id: 'rs2',
    roomName: 'toan-tin-k12',
    date: '17/06/2026',
    presentStudents: 5,
    totalStudents: 6,
    avgDurationMins: 38,
    avgConnectionQuality: 'good',
    details: [
      { name: 'Thầy Nguyễn Hải Nam', role: 'Giáo viên', presentTimeMins: 45, totalTimeMins: 45, pct: 100, telemetry: { ping: 24, jitter: 2, loss: 0 } },
      { name: 'Nguyễn Đăng', role: 'Học sinh', presentTimeMins: 40, totalTimeMins: 45, pct: 88.8, telemetry: { ping: 32, jitter: 5, loss: 0.2 } },
      { name: 'Trần Minh Tâm', role: 'Học sinh', presentTimeMins: 41, totalTimeMins: 45, pct: 91.1, telemetry: { ping: 48, jitter: 7, loss: 0.5 } },
      { name: 'Lê Thị Hoa', role: 'Học sinh', presentTimeMins: 43, totalTimeMins: 45, pct: 95.5, telemetry: { ping: 62, jitter: 4, loss: 0.1 } },
      { name: 'Nguyễn Thu Thảo', role: 'Học sinh', presentTimeMins: 35, totalTimeMins: 45, pct: 77.7, telemetry: { ping: 180, jitter: 22, loss: 4.8 } },
    ],
  },
];
