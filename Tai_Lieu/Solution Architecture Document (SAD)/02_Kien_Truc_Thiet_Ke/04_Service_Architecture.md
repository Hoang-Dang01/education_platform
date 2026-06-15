# 4. Service Architecture
4.1. Tổng quan
Service Architecture mô tả các dịch vụ chính trong hệ thống, trách nhiệm của từng dịch vụ và cách các dịch vụ phối hợp với nhau để cung cấp chức năng cho toàn bộ nền tảng.
Các dịch vụ được tổ chức theo ba Domain chính:
LMS Domain
├── User Service
├── Course Service
├── Class Service
└── File Service

Meeting Domain
├── Meeting Service
└── Recording Service

Analytics Domain
├── Attendance Engine
├── Telemetry Collector
├── Analytics Engine
├── Diagnostics Engine
└── Reporting Engine

Tất cả dịch vụ được truy cập thông qua API Gateway.

4.2. API Gateway
Mục tiêu
API Gateway là điểm truy cập trung tâm của toàn bộ hệ thống.
Tất cả yêu cầu từ Frontend đều được gửi đến API Gateway trước khi được chuyển tiếp tới các dịch vụ tương ứng.

Trách nhiệm
Authentication
Xác thực người dùng thông qua JWT.
Authorization
Kiểm tra quyền truy cập dựa trên vai trò:
Admin
Manager
Teacher
Student
Request Routing
Định tuyến request đến đúng Service.
Rate Limiting
Giới hạn số lượng request nhằm bảo vệ hệ thống.
Logging
Ghi nhận thông tin request và response phục vụ giám sát hệ thống.

4.3. User Service
Mục tiêu
Quản lý toàn bộ thông tin người dùng trong hệ thống.

Chức năng
Quản lý tài khoản
Tạo tài khoản
Cập nhật tài khoản
Khóa tài khoản
Xóa tài khoản
Quản lý vai trò
Admin
Manager
Teacher
Student
Hồ sơ người dùng
Họ tên
Email
Số điện thoại
Trạng thái hoạt động

Dữ liệu chính
User
Role
Permission


4.4. Course Service
Mục tiêu
Quản lý toàn bộ khóa học trong hệ thống.

Chức năng
Quản lý khóa học
Tạo khóa học
Cập nhật khóa học
Xóa khóa học
Quản lý trạng thái
Draft
Active
Completed
Archived

Dữ liệu chính
Course
Course Category
Course Metadata


4.5. Class Service
Mục tiêu
Quản lý lớp học thuộc các khóa đào tạo.

Chức năng
Quản lý lớp học
Tạo lớp học
Chỉnh sửa lớp học
Hủy lớp học
Quản lý học viên
Thêm học viên
Xóa học viên
Chuyển lớp
Quản lý lịch học
Tạo lịch học
Cập nhật lịch học
Hủy lịch học

Dữ liệu chính
Class
Class Schedule
Enrollment


4.6. File Service
Mục tiêu
Quản lý tài liệu và dữ liệu phi cấu trúc của hệ thống.

Chức năng
Upload
Hỗ trợ:
PDF
DOCX
XLSX
PPTX
JPG
PNG
MP4
Download
Cho phép tải tài liệu theo phân quyền.
File Permission
Quản lý quyền truy cập tài liệu.

Tích hợp
Lưu trữ trên:
MinIO
Amazon S3

Dữ liệu chính
File
Folder
File Permission


4.7. Meeting Service
Mục tiêu
Điều phối toàn bộ hoạt động học trực tuyến.

Chức năng
Room Management
Tạo phòng học
Đóng phòng học
Quản lý trạng thái phòng
Participant Management
Tham gia lớp học
Rời lớp học
Danh sách người tham gia
Token Generation
Sinh LiveKit Token cho người dùng.
Event Publishing
Phát sinh sự kiện:
JOIN
LEAVE
ROOM_STARTED
ROOM_ENDED

Tích hợp
LiveKit Cluster
Kafka
Attendance Engine

4.8. Recording Service
Mục tiêu
Quản lý ghi hình và lưu trữ bài giảng.

