# 8. Security Architecture
8.1. Mục tiêu
Security Architecture mô tả các cơ chế bảo mật được áp dụng nhằm bảo vệ dữ liệu, người dùng và hạ tầng của hệ thống.
Mục tiêu bảo mật bao gồm:
Bảo vệ tài khoản người dùng.
Kiểm soát quyền truy cập.
Bảo vệ dữ liệu đào tạo.
Bảo vệ dữ liệu cuộc họp trực tuyến.
Bảo vệ dữ liệu ghi hình và tài liệu.
Đảm bảo khả năng truy vết và kiểm toán.
Đảm bảo tính sẵn sàng của hệ thống.

8.2. Nguyên tắc bảo mật
Kiến trúc bảo mật được xây dựng dựa trên các nguyên tắc:
Authentication First
Mọi người dùng phải được xác thực trước khi truy cập hệ thống.

Least Privilege
Người dùng chỉ được cấp quyền tối thiểu cần thiết cho công việc của mình.

Secure By Default
Mọi thành phần đều được cấu hình theo hướng bảo mật ngay từ đầu.

Defense In Depth
Áp dụng nhiều lớp bảo vệ thay vì phụ thuộc vào một cơ chế duy nhất.

Auditability
Mọi hành động quan trọng đều phải được ghi nhận và truy vết.

8.3. Authentication Architecture
Mục tiêu
Xác minh danh tính người dùng trước khi cho phép truy cập hệ thống.

Cơ chế xác thực
Email & Password
Người dùng đăng nhập bằng:
Email
Mật khẩu

JWT Authentication
Sau khi đăng nhập thành công:
User Login

↓

Auth Service

↓

JWT Access Token

↓

Frontend

Token được gửi kèm trong mọi API Request.

Token Strategy
Access Token
Dùng cho:
API Access
Session Validation
Thời gian sống ngắn.

Refresh Token
Dùng để:
Cấp lại Access Token
Giảm nguy cơ mất an toàn khi Token bị lộ.

8.4. Authorization Architecture
Mục tiêu
Kiểm soát quyền truy cập tài nguyên.

RBAC (Role-Based Access Control)
Hệ thống sử dụng mô hình phân quyền theo vai trò.

Admin
Toàn quyền hệ thống.
Có thể:
Quản lý người dùng.
Quản lý lớp học.
Giám sát toàn hệ thống.
Xuất báo cáo.

Manager
Có thể:
Quản lý đào tạo.
Theo dõi lớp học.
Xem báo cáo.

Teacher
Có thể:
Tạo lớp học.
Điều hành lớp học.
Ghi hình.
Điểm danh.

Student
Có thể:
Tham gia lớp học.
Xem tài liệu.
Chat.
Chia sẻ Audio và Video.

Authorization Flow
Request

↓

JWT Validation

↓

Role Validation

↓

Permission Validation

↓

Business Logic


8.5. API Security
HTTPS
Toàn bộ API bắt buộc sử dụng HTTPS.

TLS Encryption
Mọi dữ liệu truyền tải được mã hóa bằng TLS.

Rate Limiting
Giới hạn số lượng request nhằm:
Chống Spam.
Chống Brute Force.
Giảm tải hệ thống.

API Validation
Kiểm tra:
Input Validation
Data Sanitization
Schema Validation
Ngăn chặn:
SQL Injection
XSS
Invalid Payload

8.6. Meeting Security
Mục tiêu
Đảm bảo chỉ người được cấp quyền mới có thể tham gia lớp học.

Meeting Access Control
Mỗi người dùng phải có:
Meeting Token

được tạo bởi Meeting Service.

LiveKit Token
Token bao gồm:
User ID
Room ID
Role
Expiration Time

Room Permission
Giới hạn quyền:
Teacher
Publish Audio
Publish Video
Screen Share
Recording Control

Student
Publish Audio
Publish Video
Không được:
Điều khiển Recording
Quản trị Room

8.7. File Security
Mục tiêu
Bảo vệ tài liệu đào tạo và Recording.

Storage Security
Dữ liệu được lưu trên:
MinIO
Amazon S3

Access Control
Mỗi File được gán:
Owner
Permission
Visibility


Signed URL
Khi tải File:
User

↓

Backend

↓

Temporary URL

↓

Download

URL có thời hạn sử dụng ngắn.

Lợi ích
Không lộ Storage trực tiếp.
Tăng cường bảo mật.

8.8. Data Security
Dữ liệu nghiệp vụ
Lưu trên PostgreSQL.

Dữ liệu Analytics
Lưu trên ClickHouse.

Dữ liệu Recording
Lưu trên MinIO hoặc S3.

Chính sách
Encryption In Transit
Dữ liệu truyền tải được mã hóa.

Encryption At Rest
Dữ liệu lưu trữ được mã hóa.

Backup Policy
Dữ liệu được sao lưu định kỳ.

8.9. Audit Logging
Mục tiêu
Theo dõi các hoạt động quan trọng trong hệ thống.

Sự kiện ghi nhận
Authentication
Login
Logout
Failed Login

User Management
Create User
Update User
Delete User

Meeting
Join Room
Leave Room
Start Recording
Stop Recording

File Access
Upload File
Download File
Delete File

Lợi ích
Điều tra sự cố.
Kiểm toán hệ thống.
Truy vết hành động người dùng.

8.10. Monitoring & Alerting
Giám sát bảo mật
Theo dõi:
Login thất bại.
Truy cập trái phép.
Tăng đột biến lưu lượng.
Lỗi xác thực.

Cảnh báo
Hệ thống gửi cảnh báo khi:
Tấn công Brute Force.
Tài khoản bị khóa.
Lưu lượng bất thường.
Truy cập trái phép.

8.11. Backup & Disaster Recovery
Mục tiêu
Đảm bảo khả năng khôi phục dữ liệu khi xảy ra sự cố.

Thành phần sao lưu
PostgreSQL
Backup hàng ngày.
Point-In-Time Recovery.

MinIO / S3
Backup Recording.
Backup Tài liệu.

ClickHouse
Snapshot định kỳ.

Recovery Objective
RPO
≤ 15 phút

Mất tối đa 15 phút dữ liệu.

RTO
≤ 4 giờ

Khôi phục hệ thống trong vòng 4 giờ.

8.12. Security Architecture Overview
Users

 │

 ▼

HTTPS + TLS

 │

 ▼

API Gateway

 │

 ├── Authentication

 ├── Authorization

 ├── Rate Limiting

 └── Audit Logging

 │

 ▼

Services

 │

 ▼

Encrypted Storage

 │

 ├── PostgreSQL

 ├── ClickHouse

 ├── MinIO

 └── Backup System


8.13. Kết luận
Kiến trúc bảo mật được xây dựng theo mô hình nhiều lớp nhằm đảm bảo tính bảo mật, tính toàn vẹn và tính sẵn sàng của hệ thống.
Các cơ chế Authentication, Authorization, Encryption, Audit Logging và Disaster Recovery được áp dụng xuyên suốt toàn bộ nền tảng nhằm đáp ứng yêu cầu vận hành của các tổ chức giáo dục, doanh nghiệp và môi trường đào tạo quy mô lớn.
