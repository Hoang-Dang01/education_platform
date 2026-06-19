04. Service Catalog
4.1 Purpose
Tài liệu này định nghĩa tất cả các service của hệ thống, trách nhiệm chính, ranh giới nghiệp vụ và mối liên hệ với các Bounded Context.
Mỗi service phải:
Có trách nhiệm rõ ràng.
Sở hữu dữ liệu riêng.
Có API contract riêng.
Không truy cập trực tiếp database của service khác.

4.2 Service Classification
Core Services
│
├── Auth Service
├── User Service
├── Course Service
├── Class Service
├── Meeting Service
├── Attendance Service
└── Analytics Service

Supporting Services
│
├── Notification Service
├── Recording Service
└── Monitoring Service

Infrastructure Services
│
├── API Gateway
├── Identity Provider
├── Message Broker
└── Cache Service


4.3 Service List
SRV-001 Auth Service
Purpose
Authentication và Authorization.
Responsibilities
Login
Logout
Refresh Token
JWT Issuing
Permission Validation
Owned Data
Sessions
Refresh Tokens
Context
CTX-001 Identity Context

SRV-002 User Service
Purpose
Quản lý người dùng.
Responsibilities
User Profile
User Management
Role Assignment
User Search
Owned Data
Users
Roles
Permissions
Context
CTX-001 Identity Context

SRV-003 Course Service
Purpose
Quản lý khóa học.
Responsibilities
Course CRUD
Course Materials
Enrollment
Course Information
Owned Data
Courses
Enrollments
Materials
Context
CTX-002 Training Context

SRV-004 Class Service
Purpose
Quản lý lớp học.
Responsibilities
Class Creation
Scheduling
Instructor Assignment
Student Assignment
Owned Data
Classes
Schedules
Context
CTX-002 Training Context

SRV-005 Meeting Service
Purpose
Quản lý lớp học trực tuyến.
Responsibilities
Meeting Lifecycle
Participant Management
Chat
Screen Sharing
Presence
Owned Data
Meetings
Participants
Meeting Sessions
Context
CTX-003 Meeting Context

SRV-006 Attendance Service
Purpose
Điểm danh tự động.
Responsibilities
Join Tracking
Leave Tracking
Attendance Calculation
Attendance Reports
Owned Data
Attendance Sessions
Attendance Records
Context
CTX-004 Attendance Context

SRV-007 Analytics Service
Purpose
Phân tích dữ liệu học tập và chất lượng kết nối.
Responsibilities
Learning Analytics
Connection Metrics
Dashboard Data
Reports
Owned Data
Metrics
Reports
Aggregated Data
Context
CTX-005 Analytics Context

SRV-008 Notification Service
Purpose
Gửi thông báo.
Responsibilities
Email
Push Notification
System Notification
Owned Data
Notifications
Templates
Delivery Logs
Context
CTX-007 Notification Context

SRV-009 Recording Service
Purpose
Ghi hình lớp học.
Responsibilities
Recording Session
Storage
Playback
Download
Owned Data
Recordings
Media Files
Context
CTX-008 Recording Context

SRV-010 Monitoring Service
Purpose
Giám sát vận hành hệ thống.
Responsibilities
Logs
Metrics
Alerts
Health Checks
Owned Data
Logs
Alerts
System Metrics
Context
CTX-006 Monitoring Context

4.4 Service Boundaries
Identity
├── Auth Service
└── User Service

Training
├── Course Service
└── Class Service

Meeting
└── Meeting Service

Attendance
└── Attendance Service

Analytics
└── Analytics Service

Notification
└── Notification Service

Recording
└── Recording Service

Monitoring
└── Monitoring Service


4.5 Service Design Principles
Single Responsibility Principle.
Database per Service.
API First Design.
Event Driven Integration.
Stateless Services.
Horizontal Scalability.
Independent Deployment.

4.6 Service Versioning
auth-service:v1
user-service:v1
course-service:v1
class-service:v1
meeting-service:v1
attendance-service:v1
analytics-service:v1
notification-service:v1
recording-service:v1
monitoring-service:v1


4.7 Traceability
CTX-001
 ├── SRV-001 Auth Service
 └── SRV-002 User Service

CTX-002
 ├── SRV-003 Course Service
 └── SRV-004 Class Service

CTX-003
 └── SRV-005 Meeting Service

CTX-004
 └── SRV-006 Attendance Service

CTX-005
 └── SRV-007 Analytics Service

CTX-006
 └── SRV-010 Monitoring Service

CTX-007
 └── SRV-008 Notification Service

CTX-008
 └── SRV-009 Recording Service




