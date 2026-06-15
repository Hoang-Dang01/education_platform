# 6. Technology Stack
6.1. Mục tiêu
Technology Stack xác định các công nghệ được sử dụng để xây dựng hệ thống và giải thích lý do lựa chọn từng thành phần.
Nguyên tắc lựa chọn công nghệ:
Hỗ trợ khả năng mở rộng.
Hỗ trợ xử lý thời gian thực.
Phù hợp với kiến trúc Cloud-Native.
Có cộng đồng lớn và ổn định.
Dễ dàng triển khai và vận hành.

6.2. Tổng quan công nghệ
Layer
Technology
Frontend
React + TypeScript
UI Framework
Tailwind CSS
Realtime SDK
LiveKit SDK
Backend
Node.js + NestJS
Database
PostgreSQL
Cache
Redis
Message Queue
Kafka
Media Server
LiveKit
Analytics Database
ClickHouse
Object Storage
MinIO / Amazon S3
Monitoring
Prometheus + Grafana
Containerization
Docker
Orchestration
Kubernetes


6.3. Frontend Layer
React
React được sử dụng để xây dựng giao diện người dùng.
Lý do lựa chọn
Phổ biến.
Hệ sinh thái lớn.
Dễ mở rộng.
Hỗ trợ SPA (Single Page Application).
Tích hợp tốt với WebRTC.

TypeScript
TypeScript được sử dụng cho toàn bộ Frontend.
Lý do lựa chọn
Kiểm tra kiểu dữ liệu.
Giảm lỗi runtime.
Dễ bảo trì.
Phù hợp với dự án lớn.

Tailwind CSS
Framework CSS phục vụ xây dựng giao diện.
Lý do lựa chọn
Phát triển nhanh.
Dễ tùy chỉnh.
Hiệu năng tốt.
Hạn chế CSS dư thừa.

LiveKit Client SDK
SDK hỗ trợ kết nối đến Media Server.
Chức năng
Camera.
Micro.
Screen Share.
Chat.
Realtime Events.

6.4. Backend Layer
Node.js
Nền tảng thực thi Backend.
Lý do lựa chọn
Xử lý I/O hiệu quả.
Phù hợp hệ thống Realtime.
Hệ sinh thái mạnh.
Tích hợp tốt với WebSocket và WebRTC.

NestJS
Framework Backend chính.
Lý do lựa chọn
Kiến trúc Module rõ ràng.
Hỗ trợ Dependency Injection.
Hỗ trợ Microservice.
Dễ mở rộng.
Dễ kiểm thử.

Vai trò Backend
Backend chịu trách nhiệm:
Authentication.
Authorization.
Business Logic.
API Management.
Event Publishing.

6.5. Database Layer
PostgreSQL
Database nghiệp vụ chính.
Lý do lựa chọn
ACID Compliance.
Độ ổn định cao.
Hỗ trợ Transaction.
Phù hợp dữ liệu quan hệ.

Dữ liệu lưu trữ
Users
Courses
Classes
Schedules
Enrollments
Meetings
Attendance
Files Metadata
Recordings Metadata


6.6. Cache Layer
Redis
Sử dụng cho dữ liệu truy cập thường xuyên.
Vai trò
Session Cache.
Token Cache.
Dashboard Cache.
Realtime State.

Lợi ích
Giảm tải Database.
Tăng tốc phản hồi API.
Hỗ trợ dữ liệu thời gian thực.

6.7. Realtime Communication Layer
LiveKit
LiveKit là nền tảng Media Server trung tâm của hệ thống.

Chức năng
Audio Conference
Truyền âm thanh thời gian thực.
Video Conference
Truyền hình ảnh thời gian thực.
Screen Sharing
Chia sẻ màn hình.
Participant Management
Quản lý người tham gia.
Recording
Ghi hình phiên học.

