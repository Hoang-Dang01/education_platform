# Task List — Xây dựng UI & Tích hợp lib-jitsi-meet

## Phase 0.1: Khởi tạo & Cài đặt Dự án
- [x] Khởi tạo dự án React + TypeScript bằng Vite tại thư mục `app/`
- [x] Cấu hình dev server, proxy và các polyfills cho `lib-jitsi-meet` (buffer, process, global)
- [x] Cài đặt các thư viện thiết yếu: `lucide-react` cho icons, `lib-jitsi-meet` phiên bản đồng bộ

## Phase 0.2: Phát triển UI/UX Cao cấp (Mock Data)
- [x] Thiết lập hệ thống CSS toàn cục: `variables.css` (màu sắc, glassmorphism tokens, fonts) và `global.css` (resets, scrollbar)
- [x] Xây dựng `WelcomeScreen.tsx` (Card Glassmorphism, video preview, form nhập phòng)
- [x] Xây dựng màn hình lớp học chính `ClassroomScreen.tsx` điều phối layout
- [x] Xây dựng `VideoGrid.tsx` (Lưới hiển thị tự động giãn cách cho học sinh và giáo viên)
- [x] Xây dựng thanh công cụ nổi `ControlBar.tsx` (tắt/bật mic/cam, share screen, giơ tay phát biểu FIFO queue)
- [x] Xây dựng `SidePanel.tsx`:
  - [x] Tab Chat (tin nhắn giáo viên nổi bật, gửi reaction nhanh)
  - [x] Tab Điểm danh & Chất lượng kết nối (4 mức kết nối, đồng hồ học tập realtime)
- [x] Xây dựng khung giao diện chính LMS Shell `LmsShell.tsx` và điều phối định tuyến
- [x] Xây dựng trang đăng nhập hệ thống `LoginPage.tsx` và định dạng `LoginPage.css`
- [x] Thiết lập trạng thái xác thực và phân quyền người dùng (isAuthenticated, login, logout)
- [x] Tích hợp nút Đăng xuất trong LMS Shell và chuyển hướng người dùng khi chưa đăng nhập
- [x] Xây dựng trang tổng quan học tập `DashboardPage.tsx`
- [x] Xây dựng trang quản lý khóa học và tài liệu `CoursesPage.tsx`
- [x] Xây dựng trang lịch sử và biểu đồ báo cáo chuyên cần `ReportsPage.tsx`
- [x] Thiết lập file CSS style dùng chung cho các trang `Pages.css`
- [x] Kết nối toàn bộ màn hình bằng Mock Data và tách biệt hoàn toàn dữ liệu giả lập vào tệp [mockData.ts](file:///c:/Git%20cua%20tui/education-platform/app/src/lib/mockData.ts) để dễ chỉnh sửa/thay thế sau này.

## Phase 0.3: Tích hợp lib-jitsi-meet & WebRTC
- [x] Xây dựng [jitsiService.ts](file:///c:/Git%20cua%20tui/education-platform/app/src/lib/jitsiService.ts) quản lý kết nối JitsiConnection và JitsiConference
- [x] Thiết lập React Context [ClassContext.tsx](file:///c:/Git%20cua%20tui/education-platform/app/src/context/ClassContext.tsx) quản lý luồng trạng thái từ WebRTC sang React UI
- [x] Tích hợp luồng video/audio thật từ camera/mic vào [VideoGrid.tsx](file:///c:/Git%20cua%20tui/education-platform/app/src/components/VideoGrid.tsx) và điều khiển qua [ControlBar.tsx](file:///c:/Git%20cua%20tui/education-platform/app/src/components/ControlBar.tsx)
- [x] Tích hợp hệ thống Chat thật và danh sách thành viên từ Jitsi XMPP server


## Phase 0.4: Kiểm thử & Hoàn thiện
- [ ] Kiểm thử kết nối 2 người dùng qua `meet.jit.si` công cộng (2 tabs trình duyệt)
- [ ] Kiểm thử chuyển đổi camera/mic, chia sẻ màn hình
- [ ] Kiểm thử tính năng giơ tay đồng bộ qua XMPP data channel
- [ ] Tối ưu hóa hiệu năng render video grid
