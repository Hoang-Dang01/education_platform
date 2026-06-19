09.1 Sequence Design – Join Meeting Flow
1. Purpose
Mô tả luồng người dùng tham gia lớp học trực tuyến.
Mục tiêu:
Xác thực người dùng.
Kiểm tra quyền tham gia.
Tạo Participant Session.
Khởi tạo WebRTC Session.
Kích hoạt Attendance.
Thu thập Metrics.
Phát sinh Event.

2. Actors
Primary Actor:
Student
Instructor

Supporting Services:
API Gateway
Auth Service
User Service
Meeting Service
Attendance Service
Analytics Service
Notification Service
Monitoring Service
WebRTC SFU
Redis
Database


3. Preconditions
User đã đăng nhập.
Meeting tồn tại.
User thuộc lớp học.
Meeting chưa kết thúc.

4. Main Flow
User
 ↓
API Gateway
 ↓
Auth Service
 ↓
Meeting Service
 ↓
Attendance Service
 ↓
Analytics Service
 ↓
WebRTC SFU


5. Sequence Diagram
User
 │
 │ Join Meeting
 ▼
API Gateway
 │
 │ Validate JWT
 ▼
Auth Service
 │
 │ Get User
 ▼
User Service
 │
 │ User Valid
 ▼
Meeting Service
 │
 │ Get Meeting
 │
 │ Check Permission
 │
 │ Create Participant
 │
 │ Save Participant
 ▼
Database
 │
 │ Publish ParticipantJoined
 ▼
Message Broker
 │
 ├── Attendance Service
 ├── Analytics Service
 └── Monitoring Service
 │
 │ Generate Signaling Token
 ▼
WebRTC SFU
 │
 │ Return ICE Servers
 ▼
User


6. Detailed Steps

STEP-001
Actor:
User

Action:
Click Join Meeting

API:
API-020
POST /api/v1/meetings/{id}/join


STEP-002
Service:
Auth Service

Action:
Validate JWT.
Validate Session.
Validate User Status.

STEP-003
Service:
Meeting Service

Action:
Load Meeting.
Verify Meeting Status.
Verify Class Membership.

STEP-004
Service:
Meeting Service

Create:
Participant

Entity:
ENT-009 Participant

Table:
DB-031 participants


STEP-005
Service:
Meeting Service

Publish:
EVT-023 ParticipantJoined


STEP-006
Service:
Attendance Service

Consume:
EVT-023 ParticipantJoined

Action:
Create Attendance Session


STEP-007
Service:
Analytics Service

Consume:
EVT-023 ParticipantJoined

Action:
Start Connection Metric Collection


STEP-008
Service:
WebRTC SFU

Generate:
Signaling Token
ICE Servers
TURN Configuration

STEP-009
Return:
{
  "participantId": "uuid",
  "signalingToken": "jwt",
  "iceServers": [],
  "meetingState": "ACTIVE"
}


7. Events
Published:
EVT-023 ParticipantJoined

Consumed:
EVT-031 AttendanceRecorded
EVT-040 MetricCollected


8. Database Changes
Write:
DB-031 participants

Read:
DB-030 meetings
DB-020 classes
DB-001 users


9. Business Rules
BR-001
Meeting phải ở trạng thái:
SCHEDULED
ACTIVE


BR-002
User phải thuộc lớp học.

BR-003
Meeting không được kết thúc.

BR-004
Một User chỉ có một Participant Session đang hoạt động.

BR-005
Nếu mất kết nối và reconnect:
Reuse Existing Participant


10. Error Scenarios
ERR-001
Meeting Not Found.
HTTP:
404


ERR-002
User Not Authorized.
HTTP:
403


ERR-003
Meeting Ended.
HTTP:
409


ERR-004
Participant Already Exists.
HTTP:
409


ERR-005
WebRTC Server Unavailable.
HTTP:
503


11. Performance Requirements
Authentication:
< 100 ms


Join Meeting API:
< 500 ms


