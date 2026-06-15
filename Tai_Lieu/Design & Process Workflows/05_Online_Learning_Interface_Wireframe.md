# 05. Online Learning Interface Wireframe

> **Mục đích:** Giao diện phòng học WebRTC — màn hình phức tạp nhất, dùng ASCII layout toàn bộ.
> **Lưu ý:** Mermaid `graph` không thể mô phỏng được video grid 2D. ASCII layout này là spec cho frontend dev.
> **Tham chiếu:** UC-MTG-001 · UC-MTG-002 · UC-MTG-003 · BRD 04_Hoc_Truc_Tuyen.md

---

## SCR-MTG-001: Phòng học — Teacher (Host) view

**URL:** `/room/{roomId}`  
**Actor:** Teacher  
**UC liên quan:** UC-MTG-001, UC-MTG-002  
**BRD tham chiếu:** 04_Hoc_Truc_Tuyen.md §4.2, §4.8

### Layout

```
+--[BLK-ROOM-HEADER]------------------------------------------------------+
| [Logo]  Toán 10A — Buổi 12/15       ● REC  00:42:17   [▮▮▮▯ Good]  [X] |
+--[BLK-VIDEO-GRID]-------------------------------------------+--[CHAT]--+
|                                                             |           |
|  +--[Video 1 — Teacher — PINNED]--------+                  | BLK-CHAT  |
|  |                                      |  +--[V2]--+      | ───────── |
|  |         [Nguyễn Văn A]               |  |StudentB|      | 14:30 B:  |
|  |         Teacher view — 720p          |  +--------+      | Thầy giải |
|  |                           [📌][🔇]   |  +--[V3]--+      | thêm bài  |
|  +--------------------------------------+  |StudentC|      | này đi ạ  |
|                                            +--------+      | ───────── |
|  +--[V4]--+  +--[V5]--+  +--[ +10 ]----+  +--[V6]--+      | 14:31 A:  |
|  |StudentD|  |StudentE|  | +10 more    |  |StudentF|      | OK em      |
|  |        |  |        |  | (click xem) |  |        |      | ───────── |
|  +--------+  +--------+  +-------------+  +--------+      |           |
|                                                             | {Nhập...} |
+--[BLK-TOOLBAR — TEACHER]--------------------------------------------+--+
| [🎤 Mute All] [🎤 Unmute] [📷 Cam] [🖥 Share] [⏺ Record] [👥 15] [⏹ End] |
+---------------------------------------------------------------------+----+
```

**Chú thích Video Grid:**

| Số participants | Layout |
|:--|:--|
| 1 (chỉ Teacher) | 1 ô lớn full |
| 2–4 | Grid 2×2 đều nhau |
| 5–9 | 1 ô lớn (Pinned/Speaker) + grid nhỏ bên phải |
| ≥ 10 | 1 ô lớn + 5 ô nhỏ + ô "+N more" — click để xem thêm |

### BLK-ROOM-HEADER — chi tiết

```
+-------------------------------------------------------------------------+
| [Logo]  [Tên lớp] — [Buổi X/Y]   [● REC]  [Timer: 00:42:17]  [▮▮▮▯ Good]  [✕ Thoát] |
```

| Thành phần | Mô tả |
|:--|:--|
| `● REC` | Chấm đỏ nhấp nháy 1s + chữ "REC". Ẩn khi không ghi hình |
| Timer | Đếm thời gian từ lúc phòng mở, định dạng HH:MM:SS |
| Connection Bar `▮▮▮▯` | 4 thanh, fill theo mức: 4/4 Excellent, 3/4 Good, 2/4 Poor, 1/4 Critical |
| Thoát `✕` | Teacher → Modal xác nhận "Kết thúc buổi học?" / Student → Thoát phòng |

### BLK-TOOLBAR — Teacher vs Student

| Nút | Teacher | Student |
|:--|:--:|:--:|
| Tắt/Bật mic cá nhân | ✓ | ✓ |
| Tắt/Bật camera cá nhân | ✓ | ✓ |
| Chia sẻ màn hình | ✓ | ✓ |
| Mute All (tắt mic tất cả) | ✓ | — |
| Ghi hình ⏺ | ✓ | — |
| Quản lý thành viên 👥 | ✓ | — |
| Kết thúc buổi học ⏹ | ✓ | — |
| Rời phòng | — | ✓ (nút "Rời phòng") |

### States

| State | Biểu hiện |
|:--|:--|
| **Kết nối ban đầu** | Spinner overlay toàn trang "Đang kết nối..." — không hiện toolbar |
| **Đang ghi hình** | `● REC` hiện và nhấp nháy, toast "Đang ghi hình" 3 giây |
| **Mất kết nối** | Overlay mờ 60% + spinner "Đang kết nối lại..." |
| **Reconnect thất bại** | Modal: "Mất kết nối. Thời gian vắng mặt đã được ghi nhận." + [Thử lại] |
| **Recording quota gần đầy** | Banner cam: "Còn 500MB dung lượng ghi hình" |
| **1 participant video lỗi** | Ô video đó hiển thị avatar + icon cảnh báo thay vì video |

---

