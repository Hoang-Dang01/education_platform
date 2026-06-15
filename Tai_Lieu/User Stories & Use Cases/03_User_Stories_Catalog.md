# 03. User Stories Catalog (Danh mục User Stories)

Tài liệu này chứa danh mục toàn bộ User Stories của dự án **Zoom Education Platform**, được phân loại theo phân hệ chức năng tương ứng trong SRS, kèm theo tiêu chí nghiệm thu (Acceptance Criteria) viết theo định dạng hành vi (Behavior-Driven Development - BDD) `Given / When / Then`.

---

## Mẫu định dạng User Story
```text
### US-[MÃ]-XXX: [Tiêu đề ngắn]
- **As a** [Tác nhân]
- **I want to** [Hành động / Tính năng]
- **So that** [Lợi ích mang lại / Giá trị nghiệp vụ]

#### Tiêu chí nghiệm thu (Acceptance Criteria - AC):
Scenario: [Tên kịch bản kiểm thử]
  Given [Bối cảnh / Trạng thái hệ thống ban đầu]
  When [Người dùng thực hiện hành động]
  Then [Kết quả trả về / Hành vi mong đợi từ hệ thống]
```

---

## 3.1. Phân hệ Xác thực & Quản lý Phiên (US-AUTH)
*(Bao gồm đăng nhập, đăng xuất, theo dõi phiên, thu hồi quyền của học viên)*

### US-AUTH-001: Đăng nhập hệ thống
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

### US-AUTH-002: Đăng xuất và thu hồi session
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

---

## 3.2. Phân hệ Học Trực Tuyến & Ghi Hình (US-MTG)
*(Bao gồm tham gia phòng học WebRTC, xin ý kiến chấp thuận ghi hình, bắt đầu ghi hình, giới hạn dung lượng lưu trữ bản ghi, transcoding và xóa sau 180 ngày)*

### US-MTG-001: Yêu cầu chấp thuận ghi hình khi tham gia phòng học
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

### US-MTG-002: Ghi hình và Quản lý vòng đời lưu trữ
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

---

## 3.3. Phân hệ Điểm Danh Tự Động (US-ATT)
*(Bao gồm điểm danh tự động dựa trên thời gian tham gia, xử lý ngắt kết nối/reconnect, sắp xếp thứ tự sự kiện server-side)*

### US-ATT-001: Điểm danh tự động theo thời lượng thực tế
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

---

## 3.4. Phân hệ Quản Lý Tài Liệu (US-DOC)
*(Bao gồm upload tài liệu, tạo Presigned URL giới hạn thời gian $\le$ 15 phút, bảo mật định dạng file)*

### US-DOC-001: Sinh URL tải tài liệu bảo mật giới hạn thời gian
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

---

## 3.5. Phân hệ Giám Sát Telemetry & Cảnh Báo (US-MON)
*(Bao gồm thu thập metric WebRTC, đẩy cảnh báo 4 mức độ lên giao diện, cấm SignalR cho telemetry)*

### US-MON-001: Hiển thị cảnh báo chất lượng kết nối trên giao diện
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

---

## 3.6. Phân hệ Chẩn Đoán Sự Cố Tự Động (US-NDX)
*(Bao gồm chạy 8 quy tắc chẩn đoán tự động trên server và xuất kết quả)*

### US-NDX-001: Tự động chẩn đoán nguyên nhân sự cố mạng
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

---

## 3.7. Phân hệ Trung Tâm Thông Báo (US-NTF)
*(Bao gồm gửi thông báo đa kênh, lọc trùng lặp tin nhắn)*

### US-NTF-001: Lọc trùng lặp thông báo đẩy realtime
- **As a** 
- **I want to** 
- **So that** 
- **AC:**

---

## 3.8. Phân hệ Báo Cáo & Xuất Dữ Liệu (US-REP)
*(Bao gồm tạo và xuất báo cáo điểm danh, chất lượng lớp học)*

### US-REP-001: Xuất báo cáo điểm danh lớp học
- **As a** 
- **I want to** 
- **So that** 
- **AC:**
