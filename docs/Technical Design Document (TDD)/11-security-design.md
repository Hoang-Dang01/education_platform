11.1 Authentication Design
1. Purpose
Tài liệu này mô tả kiến trúc xác thực (Authentication) của hệ thống.
Mục tiêu:
Xác minh danh tính người dùng.
Cung cấp cơ chế đăng nhập an toàn.
Hỗ trợ Session Management.
Hỗ trợ Multi-Device Login.
Hỗ trợ Service-to-Service Authentication.

2. Authentication Requirements
Functional Requirements
Login
Logout
Refresh Token
Token Revocation
Password Reset
Session Management
Multi Device Support

Non-Functional Requirements
Stateless Authentication
Horizontal Scalability
Token Expiration
High Availability

3. Architecture
Client
    ↓
API Gateway
    ↓
Auth Service
    ↓
User Service


4. Authentication Strategy
Authentication Method:
JWT Bearer Token

Session Strategy:
Refresh Token + Database Session


5. Login Flow
User
   ↓
POST /auth/login
   ↓
Auth Service
   ↓
User Validation
   ↓
Generate Tokens
   ↓
Create Session
   ↓
Return Tokens


6. Sequence Diagram
Client
   ↓
API Gateway
   ↓
Auth Service
   ↓
User Service
   ↓
Database

Detailed:
Client
      ↓
Login Request
      ↓
Auth Service
      ↓
Validate Password
      ↓
Generate JWT
      ↓
Generate Refresh Token
      ↓
Save Session
      ↓
Return Tokens


7. Token Model
Access Token
Purpose:
API Authentication

Lifetime:
15 Minutes

Storage:
Memory


Refresh Token
Purpose:
Generate New Access Token

Lifetime:
30 Days

Storage:
HttpOnly Secure Cookie


8. JWT Structure
Header:
{
  "alg": "RS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["Student"],
  "sessionId": "uuid",
  "iat": 1710000000,
  "exp": 1710000900
}


9. Claims
Required Claims:
sub
sessionId
iat
exp

Optional Claims:
email
roles
permissions
tenantId


10. Session Model
ENT-024 Session
Attributes:
sessionId
userId
refreshTokenHash
deviceId
ipAddress
userAgent
createdAt
expiresAt
revokedAt

Table:
DB-080 sessions


11. Password Policy
Minimum Length:
8 Characters

Requirements:
Uppercase
Lowercase
Number
Special Character


12. Password Storage
Algorithm:
Argon2id

Alternative:
BCrypt

Never Store:
Plain Text Password


13. Login API
POST /api/v1/auth/login

Request:
{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "accessToken": "jwt",
  "refreshToken": "token",
  "expiresIn": 900
}


14. Refresh Flow
Client
      ↓
Refresh Token
      ↓
Auth Service
      ↓
Validate Session
      ↓
Issue New Tokens


15. Token Rotation
Strategy:
Refresh Token Rotation

Old Token
      ↓
Invalidate
      ↓
New Token


16. Logout Flow
Client
      ↓
Logout
      ↓
Revoke Session
      ↓
Delete Refresh Token


17. Multi-Device Support
User
 ├── Laptop Session
 ├── Mobile Session
 └── Tablet Session

Each Device:
Independent Session


18. Service-to-Service Authentication
Method:
JWT Service Token

Alternative:
mTLS


19. Security Events
Published:
UserLoggedIn
UserLoggedOut
SessionRevoked
PasswordChanged


20. Failure Handling
Invalid Credentials
401 Unauthorized


Expired Token
401 Unauthorized


Revoked Session
401 Unauthorized


Too Many Attempts
429 Too Many Requests


21. Brute Force Protection
Policy:
5 Failed Attempts

Action:
Temporary Lock

Duration:
15 Minutes


22. Monitoring
Metrics:
Login Success Rate
Login Failure Rate
Token Refresh Rate
Session Count
Failed Login Attempts
Logs:
Login Attempt
Login Success
Login Failure
Logout
Token Refresh

23. Security Controls
Transport:
HTTPS Only

Cookies:
HttpOnly
Secure
SameSite

Headers:
HSTS
X-Frame-Options
X-Content-Type-Options


24. Traceability
REQ-001 Authentication
      ↓
API-001 Login
      ↓
SRV-001 Auth Service
      ↓
Authentication Design
      ↓
TEST-060 Authentication Test


25. Authentication State Machine
Unauthenticated
        ↓
Authenticated
        ↓
Token Expired
        ↓
Refresh
        ↓
Authenticated

or

Authenticated
        ↓
Logout
        ↓
Unauthenticated



11.2 Authorization Design
1. Purpose
Tài liệu này mô tả kiến trúc phân quyền của hệ thống.
Mục tiêu:
Kiểm soát truy cập tài nguyên.
Phân tách trách nhiệm.
Hỗ trợ mở rộng.
Đảm bảo an toàn dữ liệu.

2. Authorization Architecture
Client
    ↓
JWT
    ↓
