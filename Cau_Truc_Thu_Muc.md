# Cấu trúc thư mục Monorepo thực tế (Current Monorepo Structure)

Dưới đây là sơ đồ cấu trúc cây thư mục toàn bộ dự án **EduMeet Distributed Platform** được tổ chức theo mô hình Monorepo (sử dụng npm workspaces). Sơ đồ này phản ánh chính xác cấu trúc thư mục thực tế hiện tại của dự án để phục vụ quá trình phát triển và vận hành.

```text
education_platform/
│
├── README.md                              # Giới thiệu tổng quan dự án và hướng dẫn khởi chạy nhanh
├── Cau_Truc_Thu_Muc.md                    # Sơ đồ cấu trúc cây thư mục thực tế (File này)
├── .gitignore                             # Cấu hình bỏ qua trong Git ở root workspace
├── package.json                           # Định nghĩa npm workspaces cho monorepo
├── package-lock.json                      # Khóa phiên bản dependency toàn bộ dự án
├── tsconfig.base.json                     # Cấu hình TypeScript cơ sở cho các workspace con
│
├── docs/                                  # Tài liệu phân tích nghiệp vụ của hệ thống
│   ├── Business Requirement Document (BRD)/ # Tài liệu đặc tả yêu cầu nghiệp vụ
│   │   ├── 01_Tong_Quan/                  # Tổng quan dự án và kiến trúc tổng quát
│   │   ├── 02_Phan_He_Nghiep_Vu/          # Mô tả nghiệp vụ chi tiết của các phân hệ
│   │   ├── 03_Giam_Sat_Telemetry/         # Đặc tả cơ chế telemetry và giám sát mạng
│   │   ├── 04_Ket_Luan/                   # Phần kết và lộ trình triển khai
│   │   └── README.md                      # Hướng dẫn cấu trúc tài liệu nghiệp vụ
│   └── artifacts/                         # Bản vẽ, hình ảnh, tài sản dùng trong thiết kế
│
├── apps/                                  # Thư mục chứa các ứng dụng chính (Applications)
│   │
│   ├── web/                               # 1. Frontend Web Client — EduMeet UI (React + Vite + TS)
│   │   ├── public/                        # Tài sản tĩnh public (logo, favicon, assets tĩnh)
│   │   ├── src/
│   │   │   ├── main.tsx                   # Điểm khởi chạy của ứng dụng React (Entry point)
│   │   │   ├── App.tsx                    # Định nghĩa router chính và layout của client
│   │   │   ├── index.css                  # Tệp CSS global cơ bản
│   │   │   │
│   │   │   ├── assets/                    # Tệp tin đa phương tiện, hình ảnh, icon
│   │   │   │
│   │   │   ├── components/                # Các thành phần giao diện của lớp học và hệ thống
│   │   │   │   ├── ClassroomScreen/       # Giao diện màn hình lớp học trực tuyến chính
│   │   │   │   ├── ControlBar/            # Thanh công cụ tương tác (Mic, Camera, Share Screen, End meeting)
│   │   │   │   ├── LmsShell/              # Khung cấu trúc giao diện quản lý LMS (Sidebar, Navbar)
│   │   │   │   ├── SidePanel/             # Panel bên phải (Chat, Members, Settings, Telemetry, Materials)
│   │   │   │   ├── VideoGrid/             # Lưới hiển thị webcam và màn hình chia sẻ của người tham gia
│   │   │   │   └── WelcomeScreen/         # Giao diện chuẩn bị trước khi vào phòng học (Lobby)
│   │   │   │
│   │   │   ├── context/                   # Quản lý state toàn cục qua React Context Providers
│   │   │   │   ├── AuthContext.tsx        # Trạng thái đăng nhập, thông tin user và token
│   │   │   │   ├── ClassContext.tsx       # Trạng thái lớp học, lịch dạy và quản trị khóa học
│   │   │   │   └── MeetingContext.tsx     # Trạng thái phòng họp WebRTC (Jitsi, Chat, Whiteboard, Raise Hand)
│   │   │   │
│   │   │   ├── lib/                       # Cấu hình thư viện bên thứ 3 (Axios client, helper functions)
│   │   │   │
│   │   │   ├── pages/                     # Các trang hiển thị lớn (Page-level Components)
│   │   │   │   ├── CalendarPage/          # Trang lịch học và quản lý lịch giảng dạy
│   │   │   │   ├── CoursesPage/           # Trang quản lý khóa học và tài liệu học tập
│   │   │   │   ├── DashboardPage/         # Bảng điều khiển thống kê (Dành cho Giáo viên & Học sinh)
│   │   │   │   ├── ForceChangePasswordPage/ # Trang bắt buộc đổi mật khẩu khi đăng nhập lần đầu
│   │   │   │   ├── LoginPage/             # Trang đăng nhập tài khoản
│   │   │   │   ├── MonitoringPage/        # Trang giám sát telemetry hệ thống lớp học
│   │   │   │   ├── ReportsPage/           # Trang xuất báo cáo chuyên cần và điểm danh
│   │   │   │   └── UserManagementPage/    # Trang quản lý danh sách người dùng (Admin/Giáo viên)
│   │   │   │
│   │   │   └── styles/                    # Các file CSS chuyên biệt cho các giao diện cụ thể
│   │   │
│   │   ├── package.json                   # Dependencies & kịch bản chạy của frontend
│   │   ├── tsconfig.json                  # Cấu hình chung TypeScript của web
│   │   ├── tsconfig.app.json              # Cấu hình TypeScript cho client code
│   │   ├── tsconfig.node.json             # Cấu hình TypeScript cho node tools (như Vite config)
│   │   ├── vite.config.ts                 # Cấu hình build & dev server Vite
│   │   ├── nginx.conf                     # Cấu hình Nginx phục vụ chạy container Frontend
│   │   └── Dockerfile                     # Dockerfile đóng gói web client
│   │
│   └── api/                               # 2. Backend API Server (NestJS + Prisma + TS)
│       ├── prisma/                        # Cấu hình ORM Prisma & Migrations
│       │   ├── schema.prisma              # Định nghĩa mô hình cơ sở dữ liệu PostgreSQL
│       │   ├── seed.ts                    # Script nạp dữ liệu mẫu ban đầu
│       │   └── migrations/                # Lịch sử migrations SQL của Database
│       │
│       ├── src/
│       │   ├── main.ts                    # Khởi tạo và lắng nghe cổng dịch vụ NestJS
│       │   ├── app.module.ts              # Module gốc kết nối cơ sở dữ liệu và các module nghiệp vụ
│       │   ├── app.controller.ts          # Controller mặc định kiểm tra sức khỏe hệ thống
│       │   ├── app.service.ts             # Service mặc định
│       │   │
│       │   ├── database/                  # Quản lý kết nối Database qua Prisma Service
│       │   │   ├── database.module.ts     # Khai báo Database module
│       │   │   └── prisma.service.ts      # NestJS service quản lý kết nối và đóng kết nối Prisma
│       │   │
│       │   └── modules/                   # Các phân hệ nghiệp vụ chính (Modular Architecture)
│       │       ├── auth/                  # Đăng nhập, phân quyền JWT, mã hóa mật khẩu, đổi mật khẩu
│       │       ├── materials/             # Quản lý tài liệu khóa học (Tải lên PDF, chia sẻ tài liệu)
│       │       ├── meeting/               # Xử lý phòng học trực tuyến (Cấp Token Jitsi, Breakout Rooms)
│       │       └── telemetry/             # Thu thập và phân tích dữ liệu chất lượng cuộc gọi từ Client
│       │
│       ├── package.json                   # Dependencies & kịch bản chạy của backend
│       ├── tsconfig.json                  # Cấu hình TypeScript cho backend
│       ├── tsconfig.build.json            # Cấu hình biên dịch NestJS sang JS
│       ├── nest-cli.json                  # Cấu hình NestJS CLI
│       ├── eslint.config.mjs              # Cấu hình linting cho backend code
│       └── uploads/                       # Thư mục lưu trữ tài liệu tải lên cục bộ (như PDF)
│
├── packages/                              # Các gói thư viện chia sẻ trong Monorepo (Shared Packages)
│   ├── contracts/                         # Định nghĩa schema xác thực DTO và các ràng buộc dữ liệu
│   ├── sdk/                               # Client SDK hỗ trợ kết nối API dễ dàng từ frontend
│   └── shared-types/                      # Định nghĩa kiểu dữ liệu (Types/Interfaces) TypeScript dùng chung
│
└── infrastructure/                        # Triển khai và hạ tầng
    └── jitsi-deploy/                      # Docker Compose và kịch bản deploy hệ thống Jitsi Meet tự lưu trữ
```

---

## Phân loại thư mục theo vai trò

| Thư mục | Vai trò | Trạng thái git |
|---|---|---|
| `docs/` | Phân tích nghiệp vụ, tài liệu yêu cầu (BRD) và các artifacts bổ trợ | ✅ Tracked |
| `apps/web/` | Ứng dụng client React chạy trên nền Vite & TypeScript | ✅ Tracked |
| `apps/api/` | Ứng dụng REST API server xây dựng bằng NestJS, kết nối DB qua Prisma | ✅ Tracked |
| `packages/` | Các thư viện/gói chia sẻ chung giữa frontend và backend | ✅ Tracked |
| `infrastructure/` | Cấu hình triển khai máy chủ họp trực tuyến Jitsi Meet | ✅ Tracked |

---

## Luồng phát triển mở rộng (Dev & Deploy Pipeline)

```
[docs/BRD] → [packages/shared-types] → [apps/api] + [apps/web] → [infrastructure] (Jitsi Deploy)
```

**Cập nhật lần cuối:** 2026-06-23