Participant Creation:
< 100 ms


WebRTC Signaling:
< 300 ms


12. Observability
Metrics:
Join Success Rate
Join Failure Rate
Average Join Time
Concurrent Participants
Logs:
Join Requested
Join Succeeded
Join Failed
Tracing:
API Gateway
     ↓
Meeting Service
     ↓
Attendance Service
     ↓
Analytics Service


13. Traceability
REQ-018 Join Meeting
      ↓
UC-011 Join Meeting
      ↓
API-020 Join Meeting
      ↓
SRV-005 Meeting Service
      ↓
ENT-009 Participant
      ↓
DB-031 participants
      ↓
EVT-023 ParticipantJoined
      ↓
TEST-011 Join Meeting Test


14. Postconditions
Participant được tạo.
Attendance được kích hoạt.
Analytics bắt đầu thu thập dữ liệu.
User kết nối vào WebRTC Session thành công.
Monitoring nhận được Event.


09.2 Sequence Design – Attendance Flow
1. Purpose
Mô tả luồng điểm danh tự động của hệ thống.
Mục tiêu:
Ghi nhận thời điểm tham gia lớp học.
Ghi nhận thời điểm rời lớp.
Theo dõi reconnect/disconnect.
Tính thời lượng tham gia.
Sinh báo cáo điểm danh.
Cung cấp dữ liệu cho Analytics.

2. Actors
Primary Actors:
Student
Instructor

Supporting Services:
Meeting Service
Attendance Service
Analytics Service
Monitoring Service
Notification Service
Database
Message Broker


3. Preconditions
Meeting đã được tạo.
User thuộc lớp học.
Meeting đang hoạt động.
Attendance Session đã được khởi tạo.

4. Main Flow
Meeting Service
        ↓
Participant Joined
        ↓
Attendance Service
        ↓
Attendance Record
        ↓
Analytics Service
        ↓
Dashboard


5. Sequence Diagram
Participant Joined
        ↓
Meeting Service
        ↓
Publish ParticipantJoined
        ↓
Message Broker
        ↓
Attendance Service
        ↓
Create Attendance Record
        ↓
Database
        ↓
Publish AttendanceRecorded
        ↓
Analytics Service
        ↓
Dashboard


6. Detailed Steps

STEP-001
Event:
EVT-023 ParticipantJoined

Producer:
SRV-005 Meeting Service

Consumer:
SRV-006 Attendance Service


STEP-002
Attendance Service:
Load Attendance Session

Entity:
ENT-011 AttendanceSession

Table:
DB-040 attendance_sessions


STEP-003
Create:
AttendanceRecord

Entity:
ENT-012 AttendanceRecord

Table:
DB-041 attendance_records


STEP-004
Save:
joined_at
attendance_status=IN_PROGRESS


STEP-005
Publish:
EVT-031 AttendanceRecorded


STEP-006
Analytics Service:
Consume:
EVT-031 AttendanceRecorded

Action:
Update Dashboard Metrics


7. Disconnect Flow
Participant Left
        ↓
Meeting Service
        ↓
Publish ParticipantLeft
        ↓
Attendance Service
        ↓
Update AttendanceRecord


STEP-007
Event:
EVT-024 ParticipantLeft


STEP-008
Attendance Service:
Update:
left_at
duration_seconds


STEP-009
Calculate:
attendance_percentage


STEP-010
Publish:
EVT-032 AttendanceCompleted


8. Reconnect Flow
Disconnect
      ↓
Reconnect
      ↓
Reuse Existing Attendance Record

Không tạo bản ghi mới.

9. Attendance Calculation Rules
Rule-001
duration_seconds
=
left_at - joined_at


Rule-002
attendance_percentage
=
duration_seconds
/
meeting_duration


Rule-003
Status:
PRESENT
ABSENT
LATE
PARTIAL


Rule-004
Ví dụ:
>= 80%      → PRESENT
50%-80%     → PARTIAL
< 50%       → ABSENT


