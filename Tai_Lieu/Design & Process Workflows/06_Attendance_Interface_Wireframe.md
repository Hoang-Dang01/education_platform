# 06. Attendance Interface Wireframe

> **Mục đích:** Giao diện điểm danh — gồm 3 màn hình: Student xem lịch sử cá nhân, Teacher/Admin quản lý toàn lớp, và xuất báo cáo.
> **Tham chiếu:** UC-ATT-001 · UC-ATT-002 · UC-RPT-001 · BRD 06_Diem_Danh.md · BRD 11_Bao_Cao_Xuat_Du_Lieu.md

---

## SCR-ATT-001: Lịch sử điểm danh — Student view

**URL:** `/attendance`  
**Actor:** Student  
**UC liên quan:** UC-ATT-002  
**BRD tham chiếu:** 06_Diem_Danh.md §6.8–6.9

### Layout

```
+--[BLK-HEADER]---------------------------------------------------------+
| [Logo]  Điểm danh của tôi                           [Avatar]  Student  |
+------+----------------------------------------------------------------+
|      |                                                               |
| [SB] | +--[BLK-ATT-SUMMARY]----------------------------------------+ |
|      | | Tổng quan điểm danh                                       | |
|      | | +----------+  +----------+  +----------+  +----------+    | |
|      | | | 15       |  | 14       |  | 1        |  | 89%      |    | |
|      | | | Tổng buổi|  | Có mặt  |  | Vắng mặt |  | Tỷ lệ    |    | |
|      | | +----------+  +----------+  +----------+  +----------+    | |
|      | +-----------------------------------------------------------+ |
|      |                                                               |
|      | +--[BLK-FILTER]-----------+                                  |
|      | | Lớp: [Toán 10A ▾]  Kỳ: [HK1-2025 ▾]  [Áp dụng]          |
|      | +-------------------------+                                  |
|      |                                                               |
|      | +--[BLK-ATT-LIST]-------------------------------------------+ |
|      | | # | Buổi học     | Ngày       | Thời lượng | Tỷ lệ | Ghi chú | |
|      | | 1 | Toán 10A B12 | 15/06/2026 | 90 phút    | 95%   | —       | |
|      | | 2 | Toán 10A B11 | 12/06/2026 | 90 phút    | 100%  | —       | |
|      | | 3 | Toán 10A B10 | 10/06/2026 | 90 phút    | 62%   | 🟠 Vắng | |
|      | | 4 | Toán 10A B9  | 08/06/2026 | 90 phút    | 0%    | 🔴 Vắng | |
|      | | ...                                                        | |
|      | | [← Trước]  Trang 1 / 3  [Tiếp →]                          | |
|      | +-----------------------------------------------------------+ |
|      |                                                               |
|      | +--[BLK-ATT-DETAIL — khi click vào 1 buổi]------------------+ |
|      | | Toán 10A — Buổi 12 — 15/06/2026                           | |
|      | | Tỷ lệ: 95% = (85 phút có mặt / 90 phút)                   | |
|      | | ─────────────────────────────────────────────────         | |
|      | | Sự kiện:                                                   | |
|      | | 14:00:23  JOIN         — Kết nối lần đầu                  | |
|      | | 14:38:11  DISCONNECT   — Mất kết nối                      | |
|      | | 14:41:05  RECONNECT    — Kết nối lại (2 phút 54 giây)     | |
|      | | 15:25:00  LEAVE        — Rời phòng                        | |
|      | +-----------------------------------------------------------+ |
+------+----------------------------------------------------------------+
```

### Mô tả khối