## SCR-MTG-002: Phòng học — Student view

**URL:** `/room/{roomId}`  
**Actor:** Student  
**UC liên quan:** UC-MTG-001, UC-MTG-003  
**BRD tham chiếu:** 04_Hoc_Truc_Tuyen.md §4.2

### Layout

```
+--[BLK-ROOM-HEADER]------------------------------------------------------+
| [Logo]  Toán 10A — Buổi 12/15             ● REC  00:42:17  [▮▮▮▮ Excel] [Rời phòng] |
+--[BLK-VIDEO-GRID]-------------------------------------------+--[CHAT]--+
|                                                             |           |
|  +--[Video 1 — Teacher — PINNED]--------+                  | ───────── |
|  |                                      |  +--[V-Self]--+  | Tin nhắn  |
|  |         [Nguyễn Văn A]               |  | (Student   |  | trong lớp |
|  |         Giáo viên                    |  |  mình)     |  |           |
|  |                           [📌]       |  +------------+  | ───────── |
|  +--------------------------------------+  +--[V3]------+  |           |
|                                            |StudentC    |  | {Nhập...} |
|  +--[V4]--+  +--[V5]--+  +--[ +10 ]----+  +------------+  |           |
|  |StudentD|  |StudentE|  | +10 more    |                   |           |
|  +--------+  +--------+  +-------------+                   |           |
+--[BLK-TOOLBAR — STUDENT]-----------------------------------------+------+
|          [🎤 Mic]  [📷 Cam]  [🖥 Share]  [✋ Giơ tay]            |
+------------------------------------------------------------------+------+
```

**Khác biệt so với Teacher view:**
- Không có: nút Mute All, ⏺ Record, 👥 Quản lý, ⏹ Kết thúc
- Có thêm: `✋ Giơ tay` (raise hand)
- Nút thoát: "Rời phòng" → không có modal confirm (Student rời không kết thúc buổi học)

---

## SCR-MTG-003: Consent Prompt — Popup ghi hình

**Hiển thị khi:** Teacher bật ghi hình trong khi Student đang trong phòng  
**UC liên quan:** UC-MTG-003  
**BRD tham chiếu:** 04_Hoc_Truc_Tuyen.md §4.8

### Layout

```
+--------------------------------------------------+
|  📹 Thông báo ghi hình                           |
|  ────────────────────────────────────────────── |
|  Giáo viên đang bắt đầu ghi hình buổi học này.  |
|                                                  |
|  Buổi học và hình ảnh của bạn sẽ được lưu trữ  |
|  theo chính sách bảo mật của hệ thống.          |
|                                                  |
|  Thời hạn lưu trữ: tối đa 180 ngày.            |
|                                                  |
|           [Đồng ý & Tiếp tục]                   |
|           [Rời phòng học]                        |
+--------------------------------------------------+
```

**Behavior:**
- Popup block toàn bộ phòng học (không thể tương tác sau lưng)
- Không có nút X (bắt buộc chọn 1 trong 2)
- Nếu không phản hồi sau 60 giây: tự động chọn "Rời phòng"
- Chỉ hiển thị **1 lần** trong buổi học — nếu Student rời và vào lại thì không hiện nữa

---

## SCR-MTG-004: Xem lại Recording

**URL:** `/recordings/{recordingId}`  
**Actor:** Student, Teacher  
**UC liên quan:** UC-MTG-004  

### Layout

```
+--[BLK-HEADER]---------------------------------------------------------+
| [Logo]  Recordings / Toán 10A — Buổi 12                 [Avatar]      |
+-----------------------------------------------------------------------+
|                                                                       |
| +--[BLK-VIDEO-PLAYER]------------------------------------------+      |
| |                                                              |      |
| |              [Video Player — 16:9]                           |      |
| |              Phát nội dung buổi học                          |      |
| |                                                              |      |
| +──────────────────────────────────────────────────────────────+      |
| | ▶ | ──────────────●──────────────────────────── | 01:24:37   |      |
| | [🔊]  [0.5x] [1x] [1.25x] [1.5x] [2x]    [⛶ Fullscreen]    |      |
| +--------------------------------------------------------------+      |
|                                                                       |
| +--[BLK-RECORDING-INFO]---------------------------------------+       |
| | Toán 10A — Buổi 12/15                                       |       |
| | Ngày ghi: 15/06/2026   Thời lượng: 01:24:37                 |       |
| | GV: Nguyễn Văn A                                            |       |
| | [📥 Tải về]  (chỉ Teacher — nếu còn trong thời hạn lưu trữ)|       |
| +-------------------------------------------------------------+       |
+-----------------------------------------------------------------------+
```

**States:**

| State | Biểu hiện |
|:--|:--|
| Loading | Spinner trên video player |
| URL hết hạn (presigned URL 15 phút) | "Link tải đã hết hạn. Làm mới trang để lấy link mới." + nút Làm mới |
| Recording bị xóa (> 180 ngày) | "Bản ghi này đã hết thời hạn lưu trữ và không còn khả dụng." |
| Đang transcode | "Bản ghi đang được xử lý, vui lòng quay lại sau ít phút." |
