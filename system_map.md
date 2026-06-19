# Bản đồ kiến trúc hệ thống (System Architecture Map)

> **Hướng dẫn dành cho AI (AI Instructions):**
> Trước khi thực hiện bất kỳ nhiệm vụ phân tích, thiết kế hoặc sửa đổi nào trong dự án **Education Platform**, hãy đọc tệp này để hiểu nhanh bối cảnh kiến trúc và các quy tắc hệ thống.

---

## 1. Tổng quan Kiến trúc

Dự án sử dụng **Jitsi Meet** (open-source) làm nền tảng video conferencing cốt lõi, fork & extend trực tiếp để thêm các tính năng giáo dục.

### Kiến trúc hệ thống

```text
┌───────────────────────────────────────────┐
│           Jitsi Meet (Frontend)           │
│  React + TypeScript + Redux               │
│  react/features/ ← custom edu modules    │
├───────────────────────────────────────────┤
│         Jitsi Server Components           │
│  Prosody (XMPP) │ Jicofo │ JVB │ Jibri   │
├───────────────────────────────────────────┤
│      Backend bổ trợ (Phase 2+)           │
│  LMS API │ Attendance DB │ Materials      │
└───────────────────────────────────────────┘
```

### Tech Stack chính
- **Frontend:** Jitsi Meet (React + TypeScript, Redux, WebRTC via lib-jitsi-meet)
- **Video Bridge:** Jitsi Videobridge (JVB) — SFU server
- **Signaling:** Prosody (XMPP server)
- **Conference Manager:** Jicofo
- **Recording:** Jibri
- **Deployment:** Docker / Docker Compose

---

## 2. Bản đồ Tài liệu (Directory Map)

Chi tiết cấu trúc cây thư mục tại [Cau_Truc_Thu_Muc.md](file:///c:/Git%20cua%20tui/education-platform/Cau_Truc_Thu_Muc.md).

* **Yêu cầu Nghiệp vụ (BRD):** [Tai_Lieu/Business Requirement Document (BRD)/](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Business%20Requirement%20Document%20(BRD))
  * Đặc tả nghiệp vụ của 9 phân hệ cốt lõi (LMS, Học trực tuyến, Điểm danh, Telemetry, Giám sát, Chẩn đoán...).
* **Jitsi Meet Source:** [jitsi-meet/](file:///c:/Git%20cua%20tui/education-platform/jitsi-meet)
  * Source code nền tảng, custom education modules trong `react/features/`.
* **Kế hoạch Triển khai:** [Ke_Hoach_Trien_Khai/README.md](file:///c:/Git%20cua%20tui/education-platform/Ke_Hoach_Trien_Khai/README.md)
  * Roadmap 5 phases: Setup → Features → LMS → Analytics → Recording.

---

## 3. Các Quy tắc Nghiệp vụ Cốt lõi (Core Business Rules)

Các quy tắc này được kế thừa từ BRD và sẽ được triển khai trong các custom Jitsi modules.

### 3.1. Hệ thống Ngưỡng Telemetry Mạng (4 Mức)
Quy định hiển thị trạng thái kết nối WebRTC:
* **Excellent (Xanh lá - `#22C55E`):** Packet Loss < 2%, Latency < 150ms, Jitter < 15ms.
* **Good (Xanh dương - `#3B82F6`):** Chạm ngưỡng warning nhẹ trên 1 chỉ số.
* **Poor (Cam - `#F97316`):** Packet Loss 2-5% hoặc Latency 150-300ms hoặc Jitter 15-30ms.
* **Critical (Đỏ - `#EF4444`):** Packet Loss > 5% hoặc Latency > 300ms hoặc Jitter > 30ms.
* *Chi tiết:* [08_Telemetry_Network_Analytics.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Business%20Requirement%20Document%20(BRD)/03_Giam_Sat_Telemetry/08_Telemetry_Network_Analytics.md)

### 3.2. Quy tắc Gộp Thông báo (Notification Rules)
* **Gộp thông báo lịch học:** Cập nhật liên tục trong vòng **2 phút** → chỉ gửi 1 thông báo chứa thông tin mới nhất.
* **Triệt tiêu cảnh báo mạng:** Cảnh báo cùng nội dung bị triệt tiêu trong **3 phút**, chỉ tăng `repeat_count`.

### 3.3. Quy trình Điểm danh Tự động (Attendance Logic)
* **Tính tỷ lệ:** `Tỷ lệ = tổng thời gian có mặt thực tế / tổng thời lượng buổi học`.
* **Grace Period:** Mất kết nối ≤ **30 giây** → vẫn tính có mặt liên tục.
* **Khấu trừ:** Mất kết nối > 30 giây → khoảng thời gian đó bị khấu trừ.
* *Chi tiết:* [06_Diem_Danh.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Business%20Requirement%20Document%20(BRD)/02_Phan_He_Nghiep_Vu/06_Diem_Danh.md)

### 3.4. Vòng đời Dữ liệu (Data Lifecycles)
* **Recordings:** Hot 30 ngày → Cold 150 ngày → Xóa vĩnh viễn (tổng 180 ngày).
* **Connection Metrics:** Lưu trữ tối đa **90 ngày**.
* **Presigned URL Playback:** TTL **15 phút (900 giây)**.

---

## 4. Phương pháp Mở rộng Jitsi Meet

### Thêm Feature Module mới
Tạo thư mục trong `jitsi-meet/react/features/[tên-feature]/` theo chuẩn:
```
react/features/edu-[feature-name]/
├── actionTypes.ts       # Redux action type constants
├── actions.ts           # Action creators
├── components/          # React components
├── middleware.ts        # Side effects
├── reducer.ts           # State management
├── functions.ts         # Utility functions & selectors
├── constants.ts         # Constants
└── logger.ts            # Feature logger
```

### Cấu hình Jitsi Meet
* **`config.js`** — Cấu hình client-side (tính năng, authentication, giới hạn)
* **`interface_config.js`** — Branding, theme, toolbar controls
* **`CLAUDE.md`** — Hướng dẫn development chi tiết cho AI/developers