04.1 Service Responsibility Matrix
1. Purpose
Tài liệu này định nghĩa ranh giới trách nhiệm của từng service trong hệ thống.
Mục tiêu:
Xác định Service Ownership.
Ngăn chặn chồng chéo trách nhiệm.
Hỗ trợ phân rã Microservices.
Hỗ trợ thiết kế API và Database.

2. Responsibility Matrix
Service ID
Service
Primary Responsibility
Secondary Responsibility
SRV-001
Auth Service
Authentication
Authorization
SRV-002
User Service
User Management
Role Management
SRV-003
Course Service
Course Management
Enrollment
SRV-004
Class Service
Class Management
Schedule Management
SRV-005
Meeting Service
Video Conference
Presence Management
SRV-006
Attendance Service
Attendance Tracking
Attendance Statistics
SRV-007
Analytics Service
Learning Analytics
Connection Analytics
SRV-008
Notification Service
Notification Delivery
Template Management
SRV-009
Recording Service
Meeting Recording
Playback Management
SRV-010
Monitoring Service
System Monitoring
Alert Management


3. Detailed Responsibilities

SRV-001 Auth Service
Owns
Authentication
Login
Logout
Refresh Token
Token Validation
Does Not Own
User Profile
User CRUD
User Permission Assignment

SRV-002 User Service
Owns
User CRUD
User Profile
Role Management
Permission Management
Does Not Own
Authentication
JWT
Session Management

SRV-003 Course Service
Owns
Course Management
Course Materials
Enrollment
Does Not Own
Class Scheduling
Meeting Lifecycle

SRV-004 Class Service
Owns
Class Management
Schedule Management
Student Assignment
Instructor Assignment
Does Not Own
Course Management
Meeting Management

SRV-005 Meeting Service
Owns
Meeting Lifecycle
Participant Management
Presence
Chat
Screen Sharing
Breakout Room
Does Not Own
Attendance Calculation
Analytics
Recording Storage

SRV-006 Attendance Service
Owns
Join Tracking
Leave Tracking
Attendance Calculation
Attendance Reports
Does Not Own
Meeting Session
Participant Presence

SRV-007 Analytics Service
Owns
Connection Metrics
Dashboard Metrics
Reports
Aggregated Data
Does Not Own
Attendance Calculation
Meeting Lifecycle

SRV-008 Notification Service
Owns
Email Delivery
Push Notification
In-App Notification
Does Not Own
Business Logic
User Management

SRV-009 Recording Service
Owns
Recording Session
Video Storage
Playback
Download
Does Not Own
Meeting Lifecycle
Attendance

SRV-010 Monitoring Service
Owns
Logs
Metrics
Traces
Alerts
Health Checks
Does Not Own
Business Analytics
Attendance Statistics

4. Responsibility by Business Capability
Business Capability
Owner Service
Authentication
Auth Service
User Management
User Service
Course Management
Course Service
Class Management
Class Service
Video Conference
Meeting Service
Attendance Tracking
Attendance Service
Learning Analytics
Analytics Service
Notifications
Notification Service
Recording
Recording Service
System Monitoring
Monitoring Service


5. Responsibility by Domain
Domain
Service
Identity
Auth Service, User Service
Training
Course Service, Class Service
Meeting
Meeting Service
Attendance
Attendance Service
Analytics
Analytics Service
Notification
Notification Service
Recording
Recording Service
Monitoring
Monitoring Service


6. Ownership Rules
Rule-001
Mỗi Business Capability chỉ có một Primary Owner.

Rule-002
Không được phép có hai service cùng ghi dữ liệu vào một Aggregate.

Rule-003
Service khác phải truy cập thông qua:
API
Event
Read Model
Không được truy cập database trực tiếp.

Rule-004
Mọi API mới phải xác định rõ Service Owner trước khi triển khai.

7. Traceability
DOM-001 Identity
        ↓
CTX-001 Identity Context
        ↓
SRV-001 Auth Service
SRV-002 User Service

DOM-002 Training
        ↓
CTX-002 Training Context
        ↓
SRV-003 Course Service
SRV-004 Class Service

DOM-003 Meeting
        ↓
CTX-003 Meeting Context
        ↓
SRV-005 Meeting Service

DOM-004 Attendance
        ↓
CTX-004 Attendance Context
        ↓
SRV-006 Attendance Service

DOM-005 Analytics
        ↓
CTX-005 Analytics Context
        ↓
SRV-007 Analytics Service



