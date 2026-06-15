# 1. Kiến trúc hệ thống đề xuất (Proposed System Architecture)
1.1. Mục tiêu
Hệ thống được thiết kế theo kiến trúc phân tầng (Layered Architecture) kết hợp với các dịch vụ chuyên biệt nhằm đảm bảo:
Khả năng mở rộng.
Khả năng chịu tải cao.
Hỗ trợ thời gian thực (Real-Time).
Dễ dàng bảo trì và phát triển.
Đáp ứng số lượng lớn lớp học trực tuyến đồng thời.

1.2. Kiến trúc tổng thể
Hệ thống bao gồm các thành phần chính:
Client Applications
        │
        ▼
Frontend (Web)
        │
        ▼
Backend API Gateway
        │
 ┌──────┼─────────┬─────────┐
 ▼      ▼         ▼         ▼


LMS   Meeting   Analytics  Reporting
Service Service Service    Service


        │
        ▼


Media Layer (LiveKit)


        │
        ▼


Storage Layer
(PostgreSQL, Redis, MinIO)


        │
        ▼


Observability Layer
(Prometheus, Grafana)


1.3. Frontend Layer
Công nghệ
React
TypeScript
Tailwind CSS
LiveKit Client SDK
Vai trò
Cung cấp giao diện cho:
Admin
Manager
Teacher
Student
Chức năng
Quản lý khóa học.
Quản lý lớp học.
Tham gia học trực tuyến.
Giám sát lớp học.
Xem báo cáo.
Quản lý tài liệu.

1.4. Backend Layer
Công nghệ
Node.js
NestJS
Vai trò
Là tầng xử lý nghiệp vụ trung tâm của hệ thống.
Chức năng
Authentication.
Authorization.
LMS Management.
Attendance Management.
Reporting.
Telemetry Processing.
Notification Services.
Backend cung cấp toàn bộ API phục vụ Frontend và Mobile App trong tương lai.

1.5. Database Layer
PostgreSQL
Lưu trữ dữ liệu nghiệp vụ:
Người dùng.
Khóa học.
Lớp học.
Lịch học.
Điểm danh.
Báo cáo.
Vai trò
Là nguồn dữ liệu chính của toàn hệ thống.

1.6. Cache Layer
Redis
Vai trò
Lưu trữ dữ liệu tạm thời nhằm tăng tốc độ xử lý.
Ứng dụng
Session Management.
Cache dữ liệu.
Presence Tracking.
Realtime State.

1.7. Media Layer
Công nghệ
LiveKit Cluster
Vai trò
Xử lý toàn bộ luồng:
Audio.
Video.
Screen Sharing.
Recording.
Chức năng
Quản lý phòng học.
Media Routing.
WebRTC Signaling.
Recording.
Participant Management.
Đây là thành phần quan trọng nhất của hệ thống học trực tuyến.

1.8. Storage Layer
Object Storage
Công nghệ đề xuất:
MinIO
Amazon S3
Vai trò
Lưu trữ:
Video ghi hình.
Tài liệu đào tạo.
Hình ảnh.
File đính kèm.
Lợi ích
Khả năng mở rộng cao.
Chi phí lưu trữ thấp.
Hỗ trợ dữ liệu dung lượng lớn.

1.9. Analytics Layer
Công nghệ
ClickHouse
Vai trò
Lưu trữ và phân tích dữ liệu Telemetry.
Dữ liệu xử lý
Latency.
Packet Loss.
Jitter.
RTT.
FPS.
Bitrate.
Mục đích
Hỗ trợ:
Dashboard Realtime.
Monitoring.
Diagnostics.
Reporting.

1.10. Message Queue Layer
Công nghệ
Kafka
Vai trò
Truyền tải sự kiện giữa các thành phần trong hệ thống.
Ví dụ sự kiện
User Joined Meeting.
User Left Meeting.
Attendance Event.
Telemetry Event.
Recording Event.
Lợi ích
Tách biệt các dịch vụ.
Hỗ trợ xử lý bất đồng bộ.
Dễ mở rộng quy mô hệ thống.

1.11. Monitoring & Observability
Prometheus
Thu thập số liệu vận hành hệ thống.
Grafana
Hiển thị Dashboard giám sát.
Theo dõi
CPU.
RAM.
Network.
Database.
LiveKit.
Kafka.
API Services.
Mục tiêu
Đảm bảo hệ thống hoạt động ổn định và phát hiện sớm các sự cố hạ tầng.

1.12. Khả năng mở rộng
Kiến trúc được thiết kế để hỗ trợ:
Hàng nghìn người dùng đồng thời.
Nhiều lớp học diễn ra cùng lúc.
Mở rộng theo chiều ngang (Horizontal Scaling).
Triển khai trên môi trường Cloud hoặc On-Premise.
Các thành phần có thể mở rộng độc lập tùy theo tải thực tế của hệ thống.

1.13. Kết luận
Kiến trúc đề xuất sử dụng mô hình dịch vụ chuyên biệt kết hợp với nền tảng WebRTC hiện đại nhằm đáp ứng đồng thời các yêu cầu:
Đào tạo trực tuyến.
Điểm danh tự động.
Giám sát thời gian thực.
Phân tích chất lượng kết nối.
Báo cáo và thống kê.
Đồng thời đảm bảo khả năng mở rộng và vận hành ổn định cho các tổ chức đào tạo có quy mô lớn.