| Block | Mô tả |
|:--|:--|
| **BLK-ATT-SUMMARY** | 4 metric cards: tổng buổi, số buổi có mặt, số buổi vắng, tỷ lệ tổng |
| **BLK-FILTER** | Lọc theo lớp học và học kỳ |
| **BLK-ATT-LIST** | Bảng lịch sử từng buổi. Tỷ lệ < 75%: màu Poor (#F97316), 0%: màu Critical |
| **BLK-ATT-DETAIL** | Expand khi click vào buổi: hiển thị chuỗi sự kiện JOIN/DISCONNECT/RECONNECT/LEAVE |

### States

| State | Biểu hiện |
|:--|:--|
| Loading | Skeleton cho summary cards và bảng |
| Empty (chưa có buổi học nào) | "Bạn chưa tham gia buổi học nào trong học kỳ này." |
| Buổi vắng 0% | Row màu đỏ nhạt, badge "🔴 Vắng" |

---

## SCR-ATT-002: Quản lý điểm danh — Teacher view (toàn lớp)

**URL:** `/classes/{classId}/attendance`  
**Actor:** Teacher  
**UC liên quan:** UC-ATT-001, UC-ATT-002, UC-RPT-001  
**BRD tham chiếu:** 06_Diem_Danh.md §6.2–6.9

### Layout

```
+--[BLK-HEADER]---------------------------------------------------------+
| [Logo]  Toán 10A / Điểm danh                        [Avatar]  Teacher  |
+------+----------------------------------------------------------------+
|      |                                                               |
| [SB] | +--[BLK-ATT-CLASS-SUMMARY]----------------------------------+ |
|      | | Lớp Toán 10A — Học kỳ 1 — 2025/2026                      | |
|      | | +----------+  +----------+  +----------+  +----------+    | |
|      | | | 15       |  | 15       |  | 87.3%    |  | 3        |    | |
|      | | | Học viên |  | Buổi học |  | ĐD TB    |  | Dưới 75% |    | |
|      | | +----------+  +----------+  +----------+  +----------+    | |
|      | +-----------------------------------------------------------+ |
|      |                                                               |
|      | [Tab: Theo buổi học]  [Tab: Theo học viên]                   |
|      | ─────────────────────────────────────────────────────────── |
|      |                                                               |
|      | +--[BLK-SESSION-VIEW — Tab: Theo buổi học]-----------------+ |
|      | | Chọn buổi: [Buổi 12 — 15/06/2026 ▾]                      | |
|      | |                                                           | |
|      | | Học viên       Tỷ lệ  Trạng thái  Chi tiết sự kiện         | |
|      | | Trần Thị B     100%   ✅ Có mặt    JOIN 14:00 / LEAVE 15:30 | |
|      | | Lê Văn C       62%    🟠 Thiếu     + 2 disconnect          | |
|      | | Phạm Thị D     0%     🔴 Vắng      Không kết nối           | |
|      | | ...                                                        | |
|      | |                                     [📥 Xuất buổi này]    | |
|      | +-----------------------------------------------------------+ |
|      |                                                               |
|      | +--[BLK-STUDENT-VIEW — Tab: Theo học viên]-----------------+ |
|      | | Tìm học viên: {Nhập tên...}                               | |
|      | |                                                           | |
|      | | Học viên       B1   B2   B3  ...  B15  TB     Cảnh báo    | |
|      | | Trần Thị B     ✅   ✅   ✅  ...  ✅   96%    —            | |
|      | | Lê Văn C       ✅   ✅   🟠  ...  ✅   82%    —            | |
|      | | Phạm Thị D     ✅   🔴   ✅  ...  🔴   68%    ⚠️ Dưới 75% | |
|      | |                                     [📥 Xuất toàn lớp]  | |
|      | +-----------------------------------------------------------+ |
+------+----------------------------------------------------------------+
```

### Mô tả khối

| Block | Mô tả |
|:--|:--|
| **BLK-ATT-CLASS-SUMMARY** | Tổng quan lớp: tổng học viên, tổng buổi, ĐD trung bình, số học viên dưới ngưỡng |
| **Tab: Theo buổi học** | Chọn buổi cụ thể → thấy từng học viên: tỷ lệ, trạng thái, chuỗi sự kiện |
| **Tab: Theo học viên** | Ma trận học viên × buổi học, dễ nhìn ai vắng buổi nào |

### States

| State | Biểu hiện |
|:--|:--|
| Học viên đang live (buổi hiện tại) | Row hiển thị "🟢 Đang trong phòng" thay tỷ lệ (chưa chốt) |
| Tỷ lệ ĐD < 75% | Badge ⚠️ cảnh báo, màu Poor |
| Tỷ lệ ĐD 0% | Màu Critical (#EF4444) |

---

## SCR-ATT-003: Xuất báo cáo điểm danh

**URL:** Modal trên `/classes/{classId}/attendance`  
**Actor:** Teacher, Admin  
**UC liên quan:** UC-RPT-001  
**BRD tham chiếu:** 11_Bao_Cao_Xuat_Du_Lieu.md

### Layout (Modal)

```
+--[Modal: Xuất báo cáo điểm danh]-----------------------------+
|                                                              |
|  Phạm vi xuất:                                               |
|  (●) Toàn bộ học kỳ    ( ) Theo buổi học    ( ) Theo ngày   |
|                                                              |
|  Lớp: [Toán 10A ▾]                                           |
|  Từ ngày: {01/01/2026}     Đến ngày: {15/06/2026}           |
|                                                              |
|  Bao gồm:                                                    |
|  [✓] Chi tiết từng sự kiện (JOIN/DISCONNECT/RECONNECT/LEAVE) |
|  [✓] Tỷ lệ điểm danh từng buổi                              |
|  [ ] Chú thích của giáo viên                                 |
|                                                              |
|  Định dạng: (●) Excel (.xlsx)    ( ) PDF                     |
|                                                              |
|       [Hủy]                    [📥 Xuất báo cáo]             |
+--------------------------------------------------------------+
```

### Behavior

| Hành vi | Chi tiết |
|:--|:--|
| Click xuất | Toast "Đang tạo file..." — disable nút |
| File tạo xong | Toast "Tải xuống tự động bắt đầu" — enable nút |
| File > 10MB | Gửi qua email thay vì tải trực tiếp: "File lớn. Sẽ gửi qua email khi sẵn sàng." |
| Lỗi server | Toast đỏ "Không thể xuất. Thử lại." |

---

## SCR-ATT-004: Real-time Attendance — Live view (trong buổi học)

**Mô tả:** Widget hiển thị bên trong phòng học (Teacher only) — thấy ai đang có mặt realtime.

**Vị trí:** Side panel trong SCR-MTG-001, mở khi Teacher click [👥 N]

### Layout

```
+--[BLK-LIVE-PARTICIPANTS]----+
| 👥 Thành viên (15/15)        |
| Tìm: {Nhập tên...}          |
| ──────────────────────────  |
| ● Trần Thị B    🟢 Online   |
| ● Lê Văn C      🟠 Kết nối  |
| ● Phạm Thị D    ⚫ Offline   |
| ● Ngô Thị E     🟢 Online   |
| ...                         |
| ──────────────────────────  |
| [Mute All] [Xóa khỏi phòng] |
+-----------------------------+
```

| Trạng thái | Màu dot | Ý nghĩa |
|:--|:--|:--|
| 🟢 Online | Excellent | Kết nối ổn định |
| 🟠 Kết nối kém | Poor | Latency/Packet Loss cao |
| 🔄 Reconnecting | Spinner | Đang reconnect |
| ⚫ Offline | Neutral | Mất kết nối, chưa reconnect |
