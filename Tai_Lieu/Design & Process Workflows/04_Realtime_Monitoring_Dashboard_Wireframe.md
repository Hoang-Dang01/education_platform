# 04. Realtime Monitoring Dashboard Wireframe

> **Mục đích:** Dashboard giám sát mạng real-time của Admin — màn hình nhiều widget, dùng ASCII layout thay Mermaid.
> **Chuẩn hóa:** Tuân theo quy ước màu 4 mức chất lượng của `02_Wireframes_Mockups.md`.
> **Tham chiếu:** UC-MON-001 · UC-NDX-001 · BRD 07_Giam_Sat_Thoi_Gian_Thuc.md · BRD 10_Chan_Doan_Su_Co.md

---

## SCR-MON-001: Monitoring Dashboard — Admin view

**URL:** `/admin/monitoring`  
**Actor:** Admin  
**UC liên quan:** UC-MON-001, UC-NDX-001  
**BRD tham chiếu:** 07_Giam_Sat_Thoi_Gian_Thuc.md

### Layout

```
+--[BLK-HEADER]------------------------------------------------------------+
| [Logo]  Monitoring                        [🔔 2 alerts]  [Admin]        |
+--------------------------------------------------------------------------+
|                                                                          |
| +--[BLK-SYSTEM-SUMMARY]------------------------------------------------+ |
| |  🟢 Excellent: 48 phòng  |  🔵 Good: 12 phòng  |  🟠 Poor: 5 phòng  |  🔴 Critical: 2 phòng  | |
| +----------------------------------------------------------------------+ |
|                                                                          |
| +--[BLK-ALERT-BANNER]--------------------------------------------------+ |
| | ⚠️ CRITICAL  Phòng: Toán 10A (room-042)  Packet Loss 8.2%  [Xem →]  | |
| | ⚠️ CRITICAL  Phòng: Lý 11B (room-017)    Latency 420ms     [Xem →]  | |
| +----------------------------------------------------------------------+ |
|                                                                          |
| +--[BLK-LIVE-SESSIONS]----------------------+  +--[BLK-ALERTS]-------+ |
| | 📡 Phòng học đang hoạt động (67)          |  | 🚨 Alerts (7)        | |
| | [Tìm kiếm phòng...]  [Filter: Tất cả ▾]   |  | Filter: Active ▾     | |
| | ──────────────────────────────────────── |  | ──────────────────── | |
| | Phòng       Participants  Quality  Action |  | room-042  Critical   | |
| | Toán 10A    15/15         🔴        [Chi] |  | 14:32 Packet Loss    | |
| | Lý 11B      12/14         🔴        [Chi] |  | [Acknowledge] [Diag] | |
| | Anh 10B     8/10          🟠        [Chi] |  | ────────────────── | |
| | Sử 12A      20/20         🟢        [Chi] |  | room-017  Critical   | |
| | Văn 11C     11/12         🔵        [Chi] |  | 14:29 Latency High   | |
| | ...                                       |  | [Acknowledge] [Diag] | |
| | [Hiển thị thêm ▾]  (hiển thị 10/67)       |  | [Xem tất cả →]       | |
| +-------------------------------------------+  +---------------------+ |
|                                                                          |
| +--[BLK-TIMESERIES]----------------------------------------------------+ |
| | 📈 Chất lượng kết nối theo thời gian — 60 phút qua                   | |
| | Metric: [Packet Loss ▾]  Room: [Tất cả ▾]  [Làm mới]                | |
| | ┌─────────────────────────────────────────────────────────────────┐  | |
| | │  % │                        ···                                  │  | |
| | │ 10 │               ········     ·····                            │  | |
| | │  5 │  ─────────────            ─────── ── ─────── ─────        │  | |
| | │  2 │──────                                                       │  | |
| | │  0 ├──────────────────────────────────────────────────────────   │  | |
| | │    14:00      14:15      14:30      14:45      15:00             │  | |
| | └─────────────────────────────────────────────────────────────────┘  | |
| | [Ngưỡng Poor: 5% ── ─] [Ngưỡng Critical: 10% ─ ─]                   | |
| +----------------------------------------------------------------------+ |
|                                                                          |
| +--[BLK-DIAGNOSTICS-RECENT]-------------------------------------------+ |
| | 🔬 Chẩn đoán gần đây                                                 | |
| | Thời gian   Phòng      Loại              Confidence  Trạng thái       | |
| | 14:32:01    room-042   Host Issue        High        Mở               | |
| | 14:29:45    room-017   Infrastructure   High        Mở               | |
| | 13:58:11    room-031   Participant Issue High        Resolved          | |
| | [Xem tất cả →]                                                        | |
| +----------------------------------------------------------------------+ |
```

### Mô tả khối

| Block | Mô tả | Refresh |
|:--|:--|:--|
| **BLK-SYSTEM-SUMMARY** | Tổng số phòng theo từng mức quality, màu sắc theo hệ thống 4 mức | Mỗi 5 giây |
| **BLK-ALERT-BANNER** | Banner nổi bật cho alert Critical/Major chưa acknowledge | Real-time (SSE/WebSocket) |
| **BLK-LIVE-SESSIONS** | Bảng danh sách tất cả phòng đang hoạt động, có filter theo quality level | Mỗi 5 giây |
| **BLK-ALERTS** | Danh sách alert đang active, mới nhất lên đầu | Real-time |
| **BLK-TIMESERIES** | Biểu đồ đường theo thời gian, Admin có thể chọn metric và scope | Polling 5 giây |
| **BLK-DIAGNOSTICS-RECENT** | Kết quả chẩn đoán gần nhất từ Rule Engine | Mỗi 30 giây |

### States