Chức năng
Recording Control
Bắt đầu ghi hình
Dừng ghi hình
Recording Storage
Upload recording
Lưu metadata
Playback
Xem lại bài giảng

Tích hợp
LiveKit Egress
MinIO
Amazon S3

Dữ liệu chính
Recording
Recording File
Recording Metadata


4.9. Attendance Engine
Mục tiêu
Tự động tính toán điểm danh và thời gian học thực tế.

Nguồn dữ liệu
Nhận sự kiện từ:
Meeting Service
LiveKit Webhook
Kafka

Sự kiện xử lý
JOIN
LEAVE
DISCONNECT
RECONNECT


Kết quả xử lý
Attendance Time
Tổng thời gian tham gia thực tế.
Attendance Percentage
Tỷ lệ tham gia lớp học.
Attendance Status
Present
Absent
Late
Incomplete

Dữ liệu chính
Attendance Log
Attendance Summary


4.10. Telemetry Collector
Mục tiêu
Thu thập dữ liệu chất lượng kết nối theo thời gian thực.

Nguồn dữ liệu
Browser
WebRTC Statistics API
LiveKit
Server Metrics
Infrastructure
System Metrics

Chỉ số thu thập
Network
Latency
RTT
Packet Loss
Jitter
Video
FPS
Resolution
Bitrate
Audio
Audio Bitrate
Audio Packet Loss

Đầu ra
Phát sự kiện Telemetry vào Kafka.

4.11. Analytics Engine
Mục tiêu
Xử lý và tổng hợp dữ liệu Telemetry.

Chức năng
Aggregation
Tổng hợp dữ liệu theo:
User
Meeting
Class
Course
Real-Time Processing
Tính toán dữ liệu Dashboard.
Historical Processing
Tạo dữ liệu báo cáo dài hạn.

Lưu trữ
ClickHouse

Dữ liệu chính
Telemetry Metrics
Aggregated Metrics


4.12. Diagnostics Engine
Mục tiêu
Phân tích nguyên nhân sự cố kết nối.

Chức năng
Host Diagnosis
Xác định lỗi từ phía Host.
Participant Diagnosis
Xác định lỗi từ phía người tham gia.
Infrastructure Diagnosis
Xác định lỗi từ phía hạ tầng.
Root Cause Analysis
Khoanh vùng nguyên nhân sự cố.

Đầu ra
Alert
Cảnh báo thời gian thực.
Diagnosis Result
Kết quả phân tích nguyên nhân.

Dữ liệu chính
Alert
Diagnosis Result
Incident


4.13. Reporting Engine
Mục tiêu
Tổng hợp dữ liệu phục vụ báo cáo và thống kê.

Nguồn dữ liệu
LMS Domain
Attendance Engine
Analytics Engine
Diagnostics Engine

Chức năng
Student Report
Thời gian học
Tỷ lệ tham gia
Điểm danh
Class Report
Chất lượng lớp học
Thời lượng lớp
Tỷ lệ hoàn thành
Operational Report
Hiệu suất hệ thống
Sự cố vận hành

Định dạng xuất
Excel
CSV
PDF

4.14. Service Interaction
Frontend
    │
    ▼

API Gateway

    │
 ┌──┼───────────────────────┐
 │  │                       │
 ▼  ▼                       ▼

LMS Services       Meeting Service

                           │
                           ▼

                    LiveKit Cluster

                           │
                           ▼

                    Telemetry Collector

                           │
                           ▼

                         Kafka

                           │
                           ▼

       Attendance / Analytics / Diagnostics

                           │
                           ▼

                     Reporting Engine


4.15. Kết luận
Kiến trúc Service được thiết kế theo hướng phân tách rõ ràng trách nhiệm giữa các dịch vụ, cho phép mở rộng độc lập và giảm sự phụ thuộc giữa các thành phần.
Mô hình này tạo nền tảng cho việc triển khai hệ thống đào tạo trực tuyến quy mô lớn với khả năng giám sát và phân tích dữ liệu thời gian thực.