04.2 Service Dependency Matrix
1. Purpose
Tài liệu này định nghĩa mối quan hệ phụ thuộc giữa các service trong hệ thống.
Mục tiêu:
Xác định chiều phụ thuộc.
Ngăn chặn Circular Dependency.
Hỗ trợ thiết kế API và Event.
Hỗ trợ Deployment và Scalability.

2. Dependency Principles
Rule-001
Dependency phải theo một chiều.
Rule-002
Không được phép Circular Dependency.
Rule-003
Business Service không được phụ thuộc trực tiếp vào Database của service khác.
Rule-004
Ưu tiên Event-Driven Integration cho các dependency không yêu cầu phản hồi tức thời.

3. Service Dependency Matrix
Service
Depends On
Dependency Type
Purpose
Auth Service
User Service
Sync
User Validation
User Service
None
-
-
Course Service
User Service
Sync
Instructor Information
Class Service
Course Service
Sync
Course Information
Class Service
User Service
Sync
Student & Instructor Information
Meeting Service
Class Service
Sync
Class Information
Meeting Service
User Service
Sync
Participant Information
Attendance Service
Meeting Service
Event
Join/Leave Tracking
Analytics Service
Attendance Service
Event
Attendance Statistics
Analytics Service
Meeting Service
Event
Connection Metrics
Recording Service
Meeting Service
Event
Recording Lifecycle
Notification Service
All Services
Event
Notifications
Monitoring Service
All Services
Event
Logs & Metrics


4. Dependency Graph
User Service
      ↑
Auth Service
      ↑
Course Service
      ↑
Class Service
      ↑
Meeting Service
      ↑
Attendance Service
      ↑
Analytics Service

Supporting Services:
Meeting Service
      ↓
Recording Service

All Services
      ↓
Notification Service

All Services
      ↓
Monitoring Service


5. Dependency Detail
SRV-001 Auth Service
Depends On:
SRV-002 User Service
Reason:
User lookup.
Permission lookup.
Account status validation.

SRV-003 Course Service
Depends On:
SRV-002 User Service
Reason:
Instructor assignment.
Enrollment validation.

SRV-004 Class Service
Depends On:
SRV-002 User Service
SRV-003 Course Service
Reason:
Student information.
Course information.

SRV-005 Meeting Service
Depends On:
SRV-002 User Service
SRV-004 Class Service
Reason:
Participant information.
Meeting schedule.

SRV-006 Attendance Service
Depends On:
SRV-005 Meeting Service
Reason:
Join Event.
Leave Event.
Participant Presence.

SRV-007 Analytics Service
Depends On:
SRV-005 Meeting Service
SRV-006 Attendance Service
Reason:
Connection Metrics.
Attendance Statistics.

SRV-008 Notification Service
Depends On:
Event Stream from all services.
Reason:
Notification Delivery.

SRV-009 Recording Service
Depends On:
SRV-005 Meeting Service
Reason:
Recording Start.
Recording Stop.

SRV-010 Monitoring Service
Depends On:
Event Stream from all services.
Reason:
Metrics Collection.
Logging.
Alerting.

6. Dependency by Integration Style
Synchronous Dependencies
Auth
    ↓
User

Course
    ↓
User

Class
    ↓
Course
    ↓
User

Meeting
    ↓
Class
    ↓
User


Event Dependencies
Meeting
    ↓
Attendance

Meeting
    ↓
Analytics

Attendance
    ↓
Analytics

Meeting
    ↓
Recording

All Services
    ↓
Notification

All Services
    ↓
Monitoring


7. Allowed Dependency Direction
Identity
      ↓
Training
      ↓
Meeting
      ↓
Attendance
      ↓
Analytics

Supporting Domains:
Notification
Monitoring
Recording

chỉ được phụ thuộc vào Event và không được trở thành dependency ngược.

8. Forbidden Dependencies
❌ User Service → Meeting Service
❌ User Service → Attendance Service
❌ Analytics Service → User Service Database
❌ Notification Service → Business Service Database
❌ Monitoring Service → Business Logic
❌ Attendance Service → Analytics Service

9. Failure Impact Analysis
Service Down
Impact
User Service
Login, Enrollment, Meeting Join
Course Service
Course Management
Class Service
Meeting Creation
Meeting Service
Online Classes Unavailable
Attendance Service
Attendance Delayed
Analytics Service
Dashboard Delayed
Notification Service
Notifications Delayed
Monitoring Service
Reduced Observability


10. Traceability
CTX-001
        ↓
SRV-001 Auth
SRV-002 User

CTX-002
        ↓
SRV-003 Course
SRV-004 Class

CTX-003
        ↓
SRV-005 Meeting

CTX-004
        ↓
SRV-006 Attendance

CTX-005
        ↓
SRV-007 Analytics




