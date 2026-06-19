# Đặc tả Backend — Giám sát & Telemetry thời gian thực

> Phục vụ BRD mục 7 (Giám sát thời gian thực), 10 (Chẩn đoán sự cố), 11 (Báo cáo & Xuất dữ liệu).
> Tài liệu này mô tả backend tối thiểu để dashboard Quản lý/Admin chuyển từ **mock** sang **dữ liệu thật**.

## 1. Vì sao bắt buộc có Backend

WebRTC stats là **cục bộ từng máy**. Quản lý đứng ngoài phòng không thể lấy số liệu các phòng khác từ trình duyệt. Cần một tầng trung tâm để **thu thập → lưu trữ → tổng hợp → phát lại** cho dashboard. Frontend đã thu được telemetry/thiết bị **của chính client** (xem `app/src/lib/deviceInfo.ts`, `jitsiService.LiveStats`); backend chịu trách nhiệm gom xuyên phòng và lưu lịch sử.

## 2. Kiến trúc tổng thể

```
  Client (browser)                Backend                         Dashboard (Quản lý)
  ────────────────                ───────                         ───────────────────
  getStats() + deviceInfo  ──POST /telemetry──►  Ingest API
                                                 │  (validate, gắn sessionId)
                                                 ▼
                                            Time-series store ──►  Rule Engine (mục 10)
                                                 │                      │
                                                 ▼                      ▼
                                            WebSocket Hub ──────►  Live dashboard
                                                 │
                                            Postgres (lịch sử) ──►  Report/Export API (mục 11)

  [Tùy chọn chính xác hơn] Jitsi Videobridge /colibri/stats ──poll──► Ingest
```

Hai nguồn telemetry (chọn 1 hoặc kết hợp):
- **(a) Client báo cáo**: mỗi client POST stats mỗi ~5s. Dễ triển khai, kiểm soát schema.
- **(b) Đọc hạ tầng Jitsi**: poll `GET /colibri/v2/conferences` + `/colibri/stats` từ Videobridge. Chính xác, không phụ thuộc client, nhưng cần self-host Jitsi (`infrastructure/jitsi-src`).

## 3. Mô hình dữ liệu (Postgres gợi ý)

```sql
-- Người dùng & phân quyền (thay mock mockUsers)
users(id, full_name, email, role ENUM('admin','manager','teacher','student'),
      status ENUM('active','suspended'), created_at, last_active_at)

-- Khóa học / lớp
courses(id, code, name, manager_id, created_at)
classes(id, course_id, room_name, subject, teacher_id, capacity,
        scheduled_at, status ENUM('scheduled','in_progress','completed','interrupted','cancelled'))

-- Một lần tổ chức lớp (1 buổi)
sessions(id, class_id, started_at, ended_at, status)

-- Người tham gia trong 1 session
session_participants(id, session_id, user_id, role, device_type, os, browser,
                     network_type, joined_at, left_at,
                     total_present_seconds, disconnect_count)

-- Telemetry theo thời gian (time-series — cân nhắc TimescaleDB/partition theo ngày)
telemetry_samples(id, session_id, participant_id, ts,
                  latency_ms, packet_loss_pct, jitter_ms, bitrate_kbps, framerate,
                  conn_state ENUM('connected','reconnecting','disconnected'))

-- Sự kiện kết nối (phục vụ đếm disconnect & tính giờ có mặt)
connection_events(id, session_id, participant_id, ts,
                  type ENUM('join','leave','reconnect','disconnect'))

-- Kết quả chẩn đoán (mục 10)
incidents(id, session_id, ts, type ENUM('host','participant','infra'),
          severity ENUM('minor','moderate','major','critical'),
          confidence ENUM('low','medium','high'), detail, resolved_at)
```

## 4. API (REST + WebSocket)

### 4.1 Ingest (client → BE)
```
POST /api/telemetry
Body: {
  sessionId, participantId,
  stats: { latency, packetLoss, jitter, bitrate, framerate, networkType },
  device: { deviceType, os, browser, network },
  connState, ts
}
→ 202 Accepted
```
> Shape `stats` khớp `LiveStats` trong `app/src/lib/jitsiService.ts`; `device` khớp `DeviceInfo` trong `app/src/lib/deviceInfo.ts`. FE chỉ cần đổi: thay vì set vào state, gửi POST này định kỳ.

### 4.2 Real-time monitoring (BE → dashboard)
```
GET  /api/monitoring/overview        → KPI tổng (BRD 7.2): liveClasses, teachers,
                                        students, connections, usersWithIssues, classesWithWarning
GET  /api/monitoring/classes         → danh sách lớp đang diễn ra (BRD 7.3)
GET  /api/monitoring/classes/:id     → chi tiết + participants + telemetry mới nhất (7.4–7.6)
WS   /ws/monitoring                  → push cập nhật mỗi vài giây (thay polling)
     event: { type:'class_update'|'participant_update'|'incident', payload }
```

### 4.3 Chẩn đoán (mục 10) — chạy server-side
Rule Engine đã có bản FE thuần tại `app/src/lib/diagnostics.ts` (ngưỡng 7.7 + Rule 01/02/03). **Chuyển logic này sang BE** chạy trên dữ liệu xuyên phòng:
- Rule 01 Host / Rule 02 Participant: trong 1 session.
- Rule 03 Infra: quét ≥30% lớp đang hoạt động cùng cảnh báo → ghi `incidents`.

### 4.4 Báo cáo & Xuất (BRD 11)
```
GET  /api/reports/student/:id?from=&to=     → BRD 11.3
GET  /api/reports/class/:id                 → BRD 11.4
GET  /api/reports/system?from=&to=          → BRD 11.6
GET  /api/reports/:type/export?format=xlsx|csv|pdf   → tải file
```

## 5. Thuật toán cần ở BE (không làm được tin cậy ở FE)

1. **Tổng thời gian có mặt thực tế** = Σ các khoảng `connected` giữa cặp `join/reconnect` → `leave/disconnect`, trừ thời gian `disconnected`. Tính từ `connection_events`.
2. **Số lần mất kết nối** = đếm event `disconnect` trong session.
3. **Chất lượng trung bình** = trung bình có trọng số theo thời gian của `telemetry_samples`.
4. **Xác định Host vs Participant** = Rule Engine mục 10 trên dữ liệu cả phòng.

## 6. Lộ trình tích hợp với Frontend hiện tại

| FE hiện tại (mock) | Thay bằng |
|---|---|
| `mockUsers`, `mockLiveClasses` | `GET /api/...` |
| `MonitoringPage` đọc mock | subscribe `WS /ws/monitoring` |
| `diagnostics.ts` chạy ở FE | giữ làm fallback; nguồn chính từ `incidents` BE |
| Nút "Tải Báo Cáo XLS" (chưa chạy) | gọi `/api/reports/.../export` |
| `onLocalStatsUpdated` set vào state | thêm: POST `/api/telemetry` mỗi ~5s |

## 7. Gợi ý công nghệ
- **API/Realtime**: NestJS (hoặc Express) + `ws`/Socket.IO.
- **DB**: PostgreSQL (+ TimescaleDB cho `telemetry_samples` nếu lượng mẫu lớn).
- **Auth**: JWT, middleware kiểm quyền theo `ROLE_PERMISSIONS` (đồng bộ với `app/src/lib/roles.ts`).
- **Jitsi**: self-host từ `infrastructure/jitsi-src` để lấy `/colibri/stats` và moderation thật (force-mute, ghi hình).
- **Export**: `exceljs` (xlsx), `json2csv` (csv), `puppeteer`/`pdfkit` (pdf).
