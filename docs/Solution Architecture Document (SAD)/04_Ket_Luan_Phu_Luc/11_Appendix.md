# 11. Appendix
11.1. Purpose
Phụ lục cung cấp các thông tin tham chiếu, tiêu chuẩn và quyết định kỹ thuật hỗ trợ cho việc phát triển, triển khai và bảo trì hệ thống.

11.2. Glossary
Thuật ngữ
Mô tả
LMS
Learning Management System
WebRTC
Web Real-Time Communication
SFU
Selective Forwarding Unit
API
Application Programming Interface
JWT
JSON Web Token
RBAC
Role-Based Access Control
CDN
Content Delivery Network
CI/CD
Continuous Integration / Continuous Deployment
RTT
Round Trip Time
FPS
Frames Per Second
Bitrate
Tốc độ truyền dữ liệu media
Packet Loss
Tỷ lệ mất gói tin
Jitter
Độ dao động của độ trễ mạng
Observability
Khả năng quan sát và giám sát hệ thống
Microservice
Kiến trúc dịch vụ độc lập
Event-Driven Architecture
Kiến trúc hướng sự kiện


11.3. Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Redux Toolkit
WebRTC API
Socket.IO Client
Backend
ASP.NET Core Web API
SignalR
gRPC
REST API
Background Services
Database
PostgreSQL
Redis
Message Broker
RabbitMQ
Media & Realtime
WebRTC
SFU Server
Media Recording Service
Storage
Object Storage (S3 Compatible)
Monitoring
Prometheus
Grafana
Loki
OpenTelemetry
Infrastructure
Docker
Kubernetes
Nginx
GitHub Actions

11.4. Configuration Samples
Application Configuration
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


Logging Configuration
logging:
  level:
    default: Information
    system: Warning
    application: Debug


Monitoring Configuration
monitoring:
  metrics: enabled
  tracing: enabled
  logging: enabled


11.5. API Standards
API Style
RESTful API.
JSON Data Format.
UTF-8 Encoding.
URL Convention
/api/v1/resources

Ví dụ:
/api/v1/users
/api/v1/courses
/api/v1/classes
/api/v1/meetings


HTTP Methods
Method
Mục đích
GET
Truy vấn dữ liệu
POST
Tạo mới
PUT
Cập nhật toàn bộ
PATCH
Cập nhật một phần
DELETE
Xóa dữ liệu


Response Format
{
  "success": true,
  "message": "Operation completed.",
  "data": {},
  "errors": []
}


Error Format
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


11.6. Coding Standards
Naming Convention
Class
PascalCase

Method
PascalCase

Variable
camelCase

Constant
UPPER_SNAKE_CASE


Source Code Principles
SOLID Principles
Clean Architecture
Separation of Concerns
Dependency Injection
Single Responsibility Principle
Domain-Driven Design

API Principles
Versioning.
Idempotency.
Pagination.
Validation.
Standard Error Handling.

Logging Principles
Structured Logging.
Correlation ID.
Request Trace ID.
Sensitive Data Masking.

11.7. Architecture Decision Records (ADR)
ADR-001
Decision
Adopt Microservices Architecture.
Reason
Independent deployment.
Better scalability.
Easier maintenance.

ADR-002
Decision
Use PostgreSQL as the primary database.
Reason
ACID compliance.
High reliability.
Mature ecosystem.

ADR-003
Decision
Use Redis for caching and session storage.
Reason
High performance.
Reduce database load.

ADR-004
Decision
Use RabbitMQ for asynchronous communication.
Reason
Reliable message delivery.
Event-driven architecture support.

ADR-005
Decision
Use WebRTC for realtime communication.
Reason
Low latency.
Browser support.
Suitable for online learning.

ADR-006
Decision
Use Observability Platform.
Reason
Realtime monitoring.
Faster troubleshooting.
Better operational visibility.

11.8. References
IEEE 42010 – Systems and Software Architecture Description.
C4 Model for Software Architecture.
REST API Design Guidelines.
OWASP Application Security Verification Standard.
WebRTC Standards and Specifications.
Clean Architecture Principles.
Domain-Driven Design.

