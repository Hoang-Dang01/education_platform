# 02. Design Standards & Wireframe Conventions

> **Mục đích:** Xác lập một lần các quy ước về màu sắc, grid, component, và notation — mọi file wireframe (03–06) đều tuân theo tài liệu này.
> **Tham chiếu:** UC-MON-001 · UC-MTG-001 · UC-ATT-001 · BRD 04, 06, 07

---

## 1. Design Principles

| Nguyên tắc | Giải thích |
|:--|:--|
| **Clarity first** | Ưu tiên nội dung rõ ràng, không cần đọc docs DEV vẫn hiểu layout |
| **Role-aware UI** | Cùng màn hình nhưng Student / Teacher / Admin thấy khác nhau |
| **Real-time feedback** | Mọi thay đổi trạng thái (kết nối, ghi hình, điểm danh) có indicator ngay lập tức |
| **Fail gracefully** | Mọi màn hình phải có empty state và error state — không được blank trắng |
| **Accessibility** | Màu cảnh báo đạt WCAG AA (contrast ratio ≥ 4.5:1) với nền trắng |

**Thiết bị mục tiêu:**

| Actor | Thiết bị chính |
|:--|:--|
| Student | Desktop ≥ 1024px (tablet hỗ trợ xem lịch sử, không hỗ trợ phòng học) |
| Teacher | Desktop ≥ 1280px |
| Admin | Desktop ≥ 1440px |

---

## 2. Color System

### 2.1 Màu cảnh báo phân cấp — 4 mức (khớp UC-MON-001)

| Mức | Tên | HEX | Dùng khi |
|:--|:--|:--|:--|
| 1 | **Excellent** | `#22C55E` | Tất cả metrics bình thường |
| 2 | **Good** | `#3B82F6` | 1 metric chạm ngưỡng warning nhẹ |
| 3 | **Poor** | `#F97316` | Packet Loss > 5% **hoặc** Latency > 300ms |
| 4 | **Critical** | `#EF4444` | ≥ 2 metrics vượt ngưỡng nghiêm trọng |

### 2.2 Ngưỡng metric ↔ Màu (khớp UC-MON-001)

| Metric | Good | Poor | Critical |
|:--|:--|:--|:--|
| Packet Loss | < 2% | 2–5% | > 5% |
| Latency | < 150ms | 150–300ms | > 300ms |
| Jitter | < 15ms | 15–30ms | > 30ms |

### 2.3 Bảng màu cơ bản

| Token | HEX | Dùng cho |
|:--|:--|:--|
| Primary | `#2563EB` | Button CTA, active nav, link |
| Primary Hover | `#1D4ED8` | Hover state |
| Surface | `#F8FAFC` | Nền trang, nền sidebar |
| Border | `#E2E8F0` | Đường phân cách, border input |
| Text Primary | `#0F172A` | Tiêu đề, nội dung quan trọng |
| Text Secondary | `#64748B` | Label, placeholder, metadata |
| Danger | `#DC2626` | Nút xóa, lỗi nghiêm trọng |
| Recording Red | `#EF4444` | REC badge, animation nhấp nháy |

---

## 3. Layout & Grid System

### 3.1 Breakpoints

| Tên | Min-width | Cột | Gutter |
|:--|:--|:--|:--|
| Mobile | 320px | 4 | 16px |
| Tablet | 768px | 8 | 24px |
| Desktop | 1024px | 12 | 24px |
| Desktop Large | 1280px | 12 | 32px |
| Admin | 1440px | 12 | 32px |

### 3.2 Cấu trúc layout tổng thể

```
+------------------------------------------------------------------+
| HEADER (64px — fixed top)                                        |
| [Logo]  [Breadcrumb / Tên lớp]      [Alert 🔔]  [Avatar]  [Role] |
+------------------------------------------------------------------+
|             |                                                    |
| SIDEBAR     |  MAIN CONTENT                                      |
| 240px       |  (flex — chiếm phần còn lại, padding 24px)        |
| (collapsed: |                                                    |
|  64px icon) |                                                    |
|             |                                                    |
+------------------------------------------------------------------+
```

### 3.3 Navigation Sidebar theo Role

| Menu item | Student | Teacher | Admin |
|:--|:--:|:--:|:--:|
| Dashboard | ✓ | ✓ | ✓ |
| My Courses / My Classes | ✓ | ✓ | — |
| Attendance History | ✓ | — | — |
| Manage Classes | — | ✓ | ✓ |
| Reports | — | ✓ (lớp mình) | ✓ (toàn hệ thống) |
| Monitoring | — | — | ✓ |
| User Management | — | — | ✓ |
| System Settings | — | — | ✓ |

---

## 4. Component Conventions

### 4.1 Trạng thái Component

