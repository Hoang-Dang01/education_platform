# Kế hoạch Triển khai — Jitsi Meet Education Platform

## Tổng quan Chiến lược

Dự án sử dụng **Jitsi Meet** (open-source) làm nền tảng cốt lõi, deploy nguyên bộ và mở rộng thêm các tính năng giáo dục thông qua custom modules.

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                    EDUCATION PLATFORM                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Jitsi Meet (Core)                    │   │
│  │  • Video/Audio conferencing (WebRTC)              │   │
│  │  • Chat, Reactions, Polls, Screen Share            │   │
│  │  • Virtual Backgrounds, Raise Hand                │   │
│  │  • Recording (Jibri), Livestream                  │   │
│  └──────────────────────────────────────────────────┘   │
│                         ▲                               │
│                         │ Extend via react/features/    │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Custom Education Modules                 │   │
│  │  • Điểm danh tự động (Auto Attendance)            │   │
│  │  • Quản lý lớp học (Class Management)             │   │
│  │  • Teacher Controls (mute all, lock, queue)       │   │
│  │  • LMS Integration                               │   │
│  │  • Telemetry & Analytics Dashboard                │   │
│  │  • Branding & UI Customization                    │   │
│  └──────────────────────────────────────────────────┘   │
│                         ▲                               │
│                         │ API / Webhooks                │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Backend bổ trợ (Phase 2+)               │   │
│  │  • API quản lý khóa học, lớp học, học viên        │   │
│  │  • Lưu trữ điểm danh & báo cáo                   │   │
│  │  • Quản lý tài liệu giảng dạy                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Thành phần | Công nghệ | Ghi chú |
|:--|:--|:--|
| **Frontend** | React + TypeScript (Jitsi Meet) | Fork & extend |
| **State Management** | Redux (ReducerRegistry, MiddlewareRegistry) | Kiến trúc sẵn có của Jitsi |
| **WebRTC** | lib-jitsi-meet | Thư viện WebRTC core của Jitsi |
| **Video Bridge** | Jitsi Videobridge (JVB) | SFU server |
| **Signaling** | Orasma (XMPP) | Prosody XMPP server |
| **Conference Focus** | Jicofo | Quản lý phiên conference |
| **Recording** | Jibri | Ghi hình/livestream |
| **Deployment** | Docker / Docker Compose | Containerized deployment |
| **Backend bổ trợ** | (Phase 2+) Node.js hoặc tùy chọn | API riêng cho LMS |

---

## Roadmap chi tiết

### Phase 0 — Setup & Deploy Jitsi Meet ⚙️

**Mục tiêu:** Deploy thành công Jitsi Meet stack, có thể tạo phòng họp video hoạt động trên domain riêng.

**Công việc:**
- [ ] Deploy Jitsi Meet Docker stack:
  - `jitsi/web` — Frontend web app
  - `jitsi/prosody` — XMPP server
  - `jitsi/jicofo` — Conference focus manager
  - `jitsi/jvb` — Jitsi Videobridge (SFU)
- [ ] Cấu hình `docker-compose.yml` cho môi trường development
- [ ] Thiết lập HTTPS và domain riêng (hoặc localhost cho dev)
- [ ] Cấu hình `config.js`:
  - Bật/tắt tính năng theo nhu cầu giáo dục
  - Cấu hình authentication (JWT hoặc internal)
  - Giới hạn số người tham gia nếu cần
- [ ] Cấu hình `interface_config.js`:
  - Branding (logo, app name, favicon)
  - Theme colors phù hợp giáo dục
  - Ẩn/hiện các nút chức năng
- [ ] Smoke test: 2 người tham gia phòng, video/audio/chat hoạt động

**Kết quả Phase 0:** Hệ thống Jitsi Meet chạy ổn định, có branding riêng, sẵn sàng cho phát triển tính năng.

---

### Phase 1 — Education Features (Custom Jitsi Modules) 🎓

**Mục tiêu:** Thêm các tính năng đặc thù giáo dục vào Jitsi Meet thông qua custom feature modules.

**Phương pháp:** Tạo feature modules mới trong `react/features/` theo chuẩn Jitsi:
```
react/features/edu-attendance/
├── actionTypes.ts
├── actions.ts
├── components/
│   ├── AttendancePanel.tsx
│   └── AttendanceIndicator.tsx
├── middleware.ts
├── reducer.ts
├── functions.ts
└── constants.ts
```

**Công việc:**
- [ ] **Điểm danh tự động (edu-attendance)**
  - Track `PARTICIPANT_JOINED` / `PARTICIPANT_LEFT` events
  - Tính thời gian có mặt thực tế của từng participant
  - Grace period 30 giây cho reconnect (theo BRD)
  - UI Panel hiển thị trạng thái điểm danh realtime
  - Export kết quả điểm danh (CSV/JSON)

