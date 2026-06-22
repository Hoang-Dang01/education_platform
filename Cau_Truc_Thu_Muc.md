# Cấu trúc thư mục Monorepo tối ưu (Production-Grade Monorepo Structure)

Dưới đây là sơ đồ cấu trúc cây thư mục toàn bộ dự án **EduMeet Distributed Platform** được thiết kế lại theo tiêu chuẩn Enterprise Monorepo, giúp quản lý tách biệt các ứng dụng (`apps/`), chia sẻ các hợp đồng kiểu dữ liệu (`packages/`), phân chia domain-driven rõ ràng (`features/` ở frontend và `modules/` ở backend), và phân vùng hạ tầng hoàn chỉnh.

```text
education-platform/
│
├── README.md                              # Giới thiệu dự án và hướng dẫn khởi chạy chung
├── Cau_Truc_Thu_Muc.md                    # Sơ đồ cấu trúc cây thư mục (File này)
├── .gitignore                             # Git ignore cho toàn bộ workspace
│
├── docs/                                  # Tài liệu phân tích nghiệp vụ & thiết kế hệ thống
│   ├── BRD/                               # Business Requirement Document (Nghiệp vụ cốt lõi)
│   ├── SRS/                               # Software Requirement Specification (Yêu cầu phần mềm)
│   ├── TDD/                               # Technical Design Document (Thiết kế kỹ thuật chi tiết)
│   ├── SAD/                               # Solution Architecture Document (Kiến trúc giải pháp)
│   ├── ADR/                               # Architecture Decision Records (Lịch sử quyết định thiết kế)
│   │   ├── 001-use-nestjs.md
│   │   ├── 002-jitsi-over-livekit.md
│   │   └── 003-prisma-over-typeorm.md
│   └── artifacts/                         # Mockups, sơ đồ BPMN, hình ảnh xuất báo cáo
│
├── apps/                                  # Các ứng dụng trong hệ thống (Applications Workspace)
│   │
│   ├── web/                               # 1. Frontend Web Client — EduMeet UI (Vite + TS)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── main.tsx                   # Điểm khởi chạy (Entry point)
│   │       ├── App.tsx                    # Router & cấu trúc định tuyến chính
│   │       ├── index.css                  # Styling toàn cục
│   │       │
│   │       ├── core/                      # Cấu hình lõi hệ thống
│   │       │   ├── router/                # Hệ thống định tuyến Router
│   │       │   ├── providers/             # Providers quản lý (Theme, Auth, ClassContext)
│   │       │   └── api/                   # Axios Client, Interceptors gọi lên Backend
│   │       │
│   │       ├── features/                  # Domain-driven features (Mã nguồn chứa UI + Logic theo tính năng)
│   │       │   ├── auth/                  # Đăng nhập, đăng ký, phiên làm việc
│   │       │   ├── dashboard/             # Bảng điều khiển, thống kê nhanh
│   │       │   ├── courses/               # Quản lý khóa học, danh sách tài liệu
│   │       │   ├── meeting/               # Phòng họp trực tuyến (VideoGrid, Classroom, ControlBar)
│   │       │   ├── telemetry/             # Telemetry Network (Ping, Loss, Jitter, Alert Engine)
│   │       │   ├── attendance/            # Điểm danh học viên, chia nhóm Breakout Rooms
│   │       │   └── reports/               # Lọc dữ liệu, in PDF, kết xuất Excel
│   │       │
│   │       ├── pages/                     # Route Composition (Chỉ lắp ghép Feature vào Route, không chứa logic)
│   │       │   ├── DashboardPage.tsx      # Lắp ghép DashboardFeature
│   │       │   ├── CalendarPage.tsx       # Lắp ghép CalendarFeature
│   │       │   ├── CoursePage.tsx         # Lắp ghép CoursesFeature
│   │       │   ├── LoginPage.tsx          # Lắp ghép AuthFeature
│   │       │   └── ReportsPage.tsx        # Lắp ghép ReportsFeature
│   │       │
│   │       └── shared/                    # UI Components & Hooks dùng chung toàn ứng dụng
│   │           ├── components/            # Button, Modal, Card thiết kế mờ dùng chung
│   │           └── hooks/                 # Custom hooks tiện ích (useWindowSize, useOutsideClick...)
│   │
│   └── api/                               # 2. Backend API Server (NestJS + TS)
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       ├── prisma/                        # ORM Schema & Database migrations
│       │   ├── schema.prisma              # Thiết kế cơ sở dữ liệu PostgreSQL
│       │   └── migrations/                # Lịch sử SQL migrations
│       └── src/
│           ├── main.ts                    # Entry point của server NestJS
│           ├── app.module.ts              # Module gốc ứng dụng
│           │
│           ├── core/                      # Guards, Interceptors, Filters, Loggers toàn hệ thống
│           │   ├── guards/                # AuthGuard, RolesGuard
│           │   ├── interceptors/          # TransformInterceptor, TelemetryCollectorInterceptor
│           │   └── filters/               # HttpExceptionFilter
│           │
│           ├── database/                  # Quản lý kết nối DB (Prisma Service)
│           │   ├── database.module.ts
│           │   └── prisma.service.ts
│           │
│           ├── modules/                   # Các mô-đun nghiệp vụ (Modular Monolith)
│           │   ├── auth/                  # JWT Authentication (Đăng ký, Đăng nhập)
│           │   ├── user/                  # Quản lý tài khoản, phân quyền người dùng
│           │   ├── course/                # Quản lý khóa học (Courses)
│           │   ├── class/                 # Quản lý lớp học & lịch giảng dạy (ScheduledClass)
│           │   ├── meeting/               # Quản lý trạng thái phòng họp trực tiếp
│           │   ├── attendance/            # Log điểm danh, xử lý chia phòng breakout
│           │   ├── telemetry/             # API thu thập số liệu mạng từ client gửi lên
│           │   ├── notification/          # Xử lý thông báo (Email nhắc nhở, cảnh báo nghỉ học)
│           │   ├── file/                  # Quản lý tải lên (Multer), lưu trữ tài liệu & file ghi hình
│           │   └── reporting/             # Xử lý báo cáo chuyên cần tuần/tháng
│           │
│           ├── integrations/              # Tương tác với dịch vụ hạ tầng bên ngoài
│           │   ├── jitsi/                 # Tích hợp & sinh token kết nối Jitsi Meet
│           │   ├── redis/                 # Bộ nhớ đệm cache (session state, rate limit)
│           │   └── storage/               # Tích hợp lưu trữ tệp (S3, MinIO hoặc local storage)
│           │
│           └── common/                    # CHỈ chứa Constants, Enums, Interfaces, Decorators dùng chung
│
├── packages/                              # Monorepo shared contracts (Chia sẻ kiểu dữ liệu giữa các apps)
│   ├── shared-types/                      # Định nghĩa TypeScript Types dùng chung (FE & BE)
│   ├── contracts/                         # API schemas / DTO contracts (Zod schemas hoặc validator models)
│   └── sdk/                               # Thư viện client helper (edumeetClient) cho FE gọi API
│
└── infrastructure/                        # Triển khai hạ tầng & Docker Compose
    ├── media/                             # Hạ tầng truyền thông trực tuyến (Media server)
    │   └── jitsi/                         # Docker Compose Jitsi Meet (web, prosody, jicofo, jvb)
    ├── data/                              # Cơ sở dữ liệu & các dịch vụ lưu trữ dữ liệu
    │   ├── postgres/                      # Tệp cấu hình DB PostgreSQL
    │   └── redis/                         # Cache database
    ├── messaging/                         # Message broker / Task queue quản lý tác vụ bất đồng bộ
    │   ├── bullmq/                        # Cấu hình Task queue xử lý báo cáo, email
    │   └── kafka/                         # Message broker thu thập telemetry phân tán
    ├── monitoring/                        # Giám sát hệ thống (Telemetry Analytics)
    │   ├── prometheus/                    # Thu thập chỉ số hệ thống
    │   └── grafana/                       # Dashboard trực quan hóa chỉ số hạ tầng
    └── scripts/                           # Script shell tự động hóa (Backup DB, dọn dẹp logs)
```

---

## Phân loại thư mục theo vai trò

| Thư mục | Vai trò | Trạng thái git |
|---|---|---|
| `docs/` | Phân tích nghiệp vụ, kiến trúc giải pháp & hồ sơ quyết định (ADR) | ✅ Tracked |
| `apps/web/` | Frontend Web Client (React / Vite) | ✅ Tracked |
| `apps/api/` | Backend REST / WebSockets Server (NestJS / Prisma) | ✅ Tracked |
| `packages/` | Các package chia sẻ kiểu dữ liệu (Shared Types / Contracts) | ✅ Tracked |
| `infrastructure/` | Triển khai Docker & Monitoring cho toàn bộ Platform | ✅ Tracked |

---

## Luồng phát triển mở rộng (Dev & Deploy Pipeline)

```
[docs/ADR] → [packages/shared-types] → [apps/api] + [apps/web] → [infrastructure] (Triển khai & Giám sát)
```

**Cập nhật lần cuối:** 2026-06-22
