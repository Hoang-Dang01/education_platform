# 11. Appendix

> **Mục đích:** Cung cấp các thông tin tham chiếu, tiêu chuẩn và quyết định kỹ thuật hỗ trợ cho việc phát triển, triển khai và bảo trì hệ thống.

---

## 11.1 Purpose

Phụ lục bao gồm:

- **Glossary** — Thuật ngữ và viết tắt
- **Technology Stack** — Danh sách công nghệ sử dụng
- **Configuration Samples** — Mẫu cấu hình tham khảo
- **API Standards** — Tiêu chuẩn thiết kế API
- **Coding Standards** — Quy tắc viết code
- **Architecture Decision Records (ADR)** — Quyết định kiến trúc đã được phê duyệt
- **References** — Tài liệu tham khảo

---

## 11.2 Glossary

| Thuật ngữ | Mô tả |
|:--|:--|
| LMS | Learning Management System |
| WebRTC | Web Real-Time Communication |
| SFU | Selective Forwarding Unit — loại Media Server cho WebRTC |
| API | Application Programming Interface |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| CDN | Content Delivery Network |
| CI/CD | Continuous Integration / Continuous Deployment |
| RTT | Round Trip Time |
| FPS | Frames Per Second |
| Bitrate | Tốc độ truyền dữ liệu media (Kbps) |
| Packet Loss | Tỷ lệ mất gói tin (%) |
| Jitter | Độ dao động của độ trễ mạng (ms) |
| Observability | Khả năng quan sát và giám sát hệ thống (metrics + logs + traces) |
| Microservice | Kiến trúc tách dịch vụ thành các unit độc lập |
| Event-Driven Architecture | Kiến trúc hướng sự kiện — giao tiếp qua Message Broker |

---

## 11.3 Technology Stack

### Frontend

| Công nghệ | Vai trò |
|:--|:--|
| React | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| WebRTC API | Real-time communication |
| Socket.IO Client | WebSocket client |

### Backend

| Công nghệ | Vai trò |
|:--|:--|
| ASP.NET Core Web API | REST API framework |
| SignalR | WebSocket / realtime push |
| gRPC | Internal service communication |
| Background Services | Async job processing |

### Database & Messaging

| Công nghệ | Vai trò |
|:--|:--|
| PostgreSQL | Primary relational database |
| Redis | Cache + session store + SignalR backplane |
| RabbitMQ | Message broker (event-driven) |

### Media & Storage

| Công nghệ | Vai trò |
|:--|:--|
| WebRTC | Real-time audio/video |
| SFU Server | Media forwarding (LiveKit / mediasoup) |
| Object Storage (S3-compatible) | File và recording storage |

### Monitoring & Infrastructure

| Công nghệ | Vai trò |
|:--|:--|
| Prometheus | Metrics collection |
| Grafana | Dashboard visualization |
| Loki | Log aggregation |
| OpenTelemetry | Distributed tracing |
| Docker | Containerization |
| Kubernetes | Container orchestration |
| Nginx | Reverse proxy / ingress |
| GitHub Actions | CI/CD pipeline |

---

## 11.4 Configuration Samples

### Application Configuration

```yaml
application:
  environment: Production
  timezone: Asia/Ho_Chi_Minh

database:
  provider: PostgreSQL
  connectionPool: 100

redis:
  enabled: true

rabbitmq:
  enabled: true

webrtc:
  stun:
    - stun:stun.l.google.com:19302
  turn:
    enabled: true
```

### Logging Configuration

```yaml
logging:
  level:
    default: Information
    system: Warning
    application: Debug
```

### Monitoring Configuration

```yaml
monitoring:
  metrics: enabled
  tracing: enabled
  logging: enabled
```

---

## 11.5 API Standards

### API Style

- **RESTful API** — resource-based URLs
- **JSON** — data format
- **UTF-8** — encoding

### URL Convention

```
/api/v1/{resource}
```

Ví dụ:

```
GET  /api/v1/users
POST /api/v1/courses
GET  /api/v1/classes/{id}
POST /api/v1/meetings
```

### HTTP Methods

