06. API Catalog
6.1 Purpose
Tài liệu này định nghĩa toàn bộ API của hệ thống.
Mục tiêu:
Chuẩn hóa API Contract.
Hỗ trợ Frontend Development.
Hỗ trợ Integration.
Hỗ trợ API Versioning.
Là nguồn sinh OpenAPI Specification.

6.2 API Design Principles
API Style
RESTful API
JSON Format
UTF-8 Encoding
Stateless
Versioned API

Base URL
/api/v1

Ví dụ:
/api/v1/auth/login
/api/v1/courses
/api/v1/classes
/api/v1/meetings


6.3 Response Standard
Success Response
{
  "success": true,
  "message": "Operation successful.",
  "data": {}
}


Error Response
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email."
    }
  ]
}


6.4 Authentication APIs
API-001 Login
Field
Value
Method
POST
URL
/auth/login
Service
SRV-001 Auth Service
Authentication
None


API-002 Refresh Token
Field
Value
Method
POST
URL
/auth/refresh
Service
SRV-001 Auth Service
Authentication
Refresh Token


API-003 Logout
Field
Value
Method
POST
URL
/auth/logout
Service
SRV-001 Auth Service
Authentication
JWT


6.5 User APIs
API-004 Create User
POST /users


API-005 Get User
GET /users/{id}


API-006 Update User
PUT /users/{id}


API-007 Delete User
DELETE /users/{id}


API-008 Search Users
GET /users


6.6 Course APIs
API-009 Create Course
POST /courses


API-010 Get Course
GET /courses/{id}


API-011 Update Course
PUT /courses/{id}


API-012 Delete Course
DELETE /courses/{id}


API-013 Get Courses
GET /courses


6.7 Class APIs
API-014 Create Class
POST /classes


API-015 Get Class
GET /classes/{id}


API-016 Assign Student
POST /classes/{id}/students


API-017 Assign Instructor
POST /classes/{id}/instructors


6.8 Meeting APIs
API-018 Create Meeting
POST /meetings


API-019 Get Meeting
GET /meetings/{id}


API-020 Join Meeting
POST /meetings/{id}/join


API-021 Leave Meeting
POST /meetings/{id}/leave


API-022 End Meeting
POST /meetings/{id}/end


API-023 Get Participants
GET /meetings/{id}/participants


6.9 Attendance APIs
API-024 Check In
POST /attendance/checkin


API-025 Check Out
POST /attendance/checkout


API-026 Get Attendance Report
GET /attendance/reports/{classId}


API-027 Get Student Attendance
GET /attendance/students/{studentId}


6.10 Analytics APIs
API-028 Dashboard
GET /analytics/dashboard


API-029 Connection Metrics
GET /analytics/metrics


API-030 Class Analytics
GET /analytics/classes/{classId}


6.11 Recording APIs
API-031 Start Recording
POST /recordings/start


API-032 Stop Recording
POST /recordings/stop


API-033 Get Recording
GET /recordings/{id}


6.12 Notification APIs
API-034 Send Notification
POST /notifications


API-035 Get Notifications
GET /notifications


6.13 Monitoring APIs
API-036 Health Check
GET /monitoring/health


API-037 System Metrics
GET /monitoring/metrics


6.14 API Versioning
Current Version:
v1

Future:
/api/v2


6.15 OpenAPI Structure
openapi/
│
├── auth.yaml
├── users.yaml
├── courses.yaml
├── classes.yaml
├── meetings.yaml
├── attendance.yaml
├── analytics.yaml
├── recordings.yaml
├── notifications.yaml
└── monitoring.yaml


6.16 Traceability
SRV-001
 ├── API-001 Login
 ├── API-002 Refresh
 └── API-003 Logout

SRV-005
 ├── API-018 Create Meeting
 ├── API-020 Join Meeting
 └── API-022 End Meeting

SRV-006
 ├── API-024 Check In
 └── API-026 Attendance Report




06.1 API Contract Specification
1. Purpose
Tài liệu này định nghĩa hợp đồng (Contract) giữa API Provider và API Consumer.
Mục tiêu:
Chuẩn hóa giao tiếp giữa các hệ thống.
Hỗ trợ Frontend và Mobile Development.
Hỗ trợ API Testing.
Hỗ trợ API Versioning.
Giảm Breaking Changes.

