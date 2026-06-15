03. Bounded Context Design
3.1 Purpose
Xác định ranh giới mô hình nghiệp vụ và ngăn chặn việc chia sẻ logic nghiệp vụ không kiểm soát giữa các domain.

3.2 Context List
CTX-001 Identity Context
Aggregates:
User
Role
Permission
Session
Owned Data:
Users
Roles
Permissions

CTX-002 Training Context
Aggregates:
Course
Class
Schedule
Material
Owned Data:
Courses
Classes
Materials

CTX-003 Meeting Context
Aggregates:
Meeting
Participant
MediaSession
ChatMessage
Owned Data:
Meetings
Participants

CTX-004 Attendance Context
Aggregates:
AttendanceSession
AttendanceRecord
Owned Data:
AttendanceRecords

CTX-005 Analytics Context
Aggregates:
ConnectionMetric
LearningMetric
Dashboard
Owned Data:
Metrics
Reports

CTX-006 Monitoring Context
Aggregates:
LogEntry
Alert
SystemMetric

CTX-007 Notification Context
Aggregates:
Notification
Template
Delivery

CTX-008 Recording Context
Aggregates:
Recording
MediaFile
Playback

3.3 Context Integration
Identity
    ↓
Training
    ↓
Meeting
    ↓
Attendance
    ↓
Analytics

Meeting
    ↓
Recording

All Contexts
    ↓
Notification

All Contexts
    ↓
Monitoring


3.4 Integration Pattern
Context
Pattern
Identity → Training
API
Training → Meeting
API
Meeting → Attendance
Event
Attendance → Analytics
Event
Meeting → Recording
Event
All → Notification
Event
All → Monitoring
Event


3.5 Context Ownership Rule
Mỗi Aggregate chỉ có một Context sở hữu.
Ví dụ:
User            → Identity
Course          → Training
Meeting         → Meeting
Attendance      → Attendance
ConnectionMetric → Analytics
Recording       → Recording

Không cho phép Context khác ghi trực tiếp vào dữ liệu của Context sở hữu.