| Method | Mục đích |
|:--|:--|
| `GET` | Truy vấn dữ liệu |
| `POST` | Tạo mới resource |
| `PUT` | Cập nhật toàn bộ |
| `PATCH` | Cập nhật một phần |
| `DELETE` | Xóa resource |

### Response Format

```json
{
  "success": true,
  "message": "Operation completed.",
  "data": {},
  "errors": []
}
```

### Error Format

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Email is invalid."
    }
  ]
}
```

---

## 11.6 Coding Standards

### Naming Convention

| Loại | Convention | Ví dụ |
|:--|:--|:--|
| Class | PascalCase | `MeetingService` |
| Method | PascalCase | `GetParticipants()` |
| Variable | camelCase | `meetingId` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

### Source Code Principles

- **Clean Architecture** — tách biệt Domain, Application, Infrastructure
- **SOLID Principles** — đặc biệt SRP và DIP
- **Domain-Driven Design** — Aggregate, Entity, Value Object
- **Dependency Injection** — không khởi tạo trực tiếp
- **Separation of Concerns** — không mix business logic và infrastructure

### API Principles

- **Versioning** — `/api/v1/` tiền tố bắt buộc
- **Idempotency** — PUT và DELETE phải idempotent
- **Pagination** — tất cả danh sách dùng cursor hoặc page/pageSize
- **Validation** — validate ở Controller, không để lọt vào Domain
- **Standard Error Handling** — dùng chung ProblemDetails format

### Logging Principles

- **Structured Logging** — dùng key-value thay vì string interpolation
- **Correlation ID** — truyền qua toàn bộ request chain
- **Request Trace ID** — gán từ API Gateway
- **Sensitive Data Masking** — không log password, token, PII

---

## 11.7 Architecture Decision Records (ADR)

### ADR-001: Adopt Microservices Architecture

| Trường | Nội dung |
|:--|:--|
| **Decision** | Tách hệ thống thành các service độc lập theo domain |
| **Reason** | Independent deployment, better scalability, easier maintenance |
| **Trade-off** | Tăng độ phức tạp vận hành — cần service mesh và CI/CD pipeline |

### ADR-002: Use PostgreSQL as Primary Database

| Trường | Nội dung |
|:--|:--|
| **Decision** | Dùng PostgreSQL cho tất cả relational data |
| **Reason** | ACID compliance, high reliability, mature ecosystem |
| **Trade-off** | Cần đọc replica cho analytics query để tránh lock contention |

### ADR-003: Use Redis for Caching and Session Storage

| Trường | Nội dung |
|:--|:--|
| **Decision** | Redis làm distributed cache, session store và SignalR backplane |
| **Reason** | High performance, reduce database load |
| **Trade-off** | Cần Redis Sentinel / Cluster để đảm bảo HA |

### ADR-004: Use RabbitMQ for Asynchronous Communication

| Trường | Nội dung |
|:--|:--|
| **Decision** | RabbitMQ làm message broker cho event-driven flow |
| **Reason** | Reliable message delivery, event-driven architecture support |
| **Trade-off** | Cần quorum queue để đảm bảo không mất message |

### ADR-005: Use WebRTC for Realtime Communication

| Trường | Nội dung |
|:--|:--|
| **Decision** | WebRTC qua SFU thay vì MCU hoặc P2P |
| **Reason** | Low latency, native browser support, phù hợp online learning |
| **Trade-off** | SFU là single point of failure — cần cluster |

### ADR-006: Use Observability Platform

| Trường | Nội dung |
|:--|:--|
| **Decision** | Prometheus + Grafana + Loki + OpenTelemetry |
| **Reason** | Realtime monitoring, faster troubleshooting, operational visibility |
| **Trade-off** | Tốn tài nguyên — cần dedicated monitoring namespace |

---

## 11.8 References

- IEEE 42010 — Systems and Software Architecture Description
- C4 Model for Software Architecture
- REST API Design Guidelines (Microsoft)
- OWASP Application Security Verification Standard (ASVS)
- WebRTC Standards and Specifications (W3C)
- Clean Architecture — Robert C. Martin
- Domain-Driven Design — Eric Evans
