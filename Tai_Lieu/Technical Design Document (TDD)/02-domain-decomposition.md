02. Domain Decomposition
2.1 Purpose
Xác định các domain nghiệp vụ của hệ thống và ranh giới trách nhiệm giữa chúng.

2.2 Domain Map
Core Domain
│
├── Training
├── Meeting
├── Attendance
└── Analytics

Supporting Domain
│
├── Identity
├── Notification
├── Recording
└── Monitoring


2.3 Domain Definitions
DOM-001 Identity
Trách nhiệm:
Authentication
Authorization
User Profile
Role Management

DOM-002 Training
Trách nhiệm:
Courses
Classes
Schedule
Learning Materials

DOM-003 Meeting
Trách nhiệm:
Meeting Room
Participant Management
Media Session
Chat
Screen Sharing

DOM-004 Attendance
Trách nhiệm:
Join Tracking
Leave Tracking
Attendance Calculation
Attendance Reports

DOM-005 Analytics
Trách nhiệm:
Learning Analytics
Realtime Metrics
Reports
Dashboard

DOM-006 Monitoring
Trách nhiệm:
Logs
Metrics
Alerts
Health Checks

DOM-007 Notification
Trách nhiệm:
Email
Push Notification
System Notification

DOM-008 Recording
Trách nhiệm:
Recording Session
Storage
Playback
Download

2.4 Context Relationships
Identity
      ↓
Training
      ↓
Meeting
      ↓
Attendance
      ↓
Analytics

Monitoring
      ↑
All Domains

Notification
      ↑
All Domains

Recording
      ↑
Meeting


2.5 Domain Dependency Matrix
Domain
Depends On
Training
Identity
Meeting
Training
Attendance
Meeting
Analytics
Attendance
Recording
Meeting
Notification
All
Monitoring
All




