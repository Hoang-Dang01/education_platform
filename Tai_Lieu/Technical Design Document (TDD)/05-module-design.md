05. Module Design
5.1 Purpose
Tài liệu này mô tả cấu trúc nội bộ của từng service, bao gồm:
Layer Structure
Dependency Rules
Module Responsibilities
Folder Organization
Communication Pattern
Mục tiêu:
Giảm coupling.
Tăng khả năng bảo trì.
Hỗ trợ kiểm thử.
Hỗ trợ mở rộng trong tương lai.

5.2 Standard Service Architecture
Mỗi service phải tuân theo cấu trúc:
Controllers
Application
Domain
Infrastructure
Persistence
Contracts

Kiến trúc phụ thuộc:
Controllers
      ↓
Application
      ↓
Domain

Infrastructure
      ↓

Persistence
      ↓

Contracts

Nguyên tắc:
Domain không phụ thuộc bất kỳ layer nào.
Application phụ thuộc Domain.
Infrastructure phụ thuộc Domain.
Controllers phụ thuộc Application.
Persistence phụ thuộc Domain.

5.3 Layer Responsibilities

Controllers Layer
Purpose
Expose API cho bên ngoài.
Responsibilities
HTTP Endpoint
Authentication
Validation
Response Mapping
Not Responsible
Business Logic
Database Access

Application Layer
Purpose
Điều phối Use Cases.
Responsibilities
Commands
Queries
Application Services
Transactions
Authorization Policies
Not Responsible
Persistence Details
Infrastructure Details

Domain Layer
Purpose
Chứa nghiệp vụ cốt lõi.
Responsibilities
Entities
Value Objects
Aggregates
Domain Services
Domain Events
Business Rules
Not Responsible
Database
HTTP
External Systems

Infrastructure Layer
Purpose
Kết nối hệ thống bên ngoài.
Responsibilities
Email
Cache
File Storage
MQ
WebRTC Integration
Third-party Services

Persistence Layer
Purpose
Lưu trữ dữ liệu.
Responsibilities
ORM
Repository
Database Mapping
Migrations
Query Optimization

Contracts Layer
Purpose
Định nghĩa giao tiếp.
Responsibilities
DTO
API Contracts
Event Contracts
Message Schemas

5.4 Module Dependency Rules
Cho phép:
Controller
      ↓
Application
      ↓
Domain

Infrastructure
      ↓
Domain

Persistence
      ↓
Domain

Không cho phép:
Domain
      ↓
Infrastructure

Domain
      ↓
Persistence

Controller
      ↓
Persistence


5.5 Standard Folder Structure
service-name
│
├── Controllers
│
├── Application
│   ├── Commands
│   ├── Queries
│   ├── Handlers
│   ├── Services
│   └── Interfaces
│
├── Domain
│   ├── Entities
│   ├── Aggregates
│   ├── ValueObjects
│   ├── Enums
│   ├── Events
│   ├── Specifications
│   └── Services
│
├── Infrastructure
│   ├── Cache
│   ├── Messaging
│   ├── Storage
│   ├── Email
│   └── ExternalServices
│
├── Persistence
│   ├── Context
│   ├── Configurations
│   ├── Repositories
│   └── Migrations
│
└── Contracts
    ├── Requests
    ├── Responses
    ├── DTOs
    └── Events


5.6 Example: Meeting Service
meeting-service
│
├── Controllers
│   ├── MeetingsController
│   └── ParticipantsController
│
├── Application
│   ├── Commands
│   │   ├── CreateMeeting
│   │   ├── JoinMeeting
│   │   └── EndMeeting
│   │
│   ├── Queries
│   │   ├── GetMeeting
│   │   └── GetParticipants
│   │
│   └── Services
│
├── Domain
│   ├── Aggregates
│   │   └── MeetingAggregate
│   │
│   ├── Entities
│   │   ├── Meeting
│   │   └── Participant
│   │
│   ├── ValueObjects
│   │   └── MeetingId
│   │
│   └── Events
│       ├── MeetingStarted
│       ├── ParticipantJoined
│       └── MeetingEnded
│
├── Infrastructure
│   ├── WebRTC
│   ├── SignalR
│   └── Redis
│
├── Persistence
│   ├── MeetingRepository
│   └── DbContext
│
└── Contracts
    ├── CreateMeetingRequest
    ├── JoinMeetingRequest
    └── MeetingResponse


5.7 Example: Attendance Service
attendance-service
│
├── Controllers
├── Application
├── Domain
│   ├── AttendanceSession
│   ├── AttendanceRecord
│   └── Events
│
├── Infrastructure
├── Persistence
└── Contracts


5.8 Traceability
DOM-003 Meeting
        ↓
CTX-003 Meeting Context
        ↓
SRV-005 Meeting Service
        ↓
MOD-001 Controllers
MOD-002 Application
MOD-003 Domain
MOD-004 Infrastructure
MOD-005 Persistence
MOD-006 Contracts


5.9 Design Principles
Clean Architecture
Dependency Inversion Principle
Domain-Driven Design
CQRS
Vertical Slice Architecture
Database per Service
Event Driven Integration
High Cohesion
Low Coupling



