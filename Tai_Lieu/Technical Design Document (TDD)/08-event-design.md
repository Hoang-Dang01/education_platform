08. Event Catalog
1. Purpose
Tài liệu này định nghĩa toàn bộ sự kiện (Event) của hệ thống.
Mục tiêu:
Hỗ trợ Event-Driven Architecture.
Giảm coupling giữa các service.
Hỗ trợ mở rộng hệ thống.
Hỗ trợ tích hợp và realtime processing.

2. Event Design Principles
Rule-001
Event là immutable.

Rule-002
Event chỉ mô tả điều đã xảy ra.
✔ UserCreated
✔ MeetingStarted
❌ CreateMeeting
❌ UpdateAttendance

Rule-003
Event phải có Producer.

Rule-004
Event có thể có nhiều Consumer.

Rule-005
Consumer không được phụ thuộc lẫn nhau.

3. Standard Event Envelope
{
  "eventId": "uuid",
  "eventName": "MeetingStarted",
  "eventVersion": 1,
  "occurredAt": "2026-06-15T10:00:00Z",
  "correlationId": "uuid",
  "source": "meeting-service",
  "payload": {}
}


4. Event Categories
Identity Events
Training Events
Meeting Events
Attendance Events
Analytics Events
Recording Events
Notification Events
Monitoring Events


5. Identity Events

EVT-001 UserCreated
Producer:
SRV-002 User Service

Consumers:
Notification Service
Monitoring Service


EVT-002 UserUpdated
Producer:
SRV-002 User Service

Consumers:
Monitoring Service


EVT-003 UserDeleted
Producer:
SRV-002 User Service

Consumers:
Monitoring Service


6. Training Events

EVT-010 CourseCreated
Producer:
Course Service

Consumers:
Notification Service
Monitoring Service


EVT-011 ClassCreated
Producer:
Class Service

Consumers:
Notification Service


7. Meeting Events

EVT-020 MeetingCreated
Producer:
Meeting Service

Consumers:
Notification Service
Monitoring Service


EVT-021 MeetingStarted
Producer:
Meeting Service

Consumers:
Attendance Service
Analytics Service
Recording Service
Notification Service
Monitoring Service


EVT-022 MeetingEnded
Producer:
Meeting Service

Consumers:
Attendance Service
Analytics Service
Recording Service
Notification Service
Monitoring Service


EVT-023 ParticipantJoined
Producer:
Meeting Service

Consumers:
Attendance Service
Analytics Service
Monitoring Service


EVT-024 ParticipantLeft
Producer:
Meeting Service

Consumers:
Attendance Service
Analytics Service
Monitoring Service


EVT-025 ScreenSharingStarted
Producer:
Meeting Service

Consumers:
Monitoring Service


EVT-026 ChatMessageSent
Producer:
Meeting Service

Consumers:
Analytics Service
Monitoring Service


8. Attendance Events

EVT-030 AttendanceSessionStarted
Producer:
Attendance Service

Consumers:
Analytics Service


EVT-031 AttendanceRecorded
Producer:
Attendance Service

Consumers:
Analytics Service
Notification Service
Monitoring Service


EVT-032 AttendanceCompleted
Producer:
Attendance Service

Consumers:
Analytics Service


9. Analytics Events

EVT-040 MetricCollected
Producer:
Analytics Service

Consumers:
Monitoring Service


EVT-041 DashboardUpdated
Producer:
Analytics Service

Consumers:
Monitoring Service


10. Recording Events

EVT-050 RecordingStarted
Producer:
Recording Service

Consumers:
Monitoring Service


EVT-051 RecordingCompleted
Producer:
Recording Service

Consumers:
Notification Service
Monitoring Service


11. Notification Events

EVT-060 NotificationSent
Producer:
Notification Service

Consumers:
Monitoring Service


12. Monitoring Events

EVT-070 AlertRaised
Producer:
Monitoring Service

Consumers:
Notification Service


13. Event Dependency Graph
Meeting
    ↓
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


14. Event Ownership
Event
Owner Service
UserCreated
User Service
MeetingStarted
Meeting Service
AttendanceRecorded
Attendance Service
MetricCollected
Analytics Service
RecordingCompleted
Recording Service


15. Event Topics
identity.user.created
identity.user.updated

training.course.created
training.class.created

meeting.created
meeting.started
meeting.ended
meeting.participant.joined
meeting.participant.left

attendance.recorded
attendance.completed

analytics.metric.collected

recording.completed

notification.sent

monitoring.alert.raised


16. Traceability
SRV-005 Meeting Service
        ↓
EVT-021 MeetingStarted
        ↓
SRV-006 Attendance Service
        ↓
EVT-031 AttendanceRecorded
        ↓
SRV-007 Analytics Service



08.1 Event Contract Specification
1. Purpose
Tài liệu này định nghĩa hợp đồng (Contract) giữa Event Producer và Event Consumer.
Mục tiêu:
Chuẩn hóa Event Payload.
Hỗ trợ Service Integration.
Hỗ trợ Versioning.
Hỗ trợ Retry và Recovery.
Giảm Breaking Changes.

