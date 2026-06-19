# 2. Kiến trúc tổng thể (High-Level Architecture)
2.1. Tổng quan
Hệ thống được thiết kế theo mô hình phân tách miền nghiệp vụ (Domain-Oriented Architecture), bao gồm ba miền chức năng chính:
LMS Domain
Meeting Domain
Analytics Domain
Mỗi miền chịu trách nhiệm cho một nhóm chức năng riêng biệt nhưng vẫn phối hợp với nhau để tạo thành một nền tảng đào tạo trực tuyến thống nhất.
Kiến trúc được xây dựng nhằm đáp ứng các yêu cầu:
Đào tạo trực tuyến thời gian thực.
Quản lý đào tạo tập trung.
Thu thập dữ liệu vận hành.
Giám sát chất lượng kết nối.
Phân tích và báo cáo.

2.2. Các miền chức năng chính
LMS Domain
Phụ trách toàn bộ nghiệp vụ quản lý đào tạo.
Bao gồm:
Quản lý người dùng.
Quản lý khóa học.
Quản lý lớp học.
Quản lý lịch học.
Quản lý tài liệu.
Đây là nguồn dữ liệu nghiệp vụ chính của hệ thống.

Meeting Domain
Phụ trách toàn bộ hoạt động học trực tuyến.
Bao gồm:
Tạo phòng học.
Quản lý người tham gia.
Camera.
Microphone.
Screen Sharing.
Chat.
Recording.
Meeting Domain sử dụng nền tảng WebRTC thông qua LiveKit để xử lý Audio và Video thời gian thực.

Analytics Domain
Phụ trách việc thu thập và phân tích dữ liệu vận hành.
Bao gồm:
Attendance Engine.
Monitoring Dashboard.
Telemetry Processing.
Diagnostics Engine.
Reporting Engine.
Đây là miền chức năng tạo ra giá trị khác biệt so với các hệ thống LMS hoặc Video Conference thông thường.

2.3. Sơ đồ kiến trúc tổng thể
┌──────────────────────────┐
│         Users            │
│                          │
│ Admin                    │
│ Manager                  │
│ Teacher                  │
│ Student                  │
└─────────────┬────────────┘
              │
              ▼

┌──────────────────────────┐
│       Frontend           │
│ React + TypeScript       │
└─────────────┬────────────┘
              │
              ▼

┌──────────────────────────┐
│       API Gateway        │
└─────────────┬────────────┘
              │

 ┌────────────┼─────────────┐
 │            │             │
 ▼            ▼             ▼

LMS       Meeting      Analytics
Domain     Domain        Domain

 │            │             │
 │            ▼             │

 │      LiveKit Cluster     │
 │            │             │
 │            ▼             │
 │      Telemetry Data      │
 │            │             │
 └────────────┼─────────────┘
              ▼

          Kafka

              ▼

      Analytics Engine

              ▼

        ClickHouse

              ▼

     Admin Dashboard


2.4. Luồng hoạt động chính
Luồng quản lý đào tạo
Admin / Manager

↓

LMS Domain

↓

PostgreSQL

Người dùng quản lý khóa học, lớp học và học viên thông qua các dịch vụ thuộc LMS Domain.

Luồng học trực tuyến
Teacher / Student

↓

Meeting Domain

↓

LiveKit

↓

Audio / Video Stream

Meeting Domain chịu trách nhiệm quản lý phiên học và kết nối với LiveKit để xử lý truyền thông thời gian thực.

Luồng điểm danh
User Join

↓

Meeting Event

↓

Attendance Engine

↓

Attendance Data

Hệ thống tự động ghi nhận các sự kiện tham gia và rời lớp học để tính toán thời gian học thực tế.

Luồng giám sát chất lượng
WebRTC Statistics

↓

Telemetry Collector

↓

Kafka

↓

Analytics Engine

↓

Dashboard

Các chỉ số kết nối được thu thập liên tục từ trình duyệt và xử lý theo thời gian thực.

Luồng báo cáo
Attendance
+
Telemetry
+
Meeting Data

↓

Reporting Engine

↓

Dashboard / Export

Dữ liệu từ nhiều nguồn được tổng hợp để phục vụ báo cáo và thống kê.

2.5. Các thành phần hạ tầng chính
Thành phần
Vai trò
PostgreSQL
Lưu trữ dữ liệu nghiệp vụ
Redis
Cache và dữ liệu thời gian thực
LiveKit
Audio/Video Meeting
Kafka
Event Streaming
ClickHouse
Analytics Database
MinIO/S3
Lưu trữ Recording và Tài liệu
Prometheus
Thu thập Metrics
Grafana
Dashboard hệ thống


2.6. Định hướng kiến trúc
Kiến trúc được xây dựng theo hướng:
Modular Architecture.
Event-Driven Architecture.
Cloud-Native Architecture.
Horizontal Scalability.
Mỗi miền chức năng có thể được mở rộng độc lập tùy theo tải thực tế của hệ thống mà không ảnh hưởng đến các thành phần khác.

2.7. Kết luận
Kiến trúc tổng thể được tổ chức thành ba miền chính gồm LMS, Meeting và Analytics nhằm đảm bảo sự tách biệt trách nhiệm, khả năng mở rộng và dễ dàng bảo trì.
Mô hình này cho phép hệ thống vừa đáp ứng nhu cầu đào tạo trực tuyến thông thường, vừa hỗ trợ giám sát và phân tích chất lượng học tập theo thời gian thực trên quy mô lớn.
