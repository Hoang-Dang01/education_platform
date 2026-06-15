# 03. LMS Dashboard Wireframe

> **Mục đích:** Layout dashboard học tập cho Student và Teacher — màn hình đầu tiên sau khi đăng nhập.
> **Chuẩn hóa:** Tuân theo quy ước màu, grid, component của `02_Wireframes_Mockups.md`.
> **Tham chiếu:** UC-LMS-001 · BRD 03_LMS.md

---

## SCR-LMS-001: Student Dashboard

**URL:** `/dashboard`  
**Actor:** Student  
**UC liên quan:** UC-LMS-001, UC-MTG-001, UC-ATT-002  
**BRD tham chiếu:** 03_LMS.md

### Layout

```
+--[BLK-HEADER]----------------------------------------------------+
| [Logo]   Dashboard                      [🔔]  [Avatar]  Student  |
+------+-----------------------------------------------------------+
|      |  Xin chào, [Tên học viên] 👋                              |
| [S]  |  ────────────────────────────────────────────────────────  |
| [I]  |                                                           |
| [D]  |  +--[BLK-UPCOMING]----------+  +--[BLK-ANNOUNCEMENTS]--+ |
| [E]  |  | 📅 Lịch học sắp tới       |  | 📢 Thông báo lớp       | |
| [B]  |  | ──────────────────────── |  | ─────────────────────  | |
| [A]  |  | Toán 10A                  |  | Toán 10A: Kiểm tra...  | |
| [R]  |  | Hôm nay 14:00–16:00       |  | Văn 11B: Nộp bài...    | |
|      |  | [Tham gia ngay →]         |  | [Xem tất cả]           | |
| 📚   |  |                           |  +------------------------+ |
| My   |  | Anh 11B                   |                            |
|Cours |  | Thứ 4, 08:00–10:00        |  +--[BLK-ATTENDANCE]------+ |
| es   |  | [Xem chi tiết]            |  | ✅ Điểm danh gần đây    | |
|      |  +---------------------------+  | ─────────────────────  | |
| 📅   |                                 | Toán 10A — 95%          | |
| Sche |  +--[BLK-COURSES]-------------------------------------------+ |
| dule |  | 📚 Khóa học đang theo học                               | |
|      |  | ─────────────────────────────────────────────────────── | |
| ✅   |  | +--[Card]------+  +--[Card]------+  +--[Card]--------+ | |
| Att. |  | | Toán 10A     |  | Anh văn 11B  |  | Vật Lý 10C    | | |
|      |  | | GV: Nguyễn A |  | GV: Trần B   |  | GV: Lê C      | | |
| 📁   |  | | 12/15 buổi   |  | 8/12 buổi    |  | 5/10 buổi     | | |
| Docs |  | | [Vào lớp]    |  | [Vào lớp]    |  | [Vào lớp]     | | |
|      |  | +--------------+  +--------------+  +---------------+ | |
+------+  +-------------------------------------------------------+ |
```

### Mô tả khối

| Block | Mô tả |
|:--|:--|
| **BLK-HEADER** | Logo, tên trang, icon thông báo (badge số nếu có alert), Avatar + tên role |
| **BLK-SIDEBAR** | Navigation theo role Student: My Courses, Schedule, Attendance, Documents |
| **BLK-UPCOMING** | Lịch học sắp diễn ra (trong 7 ngày tới), sắp xếp theo thời gian. Nút "Tham gia ngay" nổi bật khi lớp đang live (badge LIVE) |
| **BLK-ANNOUNCEMENTS** | Thông báo từ giáo viên, sắp xếp theo ngày mới nhất |
| **BLK-ATTENDANCE** | Tỷ lệ điểm danh 3 lớp gần nhất, link đến trang chi tiết |
| **BLK-COURSES** | Grid card các khóa học đang học, hiển thị tên GV và tiến độ buổi học |

### States

| State | Biểu hiện |
|:--|:--|
| Loading | Skeleton loader toàn trang, 3 card hình chữ nhật xám |
| Empty (chưa có khóa học) | Illustration + "Bạn chưa tham gia khóa học nào." + nút "Khám phá khóa học" |
| Error (API fail) | Banner đỏ nhạt + "Không thể tải dữ liệu. Thử lại." |
| Lớp đang LIVE | Card có badge "● LIVE" màu đỏ, nút "Tham gia ngay" nổi bật |

### Navigation

- Vào từ: Màn hình đăng nhập thành công
- Đi tới: `/room/{meetingId}` (khi click Tham gia), `/attendance` (xem điểm danh), `/courses/{id}` (xem chi tiết lớp)

---

## SCR-LMS-002: Teacher Dashboard

**URL:** `/dashboard`  
**Actor:** Teacher  
**UC liên quan:** UC-LMS-001, UC-MTG-001, UC-MTG-002, UC-RPT-001  
**BRD tham chiếu:** 03_LMS.md

### Layout

