# Cấu trúc thư mục dự án (Project Directory Structure)

Dưới đây là sơ đồ cấu trúc cây thư mục toàn bộ dự án **EduMeet Education Platform**:

```text
education-platform/
├── README.md                              # Giới thiệu dự án và hướng dẫn chung
├── Cau_Truc_Thu_Muc.md                    # File này — sơ đồ cấu trúc cây thư mục
├── .gitignore                             # Git ignore (bảo vệ nested repos)
│
├── docs/                                  # Tài liệu dự án (đổi tên từ Tai_Lieu/)
│   ├── Business Requirement Document (BRD)/    # Yêu cầu nghiệp vụ
│   │   ├── README.md
│   │   ├── 01_Tong_Quan/
│   │   │   ├── 01_Muc_Tieu_Du_An.md
│   │   │   └── 02_Phan_Loai_Nguoi_Dung.md
│   │   ├── 02_Phan_He_Nghiep_Vu/
│   │   │   ├── 03_LMS.md
│   │   │   ├── 04_Hoc_Truc_Tuyen.md
│   │   │   ├── 05_Tai_Lieu.md
│   │   │   ├── 06_Diem_Danh.md
│   │   │   └── 11_Bao_Cao_Xuat_Du_Lieu.md
│   │   ├── 03_Giam_Sat_Telemetry/
│   │   │   ├── 07_Giam_Sat_Thoi_Gian_Thuc.md
│   │   │   ├── 08_Telemetry_Network_Analytics.md
│   │   │   ├── 09_Giam_Sat_Nguoi_Dung.md
│   │   │   └── 10_Chan_Doan_Su_Co.md
│   │   └── 04_Ket_Luan/
│   │       └── 12_Ket_Luan.md
│   │
│   ├── Software Requirement Specification (SRS)/  # Đặc tả yêu cầu phần mềm
│   │   ├── README.md
│   │   ├── 01_Functional_Requirements.md
│   │   ├── 02_Non_Functional_Requirements.md
│   │   └── 03_System_Constraints.md
│   │
│   ├── User Stories & Use Cases/          # User Stories và ca sử dụng
│   │   ├── README.md
│   │   ├── 01_Use_Case_Diagrams.md
│   │   ├── 02_Use_Case_Specifications.md
│   │   ├── 03_User_Stories_Catalog.md
│   │   └── 04_Acceptance_Criteria_Format_Standard.md
│   │
│   ├── Design & Process Workflows/        # Thiết kế quy trình & giao diện
│   │   ├── README.md
│   │   ├── 01_BPMN_Workflows.md
│   │   ├── 02_Wireframes_Mockups.md
│   │   ├── 03_LMS_Dashboard_Wireframe.md
│   │   ├── 04_Realtime_Monitoring_Dashboard_Wireframe.md
│   │   ├── 05_Online_Learning_Interface_Wireframe.md
│   │   └── 06_Attendance_Interface_Wireframe.md
│   │
│   ├── Data Mapping/                      # Đặc tả ánh xạ dữ liệu
│   │   ├── README.md
│   │   ├── 01_Data_Mapping_Specification.md
│   │   ├── 02_Data_Model_ERD.md
│   │   └── 03_Data_Migration_Strategy.md
│   │
│   ├── Technical Requirement Document (TRD)/  # Yêu cầu kỹ thuật
│   │   ├── README.md
│   │   ├── 01_Kien_Truc/
│   │   └── 02_Ke_Hoach_Va_Danh_Gia/
│   │
│   ├── Technical Design Document (TDD)/   # Thiết kế kỹ thuật chi tiết
│   │   ├── README.md
│   │   ├── 00-document-index.md
│   │   ├── 01-system-overview.md
│   │   ├── 02-domain-decomposition.md
│   │   ├── 03-bounded-context-design.md
│   │   ├── 04-service-design.md
│   │   ├── 05-module-design.md
│   │   ├── 06-api-design.md
│   │   ├── 07-database-design.md
│   │   ├── 08-event-design.md
│   │   ├── 09-sequence-design.md
│   │   ├── 10-realtime-design.md
│   │   ├── 11-security-design.md
│   │   ├── 12-deployment-configuration.md
│   │   ├── 13-testing-design.md
│   │   └── 14-traceability-matrix.md
│   │
│   ├── Solution Architecture Document (SAD)/  # Kiến trúc giải pháp
│   │   ├── README.md
│   │   ├── 01_Gioi_Thieu/
│   │   ├── 02_Kien_Truc_Thiet_Ke/
│   │   ├── 03_Cong_Nghe_Ha_Tang/
│   │   └── 04_Ket_Luan_Phu_Luc/
│   │
│   └── artifacts/                         # Hình ảnh, mockups, file sinh tự động
│
├── app/                                   # Frontend Web — EduMeet UI
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env.local                         # Dev config (gitignored)
│   ├── .env.production                    # Production config (gitignored)
│   └── src/
│       ├── main.tsx                       # Entry point
│       ├── App.tsx                        # Router chính
│       ├── index.css                      # Global styles
│       ├── components/                    # UI components
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── WelcomeScreen.tsx          # Lobby — màn hình trước khi vào lớp
│       │   ├── ClassroomScreen.tsx        # Màn hình lớp học chính
│       │   ├── VideoGrid.tsx              # Lưới video participants
│       │   ├── SidePanel.tsx              # Panel chat / điểm danh
│       │   └── ControlBar.tsx             # Thanh điều khiển
│       ├── context/
│       │   └── ClassContext.tsx           # Global state (participants, chat, mock)
│       └── lib/
│           ├── jitsiService.ts            # WebRTC — kết nối Jitsi server
│           └── mockData.ts                # Dữ liệu giả lập (dev mode)
│
└── infrastructure/                        # Hạ tầng triển khai (MỚI)
    │
    ├── jitsi-deploy/                      # Docker Compose stack (đổi tên từ docker-jitsi/)
    │   ├── docker-compose.yml             # 4 services: web, prosody, jicofo, jvb
    │   ├── .env.template                  # Template cấu hình — copy thành .env
    │   ├── .env                           # Cấu hình thật (gitignored — chứa passwords)
    │   ├── gen-passwords.sh               # Script sinh passwords ngẫu nhiên
    │   ├── README.md                      # Hướng dẫn deploy step-by-step
    │   └── custom/                        # Files tùy chỉnh (lấy từ jitsi-src/)
    │       ├── config.js                  # Cấu hình Jitsi (P2P tắt, toolbar lớp học)
    │       ├── interface_config.js        # Thương hiệu EduMeet (tắt logo Jitsi)
    │       └── main-vi.json               # Giao diện Tiếng Việt đầy đủ
    │
    └── jitsi-src/                         # Source code Jitsi Meet (để tham khảo)
        │                                  # ⚠️ Nested git repo — không track bởi outer git
        ├── config.js                      # Template cấu hình gốc (2000+ dòng)
        ├── interface_config.js            # Template giao diện gốc
        ├── lang/                          # 60+ ngôn ngữ (bao gồm vi)
        ├── libs/                          # Pre-built JS bundles & WebAssembly
        └── react/features/               # Source React của Jitsi Meet
```

---

## Phân loại thư mục theo vai trò

| Thư mục | Vai trò | Trạng thái git |
|---|---|---|
| `docs/` | Tài liệu nghiệp vụ & kỹ thuật | ✅ Tracked |
| `app/` | Frontend React/Vite/TypeScript | ✅ Tracked |
| `infrastructure/jitsi-deploy/` | Docker Compose + config triển khai | ✅ Tracked |
| `infrastructure/jitsi-src/` | Jitsi Meet source (tham khảo) | ❌ Gitignored (nested repo) |

---

## Luồng phát triển

```
[docs/] → Tài liệu → [app/] → Code frontend → [infrastructure/] → Deploy
```

**Cập nhật lần cuối:** 2026-06-19