2. API Contract Template
Mỗi API phải định nghĩa đầy đủ:
General Information
Field
Description
API ID
Unique Identifier
API Name
API Name
Service
Owner Service
Version
API Version
Method
HTTP Method
Endpoint
URL
Description
Business Purpose


Authorization
Field
Description
Authentication Required
Yes/No
Authorization Policy
Role/Permission
Scopes
Required Scopes


Request
Headers
Path Parameters
Query Parameters
Request Body

Response
Success Response
Error Response

Validation Rules
Required Fields
Length Constraints
Format Validation
Business Validation

Error Codes
HTTP Status Code
Business Error Code
Error Message

Dependencies
Database Tables
Events Published
Events Consumed

Traceability
Requirement
    ↓
Use Case
    ↓
Service
    ↓
API


3. Standard Headers
Request Headers
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
X-Correlation-Id: uuid
X-Request-Id: uuid


Response Headers
Content-Type: application/json
X-Correlation-Id: uuid


4. Standard Response Format
Success
{
  "success": true,
  "message": "Operation successful.",
  "data": {}
}


Error
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}


5. API Specification Examples
API-001 Login
General
Field
Value
API ID
API-001
Service
SRV-001 Auth Service
Method
POST
Endpoint
/api/v1/auth/login
Description
User Login


Authorization
Authentication Required:
No


Request
{
  "email": "user@example.com",
  "password": "Password123!"
}


Validation Rules
Field
Rule
email
Required
email
Valid Email
password
Required
password
Min Length = 8


Success Response
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "token",
    "expiresIn": 3600
  }
}


Error Codes
HTTP
Code
Message
400
AUTH-001
Invalid Request
401
AUTH-002
Invalid Credentials
403
AUTH-003
User Disabled
500
AUTH-999
Internal Error


Dependencies
Database:
DB-001 Users
DB-002 Sessions

Events:
EVT-001 UserLoggedIn


Traceability
REQ-001
 ↓
UC-001
 ↓
SRV-001
 ↓
API-001


API-018 Create Meeting
General
Field
Value
API ID
API-018
Service
SRV-005 Meeting Service
Method
POST
Endpoint
/api/v1/meetings


Authorization
Required Roles:
Administrator
Instructor


Request
{
  "classId": "uuid",
  "title": "Software Architecture",
  "scheduledAt": "2026-06-15T08:00:00Z"
}


Validation Rules
Field
Rule
classId
Required
title
Required
title
Max Length = 200
scheduledAt
Required


Success Response
{
  "success": true,
  "data": {
    "meetingId": "uuid",
    "meetingCode": "ABC123"
  }
}


Error Codes
HTTP
Code
400
MEETING-001
403
MEETING-002
404
MEETING-003
500
MEETING-999


Dependencies
Database:
DB-020 Meetings
DB-021 Participants

Events:
EVT-021 MeetingCreated


Traceability
REQ-018
 ↓
UC-011
 ↓
SRV-005
 ↓
API-018


API-020 Join Meeting
General
Field
Value
API ID
API-020
Service
SRV-005 Meeting Service
Method
POST
Endpoint
/api/v1/meetings/{id}/join


Authorization
Authenticated User.

Request
{
  "deviceType": "Desktop",
  "networkType": "WiFi"
}


Success Response
{
  "success": true,
  "data": {
    "participantId": "uuid",
    "signalingToken": "jwt",
    "iceServers": []
  }
}


Error Codes
HTTP
Code
401
MEETING-010
403
MEETING-011
404
MEETING-012
409
MEETING-013


Dependencies
Database:
DB-020 Meetings
DB-021 Participants

Events:
EVT-025 ParticipantJoined
EVT-031 AttendanceStarted


6. Error Code Convention
AUTH-001
AUTH-999

USER-001
USER-999

MEETING-001
MEETING-999

ATTENDANCE-001
ATTENDANCE-999


7. API Versioning Rules
Breaking Change:
/api/v2

Non-Breaking Change:
Minor Release


8. OpenAPI Structure
openapi/
│
├── auth.yaml
├── users.yaml
├── courses.yaml
├── classes.yaml
├── meetings.yaml
├── attendance.yaml
├── analytics.yaml
├── recordings.yaml
├── notifications.yaml
└── monitoring.yaml


9. Contract Governance Rules
Mọi API phải có API ID.
Mọi API phải có Owner Service.
Mọi API phải có Error Codes.
Mọi API phải có Validation Rules.
Mọi API phải có Traceability.
Mọi Breaking Change phải tạo Version mới.