- [ ] **Teacher Controls nâng cao (edu-teacher-controls)**
  - Mute all students cùng lúc
  - Lock/unlock room
  - Raise hand queue management (FIFO)
  - Cho phép/thu hồi quyền share screen theo role

- [ ] **Quản lý lớp học (edu-classroom)**
  - Giao diện tạo/tham gia lớp học (thay vì random room name)
  - Phân biệt role: Teacher, Student, Observer
  - Danh sách lớp học với lịch học

- [ ] **UI Customization**
  - Theme giáo dục (màu sắc, icon phù hợp)
  - Welcome page tùy chỉnh cho platform giáo dục
  - Toolbar tùy chỉnh (ẩn tính năng không cần, thêm nút mới)

**Kết quả Phase 1:** Jitsi Meet với tính năng điểm danh tự động, teacher controls, quản lý lớp học cơ bản.

---

### Phase 2 — LMS & Backend bổ trợ 📚

**Mục tiêu:** Xây dựng backend API riêng để quản lý dữ liệu giáo dục, kết nối với Jitsi.

**Công việc:**
- [ ] Thiết kế database cho LMS:
  - `courses` — Khóa học
  - `classes` — Lớp học
  - `enrollments` — Phân bổ học viên/giáo viên
  - `materials` — Tài liệu giảng dạy
  - `attendance_records` — Kết quả điểm danh
  - `users` — Thông tin người dùng
- [ ] API CRUD cho khóa học, lớp học, học viên
- [ ] Tích hợp authentication chung giữa Jitsi và LMS (JWT)
- [ ] API lưu trữ kết quả điểm danh từ Jitsi module
- [ ] Upload/download tài liệu giảng dạy
- [ ] Giao diện web quản trị LMS (Admin Dashboard)

**Kết quả Phase 2:** Backend API hoạt động, dữ liệu LMS được quản lý, điểm danh được lưu trữ persistent.

---

### Phase 3 — Monitoring & Analytics 📊

**Mục tiêu:** Giám sát chất lượng kết nối và cung cấp báo cáo học tập.

**Công việc:**
- [ ] Tận dụng Jitsi Stats API (`/colibri/stats`) để thu thập metrics
- [ ] Giám sát chất lượng kết nối theo 4 mức (theo BRD):
  - Excellent: Latency < 150ms, Packet Loss < 2%, Jitter < 15ms
  - Good: Vượt nhẹ ngưỡng ở 1 chỉ số
  - Poor: Latency 150-300ms, Packet Loss 2-5%, Jitter 15-30ms
  - Critical: Latency > 300ms, Packet Loss > 5%, Jitter > 30ms
- [ ] Dashboard báo cáo học tập:
  - Tỷ lệ tham gia buổi học
  - Thời gian có mặt trung bình
  - Thống kê theo khóa học, lớp học, học viên
- [ ] Export báo cáo (PDF, Excel)

**Kết quả Phase 3:** Dashboard giám sát và báo cáo hoạt động.

---

### Phase 4 — Recording & Tài liệu học tập 🎥

**Mục tiêu:** Ghi hình buổi học và quản lý video.

**Công việc:**
- [ ] Deploy Jibri container cho recording
- [ ] Cấu hình recording tự động hoặc theo yêu cầu teacher
- [ ] Lưu trữ video (local storage hoặc cloud: MinIO/S3)
- [ ] Giao diện phát lại video buổi học
- [ ] Quản lý vòng đời video (theo BRD: Hot 30 ngày → Cold 150 ngày → Xóa)

**Kết quả Phase 4:** Recording hoạt động, video được lưu trữ và có thể phát lại.

---

## Ưu điểm của chiến lược Fork & Extend Jitsi Meet

| Lợi ích | Chi tiết |
|:--|:--|
| **Nhanh chóng** | Có ngay nền tảng video conferencing hoàn chỉnh |
| **Ổn định** | Jitsi Meet đã được kiểm chứng ở quy mô lớn |
| **Đầy đủ tính năng** | Chat, reactions, polls, share screen, virtual backgrounds... |
| **Tiết kiệm** | Không cần build WebRTC infrastructure từ đầu |
| **Community** | Hỗ trợ từ cộng đồng Jitsi lớn |
| **Mở rộng dễ dàng** | Feature-driven architecture cho phép thêm module mới |

---

## Tham chiếu tài liệu

- **BRD (Yêu cầu nghiệp vụ):** [Tai_Lieu/Business Requirement Document (BRD)/](../Tai_Lieu/Business%20Requirement%20Document%20(BRD)/README.md)
- **Jitsi Meet Source:** [jitsi-meet/](../jitsi-meet/)
- **Jitsi Handbook:** https://jitsi.github.io/handbook/
- **Jitsi Architecture:** https://jitsi.github.io/handbook/docs/architecture
