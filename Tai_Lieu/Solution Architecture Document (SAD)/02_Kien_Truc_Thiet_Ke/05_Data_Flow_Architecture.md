# 5. Data Flow Architecture
5.1. Mục tiêu
Data Flow Architecture mô tả cách dữ liệu được tạo ra, truyền tải, xử lý và lưu trữ trong hệ thống.
Mục tiêu của chương này là:
Xác định luồng dữ liệu giữa các Domain và Service.
Làm rõ trách nhiệm của từng thành phần trong quá trình xử lý dữ liệu.
Xác định các điểm tích hợp giữa LMS, Meeting và Analytics.
Làm cơ sở cho việc thiết kế Database, Event Model và API trong các giai đoạn tiếp theo.

5.2. Tổng quan luồng dữ liệu
Hệ thống bao gồm bốn nhóm luồng dữ liệu chính:
1. LMS Data Flow

2. Meeting Data Flow

3. Attendance Data Flow

4. Telemetry & Analytics Data Flow

Mỗi luồng dữ liệu phục vụ một mục đích nghiệp vụ khác nhau nhưng đều hội tụ về Dashboard và Reporting.

5.3. LMS Data Flow
Mục tiêu
Quản lý dữ liệu đào tạo.

Luồng dữ liệu
Admin / Manager

        │
        ▼

Frontend

        │
        ▼

API Gateway

        │
        ▼

Course Service
Class Service
User Service

        │
        ▼

PostgreSQL


Quy trình
Bước 1
Admin tạo khóa học.
Bước 2
Khóa học được lưu vào PostgreSQL.
Bước 3
Admin tạo lớp học.
Bước 4
Hệ thống gán:
Giáo viên
Học viên
Lịch học
Bước 5
Meeting Service sử dụng dữ liệu lớp học để tạo phòng học trực tuyến.

Kết quả
Tạo nguồn dữ liệu đầu vào cho Meeting Domain.

5.4. Meeting Data Flow
Mục tiêu
Quản lý quá trình học trực tuyến.

Luồng dữ liệu
Teacher / Student

        │
        ▼

Frontend

        │
        ▼

Meeting Service

        │
        ▼

LiveKit Cluster

        │
        ▼

Audio
Video
Screen Share


Quy trình
Bước 1
Người dùng tham gia lớp học.
Bước 2
Meeting Service xác thực quyền truy cập.
Bước 3
Meeting Service tạo LiveKit Token.
Bước 4
Frontend kết nối đến LiveKit.
Bước 5
Audio và Video được truyền trực tiếp qua LiveKit.

Kết quả
Phiên học trực tuyến được thiết lập.

5.5. Attendance Data Flow
Mục tiêu
Tự động tính toán thời gian học thực tế.

Luồng dữ liệu
Meeting Events

        │
        ▼

Kafka

        │
        ▼

Attendance Engine

        │
        ▼

PostgreSQL


Nguồn sự kiện
Join Meeting
JOIN

Leave Meeting
LEAVE

Mất kết nối
DISCONNECT

Kết nối lại
RECONNECT


Quy trình
Bước 1
Meeting Service phát sinh sự kiện.
Bước 2
Sự kiện được gửi vào Kafka.
Bước 3
Attendance Engine nhận sự kiện.
Bước 4
Attendance Engine tính toán:
Tổng thời gian tham gia.
Tổng thời gian gián đoạn.
Số lần mất kết nối.
Bước 5
Kết quả được lưu vào PostgreSQL.

Kết quả
Tạo dữ liệu điểm danh chính thức.

5.6. Recording Data Flow
Mục tiêu
Lưu trữ nội dung bài giảng.

Luồng dữ liệu
Meeting

        │
        ▼

Recording Service

        │
        ▼

LiveKit Egress

        │
        ▼

MinIO / S3

        │
        ▼

Recording Metadata

        │
        ▼

PostgreSQL


Quy trình
Bước 1
Giáo viên bắt đầu ghi hình.
Bước 2
LiveKit Egress ghi nhận Audio và Video.
Bước 3
Video được lưu lên Object Storage.
Bước 4
Metadata được lưu vào Database.