Lý do lựa chọn
So với tự xây dựng WebRTC SFU
Giảm đáng kể:
Thời gian phát triển.
Rủi ro kỹ thuật.
Chi phí vận hành.
So với Zoom SDK
Cho phép:
Toàn quyền dữ liệu.
Triển khai On-Premise.
Tùy chỉnh sâu.

6.8. Event Streaming Layer
Kafka
Kafka đóng vai trò Event Bus của hệ thống.

Dữ liệu truyền tải
Attendance Events
JOIN
LEAVE
DISCONNECT
RECONNECT

Meeting Events
ROOM_STARTED
ROOM_ENDED

Telemetry Events
Latency
Packet Loss
Jitter
RTT
FPS
Bitrate


Lý do lựa chọn
Throughput cao.
Hỗ trợ Realtime Analytics.
Dễ mở rộng.
Phù hợp Event-Driven Architecture.

6.9. Analytics Layer
ClickHouse
Cơ sở dữ liệu phân tích chính.

Dữ liệu lưu trữ
Telemetry
Latency
Jitter
Packet Loss
RTT
Analytics
Meeting Statistics
Attendance Statistics
Connection Quality

Lý do lựa chọn
Ưu điểm
Tối ưu dữ liệu dạng Time-Series.
Truy vấn cực nhanh.
Phù hợp Dashboard thời gian thực.
Hỗ trợ hàng tỷ bản ghi.

Vai trò
Cung cấp dữ liệu cho:
Monitoring Dashboard.
Reporting Engine.
Diagnostics Engine.

6.10. Object Storage Layer
MinIO
Giải pháp Object Storage triển khai nội bộ.

Amazon S3
Giải pháp Object Storage trên Cloud.

Dữ liệu lưu trữ
Tài liệu
PDF
DOCX
XLSX
PPTX
Recording
Video bài giảng
Recording Metadata

Lý do lựa chọn
Chi phí thấp.
Dễ mở rộng.
Tương thích chuẩn S3.

6.11. Monitoring Layer
Prometheus
Thu thập Metrics hệ thống.

Metrics
Infrastructure
CPU
RAM
Disk
Network
Application
API Response Time
Error Rate
Request Count
LiveKit
Room Count
Participant Count
Bitrate

Grafana
Dashboard giám sát vận hành.

Vai trò
Monitoring.
Alerting.
Capacity Planning.

6.12. Container Platform
Docker
Đóng gói toàn bộ dịch vụ.
Lợi ích
Môi trường đồng nhất.
Dễ triển khai.
Dễ bảo trì.

Kubernetes
Nền tảng điều phối container.
Chức năng
Auto Scaling.
Load Balancing.
Self Healing.
Rolling Update.

6.13. Công nghệ theo Domain
LMS Domain
NestJS
PostgreSQL
Redis


Meeting Domain
NestJS
LiveKit
MinIO


Analytics Domain
Kafka
ClickHouse
Prometheus
Grafana


6.14. Technology Decision Summary
Thành phần
Công nghệ
Lý do
Frontend
React
SPA, cộng đồng lớn
Backend
NestJS
Modular, dễ mở rộng
Database
PostgreSQL
Ổn định, ACID
Cache
Redis
Hiệu năng cao
Media Server
LiveKit
Tối ưu WebRTC
Event Bus
Kafka
Realtime Processing
Analytics DB
ClickHouse
Truy vấn cực nhanh
Storage
MinIO/S3
Lưu file lớn
Monitoring
Prometheus + Grafana
Quan sát hệ thống
Container
Docker + Kubernetes
Cloud-Native


6.15. Kết luận
Technology Stack được lựa chọn nhằm đáp ứng các yêu cầu về hiệu năng, khả năng mở rộng, tính ổn định và xử lý thời gian thực của nền tảng đào tạo trực tuyến.
Kiến trúc công nghệ này cho phép hệ thống phát triển từ quy mô nhỏ đến quy mô lớn mà không cần thay đổi nền tảng cốt lõi, đồng thời tạo điều kiện thuận lợi cho việc triển khai các tính năng Analytics và Monitoring nâng cao trong tương lai.