| State | Biểu hiện |
|:--|:--|
| Default | Style cơ bản |
| Hover | Background nhạt hơn, cursor pointer |
| Active / Focus | Border Primary 2px + outline 2px |
| Loading | Skeleton loader hoặc spinner, pointer-events: none |
| Disabled | Opacity 0.4, cursor not-allowed |
| Error | Border Danger, text lỗi màu Danger bên dưới |
| Success | Border Excellent, check icon |

### 4.2 Real-time Indicators

| Indicator | Vị trí | Behavior |
|:--|:--|:--|
| **REC badge** | Header phòng học — bên trái | Chấm đỏ `●` nhấp nháy 1s + chữ "REC" |
| **Connection Bar** | Header phòng học — bên phải | 4 thanh đứng fill màu theo mức quality |
| **Online dot** | Avatar trong danh sách user | Chấm tròn 8px màu Excellent (#22C55E) |
| **LIVE badge** | Card lớp đang diễn ra | Badge "LIVE" màu Danger, nhấp nháy nhẹ |
| **Alert counter** | Icon chuông ở Header | Badge số nền đỏ nếu có alert chưa đọc |

### 4.3 Trạng thái mất kết nối / reconnect (UC-ATT-001, UC-MTG-001)

| Trạng thái | Giao diện |
|:--|:--|
| **Mất kết nối** | Overlay mờ 60% + spinner + "Đang kết nối lại..." (không block toàn bộ UI) |
| **Reconnect thành công** | Toast success "Đã kết nối lại" — tự đóng sau 3 giây |
| **Reconnect thất bại** | Modal: "Không thể kết nối lại. Thời gian vắng mặt đã được ghi nhận." + nút Thử lại |

### 4.4 Empty State & Error State

| Loại | Bắt buộc có |
|:--|:--|
| **Empty state** | Icon SVG + tiêu đề + mô tả + CTA button (ví dụ: "Tạo lớp đầu tiên") |
| **Error state** | Icon cảnh báo + message lỗi cụ thể + nút Thử lại |
| **No permission** | Lock icon + "Bạn không có quyền xem nội dung này" |

---

## 5. Navigation Pattern

### 5.1 Modal vs Full Page

| Loại thao tác | Pattern |
|:--|:--|
| Form ngắn (< 5 trường) | Modal overlay |
| Form dài / upload file | Full page route |
| Confirmation (xóa, kết thúc lớp) | Modal dialog nhỏ |
| Detail view (học viên, lớp) | Side drawer (slide từ phải) |
| Phòng học WebRTC | Full screen route `/room/{id}` |

---

## 6. Wireframe Notation Standard

### 6.1 Khi nào dùng gì

| Loại màn hình | Công cụ |
|:--|:--|
| BPMN / luồng quy trình | Mermaid `flowchart` |
| Dashboard đơn giản (list, card) | Mermaid hoặc ASCII |
| Dashboard multi-widget (Monitoring) | ASCII layout box |
| Phòng WebRTC (video grid + toolbar + chat) | ASCII layout box bắt buộc |

> Mermaid `graph` **không thể** mô phỏng vị trí không gian của video grid hay widget dashboard. Dùng ASCII cho 2 màn hình đó.

### 6.2 Cú pháp ASCII Box chuẩn

```
+--[Tên khối]----------+    Khối UI có tiêu đề
| Nội dung             |    Nội dung bên trong khối
+----------------------+    Đáy khối

[Nút bấm]                  Button / element có thể click
<Dropdown>                  Dropdown select
{Input field}               Text input / form field
● Indicator                 Status dot / live indicator
─────────────────────────── Đường phân cách ngang
│                           Đường phân cách dọc
```

### 6.3 Screen ID & Block Naming

| Loại | Pattern | Ví dụ |
|:--|:--|:--|
| Screen | `SCR-[MODULE]-[NNN]` | `SCR-MTG-001` |
| Block | `BLK-[CHỨC NĂNG]` | `BLK-HEADER`, `BLK-VIDEO-GRID` |
| Component | `CMP-[TÊN]` | `CMP-CONN-BAR`, `CMP-REC-BADGE` |

### 6.4 Mô tả màn hình — Template chuẩn

Mỗi wireframe trong files 03–06 theo cấu trúc:

```
### SCR-XXX-NNN: Tên màn hình — [Role] view

**URL:** /path/to/screen
**Actor:** [Role nhìn thấy màn hình này]
**UC liên quan:** UC-XXX-NNN
**BRD tham chiếu:** XX_File.md

#### Layout
[ASCII box hoặc Mermaid]

#### Mô tả khối
- BLK-XXX: [chức năng]

#### States
- Loading: ...
- Empty: ...
- Error: ...

#### Navigation
- Vào từ: ...
- Đi tới: ...
```