Kết quả
Tạo kho lưu trữ bài giảng.

5.7. Telemetry Data Flow
Mục tiêu
Thu thập dữ liệu chất lượng kết nối theo thời gian thực.

Luồng dữ liệu
Browser

(WebRTC Statistics API)

        │
        ▼

Telemetry Collector

        │
        ▼

Kafka

        │
        ▼

Analytics Engine

        │
        ▼

ClickHouse


Chỉ số thu thập
Network Metrics
Latency
RTT
Packet Loss
Jitter
Video Metrics
FPS
Resolution
Bitrate
Audio Metrics
Audio Bitrate
Audio Packet Loss

Quy trình
Bước 1
Frontend định kỳ lấy dữ liệu từ WebRTC Statistics API.
Bước 2
Telemetry Collector nhận dữ liệu.
Bước 3
Dữ liệu được gửi vào Kafka.
Bước 4
Analytics Engine xử lý dữ liệu.
Bước 5
Kết quả được lưu vào ClickHouse.

Kết quả
Tạo nguồn dữ liệu phục vụ Monitoring và Diagnostics.

5.8. Monitoring Data Flow
Mục tiêu
Hiển thị trạng thái lớp học theo thời gian thực.

Luồng dữ liệu
ClickHouse

        │
        ▼

Analytics Engine

        │
        ▼

Dashboard API

        │
        ▼

Admin Dashboard


Dữ liệu hiển thị
Lớp học
Trạng thái lớp.
Số người tham gia.
Thời lượng học.
Người dùng
Latency.
Packet Loss.
Jitter.
Chất lượng kết nối.

Kết quả
Quản lý có thể giám sát toàn bộ hệ thống theo thời gian thực.

5.9. Diagnostics Data Flow
Mục tiêu
Phân tích nguyên nhân sự cố.

Luồng dữ liệu
Telemetry Metrics

        │
        ▼

Analytics Engine

        │
        ▼

Diagnostics Engine

        │
        ▼

Alert System

        │
        ▼

Dashboard


Quy trình
Host Analysis
Phân tích chất lượng kết nối của Host.
Participant Analysis
Phân tích chất lượng kết nối của từng học viên.
Infrastructure Analysis
Phân tích tình trạng hạ tầng hệ thống.

Kết quả
Tạo cảnh báo và kết quả chẩn đoán.

5.10. Reporting Data Flow
Mục tiêu
Tổng hợp dữ liệu phục vụ báo cáo.

Luồng dữ liệu
LMS Data

Attendance Data

Telemetry Data

Meeting Data

        │
        ▼

Reporting Engine

        │
        ▼

Dashboard

Excel

CSV

PDF


Kết quả
Tạo báo cáo:
Học viên.
Lớp học.
Giáo viên.
Khóa học.
Vận hành hệ thống.

5.11. Data Flow End-to-End
Luồng dữ liệu tổng thể của hệ thống:
User

 │

 ▼

Frontend

 │

 ▼

API Gateway

 │

 ├──────── LMS Services
 │
 ├──────── Meeting Service
 │
 └──────── File Service

                │
                ▼

          LiveKit Cluster

                │
                ▼

        Meeting Events

                │
                ▼

              Kafka

                │
       ┌────────┼────────┐
       ▼        ▼        ▼

Attendance Analytics Diagnostics

       │        │        │

       ▼        ▼        ▼

PostgreSQL ClickHouse ClickHouse

       │        │
       └────────┼─────────┐
                ▼

         Reporting Engine

                ▼

         Admin Dashboard


5.12. Kết luận
Kiến trúc luồng dữ liệu được thiết kế theo hướng Event-Driven nhằm đảm bảo khả năng xử lý thời gian thực, khả năng mở rộng và giảm sự phụ thuộc giữa các dịch vụ.
Mọi dữ liệu phát sinh từ quá trình học trực tuyến đều được thu thập, xử lý và lưu trữ có hệ thống để phục vụ cho các chức năng điểm danh, giám sát, phân tích và báo cáo trên toàn nền tảng.
