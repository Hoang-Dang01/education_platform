# Tổng quan về User Stories & Use Cases — Zoom Education Platform

Tài liệu này cung cấp cái nhìn tổng quan về các ca sử dụng (Use Cases) và câu chuyện người dùng (User Stories) trong hệ thống **Zoom Education Platform**. Đây là cầu nối trung gian chuyển dịch từ các yêu cầu chức năng (Functional Requirements trong SRS) thành các luồng tương tác thực tế của người dùng và các kịch bản kiểm thử có thể đo lường được (testable scenarios).

---

## 1. Mục tiêu và Vai trò của Phân hệ tài liệu
Tài liệu Use Cases & User Stories giúp:
* **Định hình hành vi hệ thống (System Behavior):** Mô tả chi tiết cách người dùng (Học viên, Giáo viên, Quản trị viên) tương tác với hệ thống qua các kịch bản sử dụng thực tế.
* **Chuẩn hóa quy trình nghiệm thu (BDD Acceptance Criteria):** Đảm bảo tất cả tính năng đều có tiêu chí nghiệm thu rõ ràng theo định dạng `Given / When / Then`, làm nền tảng cho việc viết test cases của QA/QC và phát triển mã nguồn của DEV.
* **Đảm bảo tính truy vết (Traceability):** Liên kết trực tiếp các ca sử dụng và User Story với các yêu cầu chức năng [01_Functional_Requirements.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Software%20Requirement%20Specification%20(SRS)/01_Functional_Requirements.md) và các ràng buộc phi chức năng [02_Non_Functional_Requirements.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Software%20Requirement%20Specification%20(SRS)/02_Non_Functional_Requirements.md).

---

## 2. Các Tác nhân Hệ thống (Actors)
Hệ thống xoay quanh 3 tác nhân chính:
1. **Student (Học viên):** Người tham gia lớp học trực tuyến, thực hiện tương tác realtime, làm bài kiểm tra, xem lại bài giảng và tài liệu.
2. **Teacher (Giáo viên):** Người chủ trì lớp học (Host WebRTC), quản lý thành viên, kiểm soát việc ghi hình, khởi tạo breakout room, tổ chức điểm danh và chia sẻ tài liệu.
3. **Admin (Quản trị viên/Vận hành):** Quản lý tài nguyên, tài khoản, cấu hình Feature Flags, giám sát chất lượng kết nối qua luồng dữ liệu telemetry và thực hiện chẩn đoán sự cố tự động.

---

## 3. Các Ca sử dụng Cốt lõi (Core Use Cases)
Các luồng nghiệp vụ lớn được phân rã thành 6 ca sử dụng trọng tâm:
* **UC-AUTH-001: Đăng nhập & Giám sát phiên:** Xác thực danh tính người dùng và kiểm soát trạng thái hoạt động/thiết bị kết nối song song.
* **UC-MTG-001: Tham gia phòng học WebRTC:** Quy trình kết nối của Học viên và Giáo viên qua giao thức WebRTC SFU, bao gồm việc hiển thị popup cam kết ghi hình (Consent Prompt).
* **UC-MTG-002: Ghi hình buổi học:** Giáo viên kích hoạt ghi hình, hệ thống quản lý quota 10 GB, tự động transcode sang MP4 H.264 và kích hoạt vòng đời lưu trữ 180 ngày (Hot/Cold storage).
* **UC-ATT-001: Điểm danh tự động:** Điểm danh tự động dựa trên thời gian tham gia, xử lý ngắt quãng kết nối (reconnection) và sắp xếp thứ tự sự kiện server-side.
* **UC-MON-001: Giám sát Telemetry & Cảnh báo:** Hệ thống định kỳ gửi WebRTC telemetry thông qua REST API/gRPC và đẩy cảnh báo 4 mức độ chất lượng lên giao diện.
* **UC-NDX-001: Chẩn đoán sự cố:** Chẩn đoán nguyên nhân sự cố kết nối dựa trên 8 quy tắc chẩn đoán cấu hình sẵn trên máy chủ.

---

## 4. Bản đồ Điều hướng Phân hệ Tài liệu

Thư mục này bao gồm các tài liệu chi tiết sau:

1. **[01. Use Case Diagrams](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/User%20Stories%20&%20Use%20Cases/01_Use_Case_Diagrams.md)**
   * Chứa sơ đồ Use Case tổng thể và chi tiết cho từng tác nhân (Mermaid format).
   * Định nghĩa chi tiết ranh giới hệ thống (System Boundary) và trách nhiệm các bên.

2. **[02. Use Case Specifications](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/User%20Stories%20&%20Use%20Cases/02_Use_Case_Specifications.md)**
   * Đặc tả chi tiết từng Use Case trọng điểm (Tiền điều kiện, luồng xử lý chính, luồng phụ, ngoại lệ, hậu điều kiện).

3. **[03. User Stories Catalog](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/User%20Stories%20&%20Use%20Cases/03_User_Stories_Catalog.md)**
   * Danh mục toàn bộ các User Story nhỏ phân bổ theo các cấu trúc chức năng của hệ thống.
   * Tiêu chí nghiệm thu (Acceptance Criteria) viết theo định dạng BDD chuẩn.

4. **[04. Acceptance Criteria Format Standard](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/User%20Stories%20&%20Use%20Cases/04_Acceptance_Criteria_Format_Standard.md)**
   * Định nghĩa quy chuẩn và ví dụ minh họa về cấu trúc `Given / When / Then`.
