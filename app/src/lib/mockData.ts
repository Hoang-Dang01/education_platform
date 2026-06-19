/**
 * MOCK DATA SYSTEM — EDUMEET PLATFORM
 * 
 * Lưu ý: Tệp này chứa toàn bộ dữ liệu giả lập (Mock Data) phục vụ cho giao diện.
 * Sau này khi tích hợp API thực tế, bạn chỉ cần thay đổi các hàm gọi hoặc import 
 * từ tệp này bằng các cuộc gọi API thực tế.
 */

// 1. Dữ liệu Lớp học & Thành viên (Dùng cho ClassContext & VideoGrid)
export interface MockParticipant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  isLocal: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  handRaiseTime?: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
  joinedAt: Date;
  activeTimeSeconds: number;
}

export interface MockChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  text: string;
  timestamp: Date;
}

export const getMockParticipants = (localUserName: string, localUserRole: 'teacher' | 'student'): MockParticipant[] => {
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
  };

  const list: MockParticipant[] = [localUser];

  // Nếu người dùng là Học viên, tạo thêm 1 Giáo viên làm chủ phòng
  if (localUserRole === 'student') {
    list.push({
      id: 'teacher-1',
      name: 'Thầy Nguyễn Hải Nam',
      role: 'teacher',
      isLocal: false,
      isAudioMuted: false,
      isVideoMuted: false,
      isHandRaised: false,
      connectionQuality: 'excellent',
      joinedAt: new Date(Date.now() - 300000), // đã vào trước 5 phút
      activeTimeSeconds: 300,
    });
  }

  // Danh sách học sinh cùng lớp
  const classmates = ['Trần Minh Tâm', 'Lê Thị Hoa', 'Phạm Quốc Bảo', 'Nguyễn Thu Thảo', 'Hoàng Gia Huy'];
  classmates.forEach((sName, idx) => {
    list.push({
      id: `student-${idx}`,
      name: sName,
      role: 'student',
      isLocal: false,
      isAudioMuted: Math.random() > 0.5,
      isVideoMuted: Math.random() > 0.7,
      isHandRaised: idx === 1, // cho 1 học sinh giơ tay sẵn
      handRaiseTime: idx === 1 ? Date.now() - 10000 : undefined,
      connectionQuality: idx === 3 ? 'poor' : 'excellent',
      joinedAt: new Date(Date.now() - (idx + 1) * 60000),
      activeTimeSeconds: (idx + 1) * 60,
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


// 2. Dữ liệu Bảng điều khiển (Dashboard KPI & Lịch học)
export const mockDashboardKpis = [
  {
    title: 'Tỷ lệ Chuyên cần',
    value: '95.8%',
    desc: '+1.2% so với tuần trước',
    color: 'green',
  },
  {
    title: 'Số buổi đã học',
    value: '24 / 28',
    desc: 'Còn lại 4 tiết trong học kỳ',
    color: 'indigo',
  },
  {
    title: 'Chất lượng kết nối TB',
    value: 'Excellent',
    desc: 'Ping trung bình ~45ms',
    color: 'cyan',
  },
];

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
  progress: number;
  desc: string;
  materials: MockMaterial[];
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