2. Event Envelope
Tất cả Event phải sử dụng envelope chuẩn.
{
  "eventId": "uuid",
  "eventName": "MeetingStarted",
  "eventVersion": 1,
  "occurredAt": "2026-06-15T10:00:00Z",
  "correlationId": "uuid",
  "causationId": "uuid",
  "source": "meeting-service",
  "payload": {}
}


3. Standard Metadata
Field
Required
Description
eventId
Yes
Unique Event ID
eventName
Yes
Event Name
eventVersion
Yes
Event Schema Version
occurredAt
Yes
UTC Timestamp
correlationId
Yes
Distributed Trace ID
causationId
No
Parent Event ID
source
Yes
Producer Service
payload
Yes
Business Data


4. Event Naming Convention
<domain>.<aggregate>.<action>

Ví dụ:
meeting.session.started
meeting.participant.joined
attendance.record.recorded
analytics.metric.collected
recording.session.completed


5. Topic Convention
<environment>.<domain>.<event>

Ví dụ:
prod.meeting.started
prod.attendance.recorded
prod.analytics.metric.collected


6. JSON Schema Examples

EVT-021 MeetingStarted
Topic:
meeting.session.started

Schema:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MeetingStarted",
  "type": "object",
  "properties": {
    "meetingId": {
      "type": "string"
    },
    "classId": {
      "type": "string"
    },
    "startedBy": {
      "type": "string"
    },
    "startedAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "meetingId",
    "classId",
    "startedBy",
    "startedAt"
  ]
}

Producer:
SRV-005 Meeting Service

Consumers:
SRV-006 Attendance Service
SRV-007 Analytics Service
SRV-009 Recording Service


EVT-023 ParticipantJoined
Topic:
meeting.participant.joined

Schema:
{
  "type": "object",
  "properties": {
    "meetingId": {
      "type": "string"
    },
    "participantId": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "joinedAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "meetingId",
    "participantId",
    "userId",
    "joinedAt"
  ]
}


EVT-031 AttendanceRecorded
Topic:
attendance.record.recorded

Schema:
{
  "type": "object",
  "properties": {
    "attendanceRecordId": {
      "type": "string"
    },
    "meetingId": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "durationSeconds": {
      "type": "integer"
    },
    "status": {
      "type": "string"
    }
  },
  "required": [
    "attendanceRecordId",
    "meetingId",
    "userId",
    "status"
  ]
}


EVT-040 MetricCollected
Topic:
analytics.metric.collected

Schema:
{
  "type": "object",
  "properties": {
    "meetingId": {
      "type": "string"
    },
    "participantId": {
      "type": "string"
    },
    "latency": {
      "type": "number"
    },
    "packetLoss": {
      "type": "number"
    },
    "jitter": {
      "type": "number"
    },
    "rtt": {
      "type": "number"
    },
    "fps": {
      "type": "number"
    },
    "bitrate": {
      "type": "number"
    }
  }
}


7. Event Versioning
Rule-001
Không được sửa payload hiện tại.

Rule-002
Breaking Change phải tạo Version mới.
Ví dụ:
MeetingStarted.v1
MeetingStarted.v2


Rule-003
Consumer phải hỗ trợ ít nhất:
Current Version
Previous Version


Version Strategy
Change
Version
Add Optional Field
Same Version
Rename Field
New Version
Remove Field
New Version
Change Data Type
New Version


8. Delivery Guarantee
Business Events
At Least Once

Ví dụ:
MeetingStarted
AttendanceRecorded
RecordingCompleted


Monitoring Events
At Most Once

Ví dụ:
MetricCollected
HealthCheckUpdated


9. Retry Policy
Retry Strategy
Exponential Backoff


Retry Schedule
Attempt 1: Immediately
Attempt 2: 5 seconds
Attempt 3: 30 seconds
Attempt 4: 2 minutes
Attempt 5: 10 minutes


Maximum Retries
5


After Maximum Retry
Dead Letter Queue


10. Dead Letter Queue
Topic Naming:
meeting.started.dlq
attendance.recorded.dlq
analytics.metric.collected.dlq


11. Idempotency
Consumer phải xử lý được Event trùng lặp.
Ví dụ:
eventId

được dùng để deduplicate.

12. Ordering
Ordering chỉ được đảm bảo trong cùng Aggregate.
Ví dụ:
MeetingStarted
      ↓
ParticipantJoined
      ↓
MeetingEnded

Không đảm bảo ordering giữa các Aggregate khác nhau.

13. Traceability
SRV-005 Meeting Service
        ↓
EVT-021 MeetingStarted
        ↓
Topic
        ↓
JSON Schema
        ↓
SRV-006 Attendance Service
        ↓
AttendanceSessionCreated


14. Folder Structure
events/
│
├── meeting/
│   ├── meeting-started-v1.json
│   ├── meeting-ended-v1.json
│   └── participant-joined-v1.json
│
├── attendance/
│   └── attendance-recorded-v1.json
│
├── analytics/
│   └── metric-collected-v1.json
│
└── recording/
    └── recording-completed-v1.json


15. Governance Rules
Mọi Event phải có Owner.
Mọi Event phải có JSON Schema.
Mọi Event phải có Version.
Mọi Event phải có Retry Policy.
Mọi Event phải có DLQ.
Mọi Event phải có Consumer được xác định rõ.
Mọi Breaking Change phải tạo Event Version mới.