API Gateway
    ↓
Authorization Middleware
    ↓
Application Policy
    ↓
Business Operation


3. Authorization Strategy
Strategy:
RBAC + Policy-Based Authorization

Components:
Roles
Permissions
Policies
Resource Ownership


4. Authorization Model
User
  ↓
Role
  ↓
Permission
  ↓
Policy
  ↓
Resource


5. Core Entities
User
ENT-001 User


Role
ENT-002 Role


Permission
ENT-025 Permission


Policy
ENT-026 Policy


6. Roles
Administrator
Responsibilities:
System Management
User Management
Monitoring
Reporting

Training Manager
Responsibilities:
Course Management
Class Management
Reporting

Instructor
Responsibilities:
Teaching
Meeting Management
Attendance

Student
Responsibilities:
Join Classes
View Materials
Participate in Meetings

Operations Team
Responsibilities:
Monitoring
Analytics
Troubleshooting

7. Permission Catalog
User Permissions
users.read
users.create
users.update
users.delete


Course Permissions
courses.read
courses.create
courses.update
courses.delete


Class Permissions
classes.read
classes.create
classes.update
classes.delete


Meeting Permissions
meetings.read
meetings.create
meetings.join
meetings.end
meetings.record


Attendance Permissions
attendance.read
attendance.export


Analytics Permissions
analytics.read
analytics.export


Monitoring Permissions
monitoring.read
alerts.manage


8. Role Permission Matrix
Permission
Admin
Manager
Instructor
Student
Operations
users.read
✔
✖
✖
✖
✖
users.create
✔
✖
✖
✖
✖
courses.read
✔
✔
✔
✔
✖
courses.create
✔
✔
✖
✖
✖
classes.create
✔
✔
✖
✖
✖
meetings.create
✔
✔
✔
✖
✖
meetings.join
✔
✔
✔
✔
✖
meetings.end
✔
✔
✔
✖
✖
meetings.record
✔
✔
✔
✖
✖
attendance.read
✔
✔
✔
Student(Self)
✖
analytics.read
✔
✔
✔
✖
✔
monitoring.read
✔
✖
✖
✖
✔


9. Policy-Based Authorization
Policy: MeetingOwner
User == Meeting.Instructor


Policy: ClassInstructor
User in Class.Instructors


Policy: StudentEnrollment
User in Class.Students


Policy: AttendanceOwner
User == Attendance.User


Policy: RecordingAccess
Admin
OR
Instructor
OR
Enrolled Student


10. Resource Ownership
Meeting
Owner:
Instructor


Course
Owner:
Training Manager


Attendance Record
Owner:
Student


Recording
Owner:
Instructor


11. Authorization Flow
Request
      ↓
Authentication
      ↓
Load Claims
      ↓
Check Role
      ↓
Check Permission
      ↓
Check Policy
      ↓
Execute


12. JWT Claims
{
  "sub": "user-id",
  "roles": ["Instructor"],
  "permissions": [
    "meetings.create",
    "meetings.end"
  ]
}


13. API Authorization Examples
Create Meeting
POST /api/v1/meetings

Required:
meetings.create


Join Meeting
POST /api/v1/meetings/{id}/join

Required:
meetings.join
+
StudentEnrollment Policy


Get Attendance Report
GET /attendance/reports/{classId}

Required:
attendance.read
+
ClassInstructor Policy


14. Service-to-Service Authorization
Method:
Service Token

Claims:
{
  "service": "analytics-service",
  "scope": [
    "attendance.read"
  ]
}


15. Data Authorization Rules
Students
Can access:
Own Profile
Own Attendance
Own Recordings


Instructors
Can access:
Own Classes
Own Meetings
Own Reports


Administrators
Can access:
All Resources


16. Authorization Failure
Missing Authentication
401 Unauthorized


Missing Permission
403 Forbidden


Resource Ownership Violation
403 Forbidden


17. Caching Strategy
Cache:
Roles
Permissions
Policies

Storage:
Redis

TTL:
15 Minutes


18. Auditing
Audit Events:
PermissionDenied
RoleChanged
PolicyViolation


19. Monitoring
Metrics:
Authorization Success Rate
Authorization Failure Rate
Permission Denied Count
Policy Violation Count
Logs:
Permission Check
Policy Check
Access Denied

20. Traceability
REQ-002 Authorization
      ↓
API Authorization Rules
      ↓
SRV-001 Auth Service
      ↓
Authorization Design
      ↓
TEST-065 Authorization Test


21. Authorization Decision Tree
Authenticated?
      ↓
No → 401

Yes
 ↓
Permission?
 ↓
No → 403

Yes
 ↓
Policy?
 ↓
No → 403

Yes
 ↓
Allow



11.3 Audit Design
1. Purpose
Tài liệu này mô tả kiến trúc Audit Logging của hệ thống.
Mục tiêu:
Theo dõi mọi hành động quan trọng.
Hỗ trợ điều tra sự cố.
Hỗ trợ Compliance.
Hỗ trợ Security Monitoring.
Hỗ trợ Troubleshooting.

