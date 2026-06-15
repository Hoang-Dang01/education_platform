# 2. Kiến trúc tổng thể (High-Level Architecture)

> **Mục đích:** Mô tả luồng kiến trúc, các thành phần hạ tầng chính và nguyên tắc thiết kế của hệ thống.
> **Tham chiếu:** TRD 01_Kien_Truc_De_Xuat.md · SAD 02_Kien_Truc_Thiet_Ke · TDD 02-domain-decomposition.md

---

## 2.1 Tổng quan

Hệ thống được thiết kế theo mô hình **Event-Driven Architecture** kết hợp với **Real-Time Media Architecture** nhằm đáp ứng đồng thời các yêu cầu:

- Học trực tuyến thời gian thực
- Điểm danh tự động
- Giám sát chất lượng kết nối
- Phân tích và chẩn đoán sự cố
- Báo cáo và thống kê

---

## 2.2 Luồng kiến trúc tổng thể

```
┌─────────────────────┐
│      User Browser   │
└──────────┬──────────┘
           │ HTTPS / WebSocket
           ▼
┌─────────────────────┐
│  Frontend (React)   │
└──────────┬──────────┘
           │ REST / SignalR
           ▼
┌─────────────────────┐
│    API Gateway      │
└──────────┬──────────┘
           │
  ┌────────┼──────────────────────────┐
  │        │         │        │       │
  ▼        ▼         ▼        ▼       ▼
User    Course    Class    Meeting   File
Service Service  Service   Service  Service
                              │
                              ▼
                   ┌──────────────────┐
                   │   SFU Cluster    │  ← WebRTC Media Server
                   └───────┬──────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         Attendance    Recording    Telemetry
          Events        Service     Collector
              │                         │
              ▼                         ▼
           Message Broker (RabbitMQ / Kafka)
              │                         │
              └────────────┬────────────┘
                           ▼
                   Analytics Engine
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
       Attendance Engine         Diagnostics Engine
              │                         │
              └────────────┬────────────┘
                           ▼
                    Database / ClickHouse
                           │
                           ▼
                    Admin Dashboard
```

---

## 2.3 Luồng dữ liệu chính

### 2.3.1 Luồng học trực tuyến

```
User → Frontend → Meeting Service → SFU Cluster → Audio / Video / Screen Sharing
```

### 2.3.2 Luồng điểm danh

```
User Join Meeting → SFU Event → Message Broker → Attendance Engine → PostgreSQL
```

### 2.3.3 Luồng Telemetry

```
WebRTC Statistics → Telemetry Collector → Message Broker → Analytics Engine → ClickHouse
```

### 2.3.4 Luồng ghi hình

```
Meeting Recording → Recording Service → Object Storage (MinIO / S3)
```

### 2.3.5 Luồng giám sát

```
Telemetry Data → Analytics Engine → Dashboard → Real-Time Monitoring
```

### 2.3.6 Luồng chẩn đoán

```
Telemetry Data → Diagnostics Engine → Root Cause Analysis → Dashboard
```

---

## 2.4 Nguyên tắc kiến trúc

| Nguyên tắc | Mô tả |
|:--|:--|
| **Separation of Concerns** | Mỗi service chỉ đảm nhiệm một chức năng nghiệp vụ cụ thể |
| **Event-Driven** | Các sự kiện được truyền qua Message Broker để giảm coupling giữa các service |
| **Scalability** | API Services, SFU, Message Broker, ClickHouse, Redis có thể scale độc lập |
| **Fault Isolation** | Sự cố tại một service không làm ảnh hưởng toàn hệ thống |

---

## 2.5 Kết luận

Kiến trúc được xây dựng theo hướng tách biệt rõ ràng giữa:

- **Business Services** — LMS, Meeting, Attendance
- **Media Processing** — SFU, Recording Service
- **Telemetry Processing** — Collector, Message Broker, Analytics Engine
- **Analytics Processing** — Diagnostics Engine, Dashboard

Nhờ đó hệ thống có thể đồng thời đáp ứng nhu cầu đào tạo trực tuyến, giám sát thời gian thực và phân tích chất lượng kết nối trên quy mô lớn.
