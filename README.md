# Nền tảng Đào tạo Trực tuyến (Zoom Education Platform)

Dự án xây dựng một nền tảng đào tạo trực tuyến tích hợp, phục vụ nhu cầu tổ chức và quản lý hoạt động đào tạo cho các trung tâm đào tạo, doanh nghiệp (đào tạo nội bộ) và tổ chức giáo dục trường học.

## Mục tiêu dự án
Hệ thống được thiết kế để thay thế việc sử dụng nhiều công cụ riêng lẻ (như họp trực tuyến, bảng tính quản lý, lưu trữ tài liệu, báo cáo thủ công) bằng một nền tảng tập trung duy nhất.

## Danh sách tài liệu
Các tài liệu của dự án được tổ chức và quản lý độc lập tại thư mục [Tai_Lieu/](Tai_Lieu/):

1. **[Business Requirement Document (BRD)](Tai_Lieu/Business%20Requirement%20Document%20(BRD)/README.md)**
   - Tài liệu yêu cầu nghiệp vụ dành cho Khách hàng, PM, BA, Quản lý.
   - Trả lời câu hỏi: **Hệ thống làm gì?**
   - Nội dung gồm: Mục tiêu dự án, Vai trò người dùng, các phân hệ chức năng (LMS, Học trực tuyến, Tài liệu, Điểm danh, Giám sát, Telemetry, Báo cáo) và phần Kết luận.

2. **[Technical Requirement Document (TRD)](Tai_Lieu/Technical%20Requirement%20Document%20(TRD)/README.md)**
   - Tài liệu đặc tả kỹ thuật dành cho Architects, Developers, DevOps.
   - Trả lời câu hỏi: **Hệ thống hoạt động thế nào?**
   - Nội dung gồm: Kiến trúc hệ thống đề xuất, Kiến trúc tổng thể, Kế hoạch triển khai và Đánh giá độ phức tạp.

3. **[Solution Architecture Document (SAD)](Tai_Lieu/Solution%20Architecture%20Document%20(SAD)/README.md)**
   - Tài liệu kiến trúc giải pháp dành cho Architects, Tech Leads, Developers.
   - Trả lời câu hỏi: **Hệ thống được thiết kế như thế nào?**
   - Nội dung gồm: Giới thiệu tổng quan, Kiến trúc tổng thể (High-Level), Kiến trúc miền (Domain), Kiến trúc dịch vụ (Service), Luồng dữ liệu (Data Flow), Công nghệ lựa chọn (Tech Stack), Chiến lược mở rộng (Scalability), Kiến trúc bảo mật (Security), Mô hình triển khai (Deployment) và Phụ lục (ADR).

---
Chi tiết cấu trúc cây thư mục của toàn bộ dự án có thể tham khảo tại file [Cau_Truc_Thu_Muc.md](Cau_Truc_Thu_Muc.md).

## Triển khai bằng Docker (Docker Deployment)

Để xây dựng và chạy thử nghiệm container frontend dưới máy local hoặc deploy lên môi trường staging:

1. **Xây dựng Docker image (Build Image)**:
   Chạy lệnh sau từ thư mục gốc của dự án:
   ```bash
   docker build -t education-platform-frontend -f app/Dockerfile ./app
   ```

2. **Chạy Container (Run Container)**:
   Chạy lệnh sau để khởi chạy ứng dụng trên cổng `8080`:
   ```bash
   docker run -d -p 8080:80 --name edu-frontend education-platform-frontend
   ```

3. **Kiểm tra (Verify)**:
   Truy cập [http://localhost:8080](http://localhost:8080) bằng trình duyệt để kiểm tra hoạt động.

4. **Dừng và xóa container (Clean up)**:
   ```bash
   docker rm -f edu-frontend
   ```