10. Database Changes
Read:
DB-040 attendance_sessions
DB-030 meetings

Write:
DB-041 attendance_records


11. Events
Consumed:
EVT-023 ParticipantJoined
EVT-024 ParticipantLeft
EVT-022 MeetingEnded

Published:
EVT-031 AttendanceRecorded
EVT-032 AttendanceCompleted


12. Meeting End Flow
MeetingEnded
      ↓
Attendance Service
      ↓
Close Open Records
      ↓
Calculate Final Attendance
      ↓
Generate Report


13. Error Scenarios
ERR-001
Attendance Session Not Found.

ERR-002
Meeting Already Closed.

ERR-003
Duplicate Attendance Event.

ERR-004
Participant Not Found.

ERR-005
Database Unavailable.

14. Idempotency
Duplicate:
ParticipantJoined

Không được tạo:
AttendanceRecord

mới.
Sử dụng:
meeting_id
+
user_id

để deduplicate.

15. Performance Requirements
Attendance Recording:
< 100 ms

Attendance Report:
< 2 seconds


16. Observability
Metrics:
Attendance Success Rate
Attendance Failure Rate
Average Attendance Duration
Attendance Percentage
Logs:
Attendance Created
Attendance Updated
Attendance Completed
Tracing:
Meeting Service
      ↓
Attendance Service
      ↓
Analytics Service


17. Traceability
REQ-024 Attendance Tracking
      ↓
UC-015 Attendance Flow
      ↓
SRV-006 Attendance Service
      ↓
ENT-012 AttendanceRecord
      ↓
DB-041 attendance_records
      ↓
EVT-031 AttendanceRecorded
      ↓
TEST-020 Attendance Test


18. Postconditions
Attendance Record được lưu.
Attendance Percentage được tính toán.
Dashboard được cập nhật.
Attendance Report sẵn sàng cho giảng viên.
Analytics nhận được dữ liệu điểm danh.


09.3 Sequence Design – Analytics Flow
1. Purpose
Mô tả luồng thu thập, xử lý và phân tích dữ liệu của hệ thống.
Mục tiêu:
Thu thập dữ liệu thời gian thực.
Phân tích chất lượng kết nối.
Tính toán dữ liệu học tập.
Cập nhật Dashboard.
Hỗ trợ cảnh báo và chẩn đoán sự cố.

2. Actors
Primary Actors:
Instructor
Administrator
Operations Team

Supporting Services:
Meeting Service
Attendance Service
Analytics Service
Monitoring Service
Database
Message Broker
Dashboard
WebRTC Client


3. Data Sources
Meeting Events
MeetingStarted
MeetingEnded
ParticipantJoined
ParticipantLeft


Attendance Events
AttendanceRecorded
AttendanceCompleted


Connection Metrics
Latency
PacketLoss
Jitter
RTT
FPS
Bitrate


4. Main Flow
Client Metrics
      ↓
Analytics Service
      ↓
Metrics Storage
      ↓
Aggregation
      ↓
Dashboard
      ↓
Alerts


5. Sequence Diagram
WebRTC Client
      ↓
MetricCollected
      ↓
Analytics Service
      ↓
Store Metrics
      ↓
Aggregate Metrics
      ↓
Update Dashboard
      ↓
Monitoring Service
      ↓
Alerts


6. Detailed Flow

STEP-001
WebRTC Client định kỳ gửi:
latency
packetLoss
jitter
rtt
fps
bitrate

Interval:
Every 5 seconds

API:
POST /analytics/metrics


STEP-002
Analytics Service:
Validate:
meetingId
participantId
metric values

STEP-003
Create:
ConnectionMetric

Entity:
ENT-013 ConnectionMetric

Table:
DB-050 connection_metrics


STEP-004
Publish:
EVT-040 MetricCollected


STEP-005
Aggregate Metrics:
Average Latency
Average Packet Loss
Average Jitter
Average FPS
Average Bitrate