```
+--[BLK-HEADER]----------------------------------------------------+
| [Logo]   Dashboard                      [🔔 3]  [Avatar]  Teacher |
+------+-----------------------------------------------------------+
|      |  Xin chào, GV [Tên] 👋    Hôm nay: 15/06/2026            |
| [S]  |  ────────────────────────────────────────────────────────  |
| [I]  |                                                           |
| [D]  |  +--[BLK-QUICKSTATS]----------------------------------------+
| [E]  |  | 📊 Tổng quan                                             |
| [B]  |  | +----------+  +----------+  +----------+  +----------+   |
| [A]  |  | | 3        |  | 42       |  | 87%      |  | 2        |   |
| [R]  |  | | Lớp học  |  | Học viên |  | ĐD TB    |  | Lớp live |   |
|      |  | | đang quản|  | tổng     |  | hôm nay  |  | hiện tại |   |
| 📚   |  | +----------+  +----------+  +----------+  +----------+   |
| My   |  +----------------------------------------------------------+
|Class |                                                             |
|      |  +--[BLK-TODAY_SCHEDULE]--------+  +--[BLK-PENDING]------+ |
| 📅   |  | 📅 Lịch dạy hôm nay           |  | ⏳ Cần xử lý        | |
| Sche |  | ─────────────────────────── |  | ──────────────────── | |
| dule |  | 14:00 Toán 10A  [Mở phòng]  |  | 3 bài nộp chưa chấm | |
|      |  | 16:30 Anh 11B   [Đã mở]●   |  | Xuất BC tuần này    | |
| 👥   |  | 19:00 Vật Lý 10C[Lên lịch]  |  | [Xem tất cả]        | |
| Stu. |  +------------------------------+  +---------------------+ |
|      |                                                             |
| 📊   |  +--[BLK-MY_CLASSES]------------------------------------------+
| Rpts |  | 👥 Các lớp đang quản lý                                    |
|      |  | ──────────────────────────────────────────────────────────  |
| 📁   |  | Lớp         Học viên  Buổi  ĐD TB  Trạng thái   Thao tác  |
| Docs |  | Toán 10A    15        12/15  91%    ● Live       [Vào][BC] |
|      |  | Anh văn 11B 12        8/12   85%    Chờ           [QL][BC] |
+------+  | Vật Lý 10C  18        5/10   78%    Chờ           [QL][BC] |
          +------------------------------------------------------------+
```

### Mô tả khối

| Block | Mô tả |
|:--|:--|
| **BLK-QUICKSTATS** | 4 số liệu tổng quan dạng metric card: số lớp, tổng học viên, tỷ lệ ĐD trung bình hôm nay, số lớp đang live |
| **BLK-TODAY_SCHEDULE** | Lịch dạy hôm nay theo giờ, nút action phù hợp (Mở phòng / Đã mở● / Lên lịch) |
| **BLK-PENDING** | Việc cần xử lý: bài chưa chấm, báo cáo cần xuất, nhắc nhở |
| **BLK-MY_CLASSES** | Bảng quản lý lớp: tên lớp, số học viên, tiến độ, tỷ lệ ĐD trung bình, trạng thái |

### States

| State | Biểu hiện |
|:--|:--|
| Loading | Skeleton loader cho stat cards và bảng |
| Không có lớp | "Bạn chưa quản lý lớp nào." + nút "Tạo lớp mới" |
| Lớp đang live | Row highlight nhẹ, badge "● Live" xanh đỏ, nút "Vào phòng" nổi bật |

### Navigation

- Vào từ: Màn hình đăng nhập thành công
- Đi tới: `/room/{id}` (Vào phòng), `/classes/{id}` (Quản lý lớp), `/reports/{classId}` (Báo cáo)

---

## SCR-LMS-003: Class Detail — Teacher view

**URL:** `/classes/{classId}`  
**Actor:** Teacher  
**UC liên quan:** UC-LMS-001, UC-ATT-002  
**BRD tham chiếu:** 03_LMS.md

### Layout

```
+--[BLK-HEADER]----------------------------------------------------+
| [Logo]   Lớp / Toán 10A                [🔔]  [Avatar]  Teacher   |
+------+-----------------------------------------------------------+
|      |                                                           |
| [SB] |  +--[BLK-CLASS-INFO]--+  +--[BLK-CLASS-ACTIONS]---------+ |
|      |  | Toán 10A           |  | [Mở phòng học]               | |
|      |  | GV: Nguyễn Văn A   |  | [Xuất báo cáo điểm danh]     | |
|      |  | 15 học viên        |  | [Upload tài liệu]            | |
|      |  | 12/15 buổi đã học  |  | [Chỉnh sửa thông tin lớp]   | |
|      |  +--------------------+  +------------------------------+ |
|      |                                                           |
|      |  [Tab: Học viên]  [Tab: Lịch học]  [Tab: Tài liệu]  [Tab: Điểm danh] |
|      |  ─────────────────────────────────────────────────────── |
|      |                                                           |
|      |  +--[BLK-STUDENT-LIST]--------------------------------------+ |
|      |  | # | Tên học viên    | Email          | ĐD TB | Trạng thái | |
|      |  | 1 | Trần Thị B      | b@example.com  | 94%   | Hoạt động  | |
|      |  | 2 | Lê Văn C        | c@example.com  | 71%   | Cảnh báo   | |
|      |  | 3 | ...             | ...            | ...   | ...        | |
|      |  | [Xuất Excel]                          [Tìm kiếm...]      | |
|      |  +----------------------------------------------------------+ |
+------+-----------------------------------------------------------+
```

### States & Navigation

- Tab Học viên: bảng danh sách, cột ĐD TB dưới 75% hiển thị màu Poor (#F97316)
- Tab Điểm danh: bảng theo buổi học, xem chi tiết từng học viên
- Từ bảng học viên → click tên → Side drawer hiển thị lịch sử điểm danh cá nhân
