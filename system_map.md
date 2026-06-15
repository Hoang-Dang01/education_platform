# Bản đồ kiến trúc hệ thống (System Architecture Map)

> **Hướng dẫn dành cho AI (AI Instructions):** 
> Trước khi thực hiện bất kỳ nhiệm vụ phân tích, thiết kế hoặc sửa đổi nào trong dự án **Zoom Education Platform**, hãy đọc tệp này để hiểu nhanh bối cảnh kiến trúc, các quy tắc hệ thống, cơ sở dữ liệu và danh mục tài liệu liên quan mà không cần đọc lại toàn bộ mã nguồn hoặc tài liệu chi tiết.

---

## 1. Bản đồ Tài liệu & Cấu trúc Thư mục (Directory Map)
Chi tiết cấu trúc cây thư mục đầy đủ nằm tại [Cau_Truc_Thu_Muc.md](file:///c:/Git%20cua%20tui/education-platform/Cau_Truc_Thu_Muc.md). Dưới đây là các tài liệu then chốt (Entry Points):

* **Yêu cầu Nghiệp vụ (BRD):** [Tai_Lieu/Business Requirement Document (BRD)/](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Business%20Requirement%20Document%20(BRD))
  * Đặc tả nghiệp vụ của 9 phân hệ cốt lõi (LMS, Học trực tuyến, Điểm danh, Telemetry, Giám sát, Chẩn đoán...).
* **Yêu cầu Chức năng & Ràng buộc (SRS):** [01_Functional_Requirements.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Software%20Requirement%20Specification%20(SRS)/01_Functional_Requirements.md)
  * Chứa danh sách 61 Functional Requirements chuẩn hóa theo ID dạng `FR-[MODULE]-[NNN]`.
* **Kiến trúc Giải pháp (SAD):** [Tai_Lieu/Solution Architecture Document (SAD)/](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Solution%20Architecture%20Document%20(SAD))
  * Đặc tả High-level, Service Domain, Data Flow, Tech Stack và Bảo mật.
* **Thiết kế Kỹ thuật Chi tiết (TDD):** [Tai_Lieu/Technical Design Document (TDD)/](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Technical%20Design%20Document%20(TDD))
  * Mục lục truy vết: [00-document-index.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Technical%20Design%20Document%20(TDD)/00-document-index.md).
  * Thiết kế DB vật lý: [07-database-design.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Technical%20Design%20Document%20(TDD)/07-database-design.md).
  * Phân quyền & Sessions: [11-security-design.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Technical%20Design%20Document%20(TDD)/11-security-design.md).
  * Ma trận Truy vết Yêu cầu (RTM): [14-traceability-matrix.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Technical%20Design%20Document%20(TDD)/14-traceability-matrix.md).
* **Quy trình & Khung Giao diện (Workflows & Wireframes):** [Tai_Lieu/Design & Process Workflows/](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows)
  * Sơ đồ luồng BPMN: [01_BPMN_Workflows.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/01_BPMN_Workflows.md).
  * Quy chuẩn giao diện (Màu sắc, Font, Grid, ASCII): [02_Wireframes_Mockups.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/02_Wireframes_Mockups.md).
* **Mô hình & Di trú Dữ liệu (Data Mapping):** [Tai_Lieu/Data Mapping/](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Data%20Mapping)
  * Sơ đồ thực thể ERD: [02_Data_Model_ERD.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Data%20Mapping/02_Data_Model_ERD.md).
  * Chiến lược ETL & Rollback: [03_Data_Migration_Strategy.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Data%20Mapping/03_Data_Migration_Strategy.md).

---

## 2. Các Quy tắc Nghiệp vụ Cốt lõi (Core Business Rules)

### 2.1. Hệ thống Màu sắc & Ngưỡng Telemetry Mạng (4 Mức):
Quy định hiển thị trạng thái kết nối WebRTC (Latency, Packet Loss, Jitter) đồng bộ từ backend telemetry tới UI wireframe:
* **Mức 1 — Excellent (Xanh lá - `#22C55E`):** Packet Loss < 2%, Latency < 150ms, Jitter < 15ms.
* **Mức 2 — Good (Xanh dương - `#3B82F6`):** Chạm ngưỡng warning nhẹ trên 1 chỉ số.
* **Mức 3 — Poor (Cam - `#F97316`):** Packet Loss 2-5% hoặc Latency 150-300ms.
* **Mức 4 — Critical (Đỏ - `#EF4444`):** Packet Loss > 5% hoặc Latency > 300ms.
* *Chi tiết quy chuẩn:* [02_Wireframes_Mockups.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/02_Wireframes_Mockups.md#L30-L46).

### 2.2. Quy tắc Gộp và Triệt tiêu Thông báo (Notification Rules):
Ngăn ngừa spam thông báo cho người dùng (Xem [01_Functional_Requirements.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Software%20Requirement%20Specification%20(SRS)/01_Functional_Requirements.md#L1403-L1405)):
* **Gộp thông báo (Lịch học):** Nếu cập nhật lịch học liên tục nhiều lần cho cùng một buổi học trong vòng **2 phút**, hệ thống chỉ gửi đi 1 thông báo duy nhất chứa thông tin mới nhất.
* **Triệt tiêu cảnh báo mạng:** Cảnh báo chất lượng mạng có cùng nội dung cho học viên sẽ bị triệt tiêu trong vòng **3 phút** kể từ lần gửi đầu tiên, thay vào đó chỉ tăng biến đếm `repeat_count` trên giao diện giám sát của Admin.

### 2.3. Quy trình Điểm danh Tự động & Ngắt kết nối (Attendance Logic):
* **Tính tỷ lệ điểm danh:** `Tỷ lệ = tổng thời gian có mặt thực tế / tổng thời lượng buổi học`.
* **Trễ / Reconnect:** Nếu học viên mất kết nối đột ngột nhưng kết nối lại (reconnect) thành công trong vòng **30 giây**, khoảng thời gian mất kết nối này vẫn được tính là có mặt liên tục (không ngắt quãng).
* *Chi tiết sơ đồ luồng:* [01_BPMN_Workflows.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/01_BPMN_Workflows.md#L68-L94).

---

## 3. Sơ đồ Thực thể Cơ sở Dữ liệu rút gọn (Database Schema Overview)
Hệ thống sử dụng cơ sở dữ liệu phân tán (Database per Service). Dưới đây là 17 bảng dữ liệu cốt lõi đã được ánh xạ hoàn chỉnh tại [02_Data_Model_ERD.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Data%20Mapping/02_Data_Model_ERD.md):

* **Auth & User Service:**
  * `users` (Thông tin tài khoản, trạng thái).
  * `roles`, `permissions`, `user_roles` (Bảng phân quyền người dùng RBAC).
  * `sessions` (Phiên đăng nhập đa thiết bị).
  * `audit_logs` (Nhật ký hành động nghiệp vụ nhạy cảm).
* **LMS & Document Service:**
  * `courses` (Danh mục khóa học).
  * `classes` (Thông tin các lớp học thực tế).
  * `enrollments` (Bảng phân bổ Học viên/Giáo viên vào lớp học).
  * `materials` (Bài giảng, tài liệu đính kèm lớp học).
* **Meeting & Attendance Service:**
  * `meetings` (Phòng học trực tuyến WebRTC).
  * `participants` (Lịch sử kết nối của các thành viên trong phòng).
  * `attendance_sessions` (Phiên điểm danh tự động của buổi học).
  * `attendance_records` (Kết quả điểm danh, thời lượng có mặt của từng học viên).
* **Analytics, Diagnostics & Media Service:**
  * `connection_metrics` (Telemetry đo đạc latency/packet loss mỗi 5 giây).
  * `alerts` (Cảnh báo kết nối kém kích hoạt tự động).
  * `incident_logs` (Nhật ký chẩn đoán sự cố của Rule Engine kèm giải pháp gợi ý).
  * `recordings` (Đường dẫn lưu trữ file video ghi hình buổi học).
  * `notifications` (Thông báo gửi cho người dùng).