STEP-006
Update:
DashboardMetric

Entity:
ENT-015 DashboardMetric


STEP-007
Publish:
EVT-041 DashboardUpdated


7. Attendance Analytics Flow
AttendanceRecorded
        ↓
Analytics Service
        ↓
Attendance Statistics
        ↓
Dashboard

Calculate:
Attendance Percentage
Student Participation
Completion Rate

8. Learning Analytics Flow
MeetingEnded
      ↓
Analytics Service
      ↓
Generate Report
      ↓
Store Aggregated Data

Metrics:
Attendance Rate
Average Duration
Number of Participants
Completion Percentage

9. Connection Quality Analysis
Excellent
Latency < 100 ms
Packet Loss < 1%
Jitter < 20 ms


Good
Latency < 200 ms
Packet Loss < 3%
Jitter < 30 ms


Poor
Latency > 300 ms
Packet Loss > 5%
Jitter > 50 ms


10. Root Cause Analysis
User Side
Single Participant Affected


Host Side
Host Metrics Degraded


Infrastructure Side
All Participants Affected


11. Alert Flow
MetricCollected
      ↓
Threshold Evaluation
      ↓
Alert Raised
      ↓
Notification


Alert Rules
High Latency
Latency > 300 ms


High Packet Loss
PacketLoss > 5%


Low FPS
FPS < 10


Connection Lost
No Metrics > 30 seconds


12. Database Changes
Write:
DB-050 connection_metrics
DB-051 dashboard_metrics
DB-052 learning_metrics

Read:
DB-041 attendance_records
DB-030 meetings
DB-031 participants


13. Events
Consumed:
EVT-021 MeetingStarted
EVT-022 MeetingEnded
EVT-023 ParticipantJoined
EVT-024 ParticipantLeft
EVT-031 AttendanceRecorded
EVT-032 AttendanceCompleted

Published:
EVT-040 MetricCollected
EVT-041 DashboardUpdated


14. Error Scenarios
ERR-001
Metric Payload Invalid.

ERR-002
Participant Not Found.

ERR-003
Meeting Not Found.

ERR-004
Metrics Database Unavailable.

ERR-005
Aggregation Failed.

15. Performance Requirements
Metric Ingestion:
< 50 ms


Dashboard Refresh:
< 2 seconds


Report Generation:
< 10 seconds


16. Observability
Metrics:
Metrics Ingestion Rate
Dashboard Refresh Time
Alert Count
Analytics Processing Time
Logs:
Metric Received
Metric Stored
Dashboard Updated
Alert Raised
Tracing:
Meeting Service
      ↓
Attendance Service
      ↓
Analytics Service
      ↓
Monitoring Service


17. Traceability
REQ-030 Learning Analytics
      ↓
UC-020 Analytics Flow
      ↓
SRV-007 Analytics Service
      ↓
ENT-013 ConnectionMetric
      ↓
DB-050 connection_metrics
      ↓
EVT-040 MetricCollected
      ↓
TEST-028 Analytics Test


18. Postconditions
Metrics được lưu.
Dashboard được cập nhật.
Báo cáo được tạo.
Cảnh báo được sinh nếu vượt ngưỡng.
Dữ liệu sẵn sàng cho Monitoring và Reporting.


09.4 Sequence Design – Recording Flow
1. Purpose
Mô tả luồng ghi hình lớp học trực tuyến.
Mục tiêu:
Tự động hoặc thủ công bắt đầu ghi hình.
Ghi lại audio, video và screen sharing.
Lưu trữ file recording.
Sinh metadata.
Cho phép phát lại và tải xuống.

2. Actors
Primary Actors:
Instructor
Administrator

Supporting Services:
Meeting Service
Recording Service
Analytics Service
Notification Service
Monitoring Service
WebRTC SFU
Object Storage
Database
Message Broker


3. Preconditions
Meeting đã được tạo.
Meeting đang hoạt động.
Recording được bật.
Storage còn đủ dung lượng.