| State | Biểu hiện |
|:--|:--|
| Loading | Skeleton cho từng widget, không block toàn trang |
| Empty (không có phòng live) | BLK-LIVE-SESSIONS: "Không có lớp học nào đang diễn ra" + icon |
| Monitoring service down | Banner đỏ: "Dịch vụ giám sát tạm ngừng. Dữ liệu có thể không cập nhật." |
| Tất cả phòng Excellent | BLK-ALERT-BANNER ẩn, BLK-SYSTEM-SUMMARY hiển thị toàn xanh lá |

### Navigation

- Vào từ: Admin sidebar → Monitoring
- Drill-down: Click [Chi tiết] hoặc tên phòng → `SCR-MON-002` (Room Detail)
- Alert → Click [Diag] → `SCR-NDX-001` (Diagnostics Detail)

---

## SCR-MON-002: Room Detail — Drill-down view

**URL:** `/admin/monitoring/rooms/{roomId}`  
**Actor:** Admin  
**UC liên quan:** UC-MON-001  

### Layout

```
+--[BLK-HEADER]------------------------------------------------------------+
| [Logo]  Monitoring / Toán 10A (room-042)         [🔔]  [Admin]          |
+--------------------------------------------------------------------------+
|                                                                          |
| +--[BLK-ROOM-INFO]------------------------------------------------------+|
| | Phòng: Toán 10A  |  Teacher: Nguyễn Văn A  |  Bắt đầu: 14:00  |  15 participants  |  🔴 Critical  ||
| +-----------------------------------------------------------------------+|
|                                                                          |
| +--[BLK-PARTICIPANTS]-------------------+  +--[BLK-ROOM-METRICS]------+ |
| | 👥 Participants (15)                   |  | 📊 Metrics hiện tại       | |
| | ────────────────────────────────────  |  | ─────────────────────── | |
| | Người dùng       Role   Quality  PL   |  | Packet Loss:  8.2%  🔴   | |
| | Nguyễn V. A      Host   🔴        8.2% |  | Latency:     180ms  🔵   | |
| | Trần Thị B       Part   🟢        0.5% |  | Jitter:       12ms  🟢   | |
| | Lê Văn C         Part   🟠        3.1% |  | ─────────────────────── | |
| | ...                                    |  | Cập nhật 3 giây trước    | |
| | [Xem tất cả 15 →]                      |  +-------------------------+ |
| +----------------------------------------+                              |
|                                                                          |
| +--[BLK-METRICS-CHART]-------------------------------------------------+ |
| | Packet Loss — Teacher (Host) — 30 phút qua                           | |
| | ┌────────────────────────────────────────────────────────────────┐   | |
| | │12% │                                      ●●●                   │   | |
| | │ 8% │                              ●●●●●●●●                     │   | |
| | │ 5% │────────────────────────────── [ngưỡng Poor]               │   | |
| | │ 2% │●●●●●●●●●●●                                                 │   | |
| | └────────────────────────────────────────────────────────────────┘   | |
| | 14:20    14:25    14:30    14:35    14:40                             | |
| +----------------------------------------------------------------------+ |
|                                                                          |
| +--[BLK-ACTIONS]-------------------------------------------------------+ |
| | [🔬 Chạy chẩn đoán]  [📧 Gửi cảnh báo cho Teacher]  [✓ Acknowledge] | |
| +----------------------------------------------------------------------+ |
```

### Navigation

- Vào từ: SCR-MON-001 → click [Chi tiết] hoặc tên phòng
- Click [Chạy chẩn đoán] → Trigger Rule Engine → Redirect SCR-NDX-001
- Quay lại: Breadcrumb "Monitoring"

---

## SCR-NDX-001: Diagnostics Detail

**URL:** `/admin/monitoring/diagnostics/{incidentId}`  
**Actor:** Admin  
**UC liên quan:** UC-NDX-001  
**BRD tham chiếu:** 10_Chan_Doan_Su_Co.md

### Layout

```
+--[BLK-HEADER]------------------------------------------------------------+
| [Logo]  Monitoring / room-042 / Chẩn đoán #1432   [🔔]  [Admin]        |
+--------------------------------------------------------------------------+
|                                                                          |
| +--[BLK-INCIDENT-SUMMARY]----------------------------------------------+ |
| | 🔴 CRITICAL — Host Issue                                              | |
| | Phòng: Toán 10A  |  Thời gian phát hiện: 14:32:01  |  Confidence: High| |
| |                                                                       | |
| | 💡 Gợi ý: Kiểm tra kết nối mạng của Teacher (Nguyễn Văn A).          | |
| |    Packet Loss 8.2% trên Host trong 15 phút liên tục.                | |
| |    Xem xét di chuyển Teacher sang SFU node dự phòng.                 | |
| +----------------------------------------------------------------------+ |
|                                                                          |
| +--[BLK-RULE-DETAIL]---------------------------------------------------+ |
| | Rule được kích hoạt: Rule 01 — Host Issue                            | |
| | ─────────────────────────────────────────────────────────────────── | |
| | Điều kiện: Host Packet Loss > 5% VÀ > 50% participants bị ảnh hưởng | |
| | Kết quả kiểm tra:                                                    | |
| |   ✓ Host PL: 8.2%  (> 5%) — MATCH                                   | |
| |   ✓ Users bị ảnh hưởng: 11/15 = 73%  (> 50%) — MATCH                | |
| |   → Rule 01 khớp → Kết luận: Host Issue                             | |
| +----------------------------------------------------------------------+ |
|                                                                          |
| +--[BLK-ACTIONS]-------------------------------------------------------+ |
| | Trạng thái: [Mở ▾]                                                    | |
| | [✓ Xác nhận & Đóng]  [📧 Gửi thông báo]  [📝 Ghi chú điều tra]       | |
| +----------------------------------------------------------------------+ |
```
