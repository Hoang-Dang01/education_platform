# 2. Kiến trúc tổng thể (High-Level Architecture)
2.1. Tổng quan
Hệ thống được thiết kế theo mô hình Event-Driven Architecture kết hợp với Real-Time Media Architecture nhằm đáp ứng đồng thời các yêu cầu:
Học trực tuyến thời gian thực.
Điểm danh tự động.
Giám sát chất lượng kết nối.
Phân tích sự cố.
Báo cáo và thống kê.

2.2. Luồng kiến trúc tổng thể
┌─────────────────────┐
│      User Browser   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Frontend (React)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ API Gateway         │
└──────────┬──────────┘
           │
 ┌─────────┼────────────────────────────────┐
 │         │         │         │            │
 ▼         ▼         ▼         ▼            ▼

User    Course    Class    Meeting     File
Service Service   Service  Service     Service

                    │
                    ▼

          ┌──────────────────┐
          │ LiveKit Cluster  │
          └───────┬──────────┘
                  │
       ┌──────────┼──────────┐
       │          │          │
       ▼          ▼          ▼

 Attendance   Recording   Telemetry
  Events       Service    Collector

       │          │          │
       ▼          ▼          ▼

      Kafka     MinIO    Kafka

       │                     │
       └─────────┬───────────┘
                 ▼

        Analytics Engine

                 │
        ┌────────┼────────┐
        ▼                 ▼

 Attendance      Diagnostics
   Engine           Engine

        │                 │
        └────────┬────────┘
                 ▼

            ClickHouse

                 │
                 ▼

         Admin Dashboard


2.3. Luồng dữ liệu chính
Luồng học trực tuyến
User
→ Frontend
→ Meeting Service
→ LiveKit Cluster
→ Audio / Video / Screen Sharing

Luồng điểm danh
User Join Meeting
→ LiveKit Event
→ Kafka
→ Attendance Engine
→ PostgreSQL

Luồng Telemetry
WebRTC Statistics
→ Telemetry Collector
→ Kafka
→ Analytics Engine
→ ClickHouse

Luồng ghi hình
Meeting Recording
→ Recording Service
→ Object Storage (MinIO / S3)

Luồng giám sát
Telemetry Data
→ Analytics Engine
→ Dashboard
→ Real-Time Monitoring

Luồng chẩn đoán
Telemetry Data
→ Diagnostics Engine
→ Root Cause Analysis
→ Dashboard

2.4. Nguyên tắc kiến trúc
Separation of Concerns
Mỗi dịch vụ chỉ đảm nhiệm một chức năng nghiệp vụ cụ thể.
Event-Driven
Các sự kiện được truyền qua Kafka nhằm giảm phụ thuộc giữa các dịch vụ.
Scalability
Các thành phần có thể mở rộng độc lập:
API Services.
LiveKit.
Kafka.
ClickHouse.
Redis.
Fault Isolation
Sự cố tại một dịch vụ không làm ảnh hưởng đến toàn bộ hệ thống.

2.5. Kết luận
Kiến trúc được xây dựng theo hướng tách biệt giữa:
Business Services.
Media Processing.
Telemetry Processing.
Analytics Processing.
Nhờ đó hệ thống có thể đồng thời đáp ứng nhu cầu đào tạo trực tuyến, giám sát thời gian thực và phân tích chất lượng kết nối trên quy mô lớn.