4. Main Flow
MeetingStarted
      ↓
Recording Service
      ↓
Media Recording
      ↓
Object Storage
      ↓
Metadata
      ↓
Notification


5. Sequence Diagram
Instructor
      ↓
Start Recording
      ↓
Meeting Service
      ↓
Recording Service
      ↓
WebRTC SFU
      ↓
Media Stream
      ↓
Recording File
      ↓
Object Storage
      ↓
Database
      ↓
Notification Service


6. Start Recording Flow

STEP-001
Event:
EVT-021 MeetingStarted

Producer:
SRV-005 Meeting Service

Consumer:
SRV-009 Recording Service


STEP-002
Recording Service:
Create:
Recording Session

Entity:
ENT-016 Recording


STEP-003
Request:
Start Recording

Target:
WebRTC SFU


STEP-004
WebRTC SFU:
Subscribe Audio Streams
Subscribe Video Streams
Subscribe Screen Sharing Streams

STEP-005
Publish:
EVT-050 RecordingStarted


7. Recording Processing Flow
Media Streams
      ↓
Recording Service
      ↓
Merge
      ↓
Encoding
      ↓
Final Video File


Supported Formats
MP4
WEBM


Metadata
Meeting ID
Instructor ID
Start Time
End Time
Duration
File Size

8. Stop Recording Flow

STEP-006
Event:
EVT-022 MeetingEnded


STEP-007
Recording Service:
Stop Recording.

STEP-008
Generate:
Recording File


STEP-009
Upload:
Object Storage


STEP-010
Save:
Recording Metadata

Table:
DB-060 recordings


STEP-011
Publish:
EVT-051 RecordingCompleted


9. Playback Flow
User
      ↓
Request Recording
      ↓
Recording Service
      ↓
Get Metadata
      ↓
Generate Signed URL
      ↓
Object Storage
      ↓
Video Playback


10. Download Flow
Authorization:
Instructor
Administrator
Authorized Student


Response
{
  "recordingId": "uuid",
  "playbackUrl": "signed-url",
  "expiresIn": 3600
}


11. Database Changes
Write:
DB-060 recordings
DB-061 media_files

Read:
DB-030 meetings
DB-031 participants


12. Events
Consumed:
EVT-021 MeetingStarted
EVT-022 MeetingEnded

Published:
EVT-050 RecordingStarted
EVT-051 RecordingCompleted


13. Error Scenarios
ERR-001
Storage Unavailable.

ERR-002
Recording Server Unavailable.

ERR-003
File Upload Failed.

ERR-004
Encoding Failed.

ERR-005
Recording Metadata Save Failed.

14. Retry Policy
Upload Retry
5 Attempts
Exponential Backoff


Metadata Save Retry
3 Attempts


15. Performance Requirements
Recording Start:
< 2 seconds


Recording Stop:
< 5 seconds


Playback URL Generation:
< 500 ms


16. Storage Policy
Hot Storage:
0-30 Days


Warm Storage:
30-180 Days


Cold Storage:
>180 Days


17. Observability
Metrics:
Recording Count
Recording Duration
Storage Usage
Upload Success Rate
Playback Requests
Logs:
Recording Started
Recording Stopped
Upload Completed
Playback Generated
Tracing:
Meeting Service
      ↓
Recording Service
      ↓
Object Storage
      ↓
Notification Service


18. Traceability
REQ-040 Recording Management
      ↓
UC-025 Recording Flow
      ↓
SRV-009 Recording Service
      ↓
ENT-016 Recording
      ↓
DB-060 recordings
      ↓
EVT-051 RecordingCompleted
      ↓
TEST-035 Recording Test


19. Postconditions
Recording File được lưu.
Metadata được lưu.
Playback URL sẵn sàng.
Notification được gửi.
Analytics có thể sử dụng dữ liệu recording.
Recording có thể được phát lại hoặc tải xuống.