2. Audit Principles
Rule-001
Audit Log là immutable.

Rule-002
Không được update hoặc delete Audit Log.

Rule-003
Audit không được làm chậm Business Transaction.

Rule-004
Audit phải có khả năng truy vết end-to-end.

3. Audit Architecture
Application
      ↓
Audit Event
      ↓
Message Broker
      ↓
Audit Service
      ↓
Audit Database


4. Components
Application Services
Responsibilities:
Publish Audit Events.

Message Broker
Responsibilities:
Asynchronous Delivery.

Audit Service
Responsibilities:
Persist Audit Logs.
Search.
Reporting.

Audit Database
Responsibilities:
Long-Term Storage.

5. Audit Scope
Authentication
Login
Logout
Password Change
Session Revocation

Authorization
Permission Denied
Role Changed
Policy Violation

User Management
User Created
User Updated
User Deleted

Course Management
Course Created
Course Updated
Course Deleted

Meeting Management
Meeting Created
Meeting Started
Meeting Ended

Attendance
Attendance Updated
Attendance Exported

Recording
Recording Viewed
Recording Downloaded
Recording Deleted

Administration
Configuration Changed
System Settings Changed

6. Audit Event Model
ENT-027 AuditLog
Attributes:
auditId
eventType
action
resourceType
resourceId
userId
sessionId
ipAddress
userAgent
correlationId
timestamp
status
details


7. Audit Table
DB-090 audit_logs
Columns:
id
event_type
action
resource_type
resource_id
user_id
session_id
ip_address
user_agent
correlation_id
status
details
created_at


8. Audit Event Categories
Authentication Events
LOGIN
LOGOUT
PASSWORD_CHANGED
SESSION_REVOKED


Authorization Events
ACCESS_DENIED
ROLE_CHANGED
PERMISSION_CHANGED


Business Events
COURSE_CREATED
CLASS_CREATED
MEETING_STARTED
ATTENDANCE_EXPORTED


Administrative Events
CONFIG_CHANGED
USER_DELETED
SYSTEM_UPDATED


9. Audit Flow
Business Action
      ↓
Audit Event
      ↓
Message Broker
      ↓
Audit Service
      ↓
Audit Database


10. Standard Audit Event
{
  "eventId": "uuid",
  "eventType": "MEETING_STARTED",
  "userId": "uuid",
  "resourceType": "Meeting",
  "resourceId": "uuid",
  "timestamp": "2026-06-15T10:00:00Z",
  "status": "SUCCESS",
  "correlationId": "uuid"
}


11. Details Payload
{
  "oldValue": {},
  "newValue": {},
  "additionalInformation": {}
}


12. Correlation ID
Purpose:
Distributed Tracing

Example:
API Gateway
      ↓
Meeting Service
      ↓
Attendance Service
      ↓
Analytics Service

cùng sử dụng:
correlationId


13. Audit Retention Policy
Data
Retention
Authentication Logs
2 Years
Business Audit Logs
5 Years
Security Audit Logs
7 Years
Compliance Logs
10 Years


14. Archive Policy
After 12 Months
      ↓
Archive Database


15. Purge Policy
After Retention Period
      ↓
Archive Verification
      ↓
Purge


16. Search Requirements
Filter By:
User
Resource
Event Type
Date Range
Correlation ID
Status

17. Index Strategy
Indexes:
INDEX(user_id)
INDEX(resource_id)
INDEX(event_type)
INDEX(created_at)
INDEX(correlation_id)

Composite:
INDEX(user_id, created_at)


18. Security
Audit Logs:
Append Only


Access:
Administrator
Operations Team


Sensitive Data:
Never Log Passwords
Never Log Access Tokens
Never Log Secrets


19. Monitoring
Metrics:
Audit Events/sec
Failed Audit Writes
Audit Queue Length
Audit Storage Usage
Logs:
Audit Persisted
Audit Failed
Audit Archived

20. Failure Handling
If Audit Database Down:
Retry
      ↓
Queue
      ↓
Dead Letter Queue

Business Transaction:
Must Continue


21. Compliance Support
Supports:
ISO 27001
SOC 2
GDPR (where applicable)
Internal Security Policies

22. Traceability
REQ-050 Audit Requirement
      ↓
SRV-010 Monitoring Service
      ↓
ENT-027 AuditLog
      ↓
DB-090 audit_logs
      ↓
Audit Design
      ↓
TEST-070 Audit Test


23. Audit Sequence Example
Instructor
      ↓
Create Meeting
      ↓
Meeting Service
      ↓
Publish Audit Event
      ↓
Audit Service
      ↓
Audit Database


24. Governance Rules
Mọi hành động quản trị phải được audit.
Mọi thay đổi quyền phải được audit.
Mọi export dữ liệu phải được audit.
Mọi truy cập recording phải được audit.
Audit Logs không được chỉnh sửa.
Audit Logs phải có Correlation ID.


