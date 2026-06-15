12.1 Unit Test Design
1. Purpose
Tài liệu này mô tả chiến lược kiểm thử đơn vị (Unit Testing) của hệ thống.
Mục tiêu:
Xác minh Business Logic hoạt động chính xác.
Phát hiện lỗi sớm.
Hỗ trợ Refactoring.
Đảm bảo chất lượng mã nguồn.
Tăng độ tin cậy của hệ thống.

2. Testing Pyramid
       E2E
       /   \
 Integration
    /       \
  Unit Tests

Target:
70% Unit Test
20% Integration Test
10% End-to-End Test


3. Unit Test Scope
Kiểm thử:
Domain Logic
Application Services
Domain Services
Validation Rules
Policies
Calculations
Specifications
Không kiểm thử:
Database
Message Broker
External APIs
SignalR
WebRTC
Redis

4. Unit Test Principles
Rule-001
Một test chỉ kiểm tra một hành vi.

Rule-002
Tests phải độc lập.

Rule-003
Tests phải deterministic.

Rule-004
Tests phải chạy nhanh.

Rule-005
Không phụ thuộc môi trường.

5. Test Structure
Pattern:
Arrange
Act
Assert


Ví dụ:
Given
When
Then


6. Test Folder Structure
tests
│
├── Unit
│   ├── Domain
│   ├── Application
│   ├── Services
│   └── Policies
│
├── Integration
│
└── EndToEnd


7. Naming Convention
Method_Scenario_ExpectedResult

Ví dụ:
CreateMeeting_ValidRequest_ShouldCreateMeeting
Login_InvalidPassword_ShouldFail
Attendance_StudentJoined_ShouldCreateRecord


8. Test Coverage Goals
Layer
Target
Domain
90%
Application
80%
Services
80%
Overall
80%


9. Domain Test Cases

Meeting Aggregate
TEST-001
StartMeeting_ShouldChangeStatusToActive


TEST-002
EndMeeting_ShouldChangeStatusToEnded


TEST-003
JoinMeeting_WhenEnded_ShouldThrowException


Attendance Aggregate
TEST-004
CalculateDuration_ShouldReturnCorrectValue


TEST-005
AttendancePercentage_ShouldBeCalculatedCorrectly


User Aggregate
TEST-006
AssignRole_ShouldUpdatePermissions


10. Application Service Tests

Auth Service
TEST-010
Login_ValidCredentials_ShouldReturnToken


TEST-011
Login_InvalidPassword_ShouldFail


TEST-012
Refresh_ValidToken_ShouldIssueNewToken


Meeting Service
TEST-013
CreateMeeting_ShouldPublishMeetingCreatedEvent


TEST-014
JoinMeeting_ShouldCreateParticipant


Attendance Service
TEST-015
ParticipantJoined_ShouldCreateAttendanceRecord


11. Policy Tests
TEST-020
Instructor_ShouldAccessOwnMeeting


TEST-021
Student_ShouldNotAccessOtherAttendance


TEST-022
Admin_ShouldAccessEverything


12. Validation Tests
TEST-030
CreateCourse_EmptyTitle_ShouldFail


TEST-031
CreateMeeting_InvalidDate_ShouldFail


TEST-032
CreateUser_InvalidEmail_ShouldFail


13. Event Tests
TEST-040
MeetingStarted_ShouldPublishEvent


TEST-041
AttendanceRecorded_ShouldPublishEvent


TEST-042
DuplicateEvent_ShouldBeIgnored


14. Mocking Strategy
Mock:
Repository
External Service
Message Broker
Cache
Clock
File Storage
Do Not Mock:
Domain Entities
Value Objects

15. Test Data Strategy
Use:
Builder Pattern

Ví dụ:
MeetingBuilder
UserBuilder
AttendanceBuilder


16. Example Test
[Fact]
public void CalculateDuration_ShouldReturnCorrectValue()
{
    var record = AttendanceBuilder.Create()
        .WithJoinTime(start)
        .WithLeaveTime(end)
        .Build();

    var duration = record.CalculateDuration();

    Assert.Equal(3600, duration);
}


17. CI Requirements
Unit Tests:
Run On Every Commit

Fail Build If:
Any Unit Test Fails


Coverage Threshold:
80%


18. Reporting
Metrics:
Total Tests
Passed Tests
Failed Tests
Coverage Percentage
Execution Time

19. Traceability
REQ-018 Join Meeting
      ↓
API-020 Join Meeting
      ↓
SRV-005 Meeting Service
      ↓
TEST-014 JoinMeeting_ShouldCreateParticipant


REQ-024 Attendance Tracking
      ↓
SRV-006 Attendance Service
      ↓
TEST-015 ParticipantJoined_ShouldCreateAttendanceRecord


20. Governance Rules
Mọi Business Rule phải có Unit Test.
Mọi Domain Service phải có Unit Test.
Mọi Policy phải có Unit Test.
Mọi Bug Fix phải có Regression Test.
Pull Request không được merge nếu Unit Test thất bại.


12.2 Integration Test Design
1. Purpose
Tài liệu này mô tả chiến lược kiểm thử tích hợp (Integration Testing) của hệ thống.
Mục tiêu:
Xác minh sự tương tác giữa các thành phần.
Phát hiện lỗi tích hợp.
Kiểm tra luồng nghiệp vụ end-to-end ở cấp service.
Xác thực API, Database và Event hoạt động đúng.

2. Scope
Kiểm thử:
API ↔ Service
Service ↔ Database
Service ↔ Message Broker
Service ↔ Cache
Service ↔ External Systems
Event Producer ↔ Consumer
Không kiểm thử:
UI
Browser Rendering
Manual User Flows

3. Integration Architecture
Test Runner
      ↓
Application
      ↓
Database
      ↓
Message Broker
      ↓
Redis
      ↓
External Services (Mock)


4. Test Environment
Dependencies:
PostgreSQL
Redis
RabbitMQ / Kafka
MinIO

Environment:
Docker Compose


5. Integration Test Categories
API Integration
Controller
      ↓
Application
      ↓
Database


Event Integration
Producer
      ↓
Broker
      ↓
Consumer


Persistence Integration
Repository
      ↓
Database


Cache Integration
Application
      ↓
Redis


External Service Integration
Application
      ↓
Storage
      ↓
Email
      ↓
Identity Provider


6. Folder Structure
tests
│
├── Unit
├── Integration
│   ├── Api
│   ├── Persistence
│   ├── Events
│   ├── Cache
│   └── External
└── EndToEnd


7. API Integration Tests

TEST-100
Login_ShouldReturnJwt


TEST-101
CreateCourse_ShouldPersistData


TEST-102
JoinMeeting_ShouldCreateParticipant


TEST-103
GetAttendanceReport_ShouldReturnData


8. Persistence Tests

TEST-110
UserRepository_ShouldSaveUser


TEST-111
MeetingRepository_ShouldLoadMeeting


TEST-112
AttendanceRepository_ShouldCalculateDuration


9. Event Integration Tests

TEST-120
MeetingStarted_ShouldCreateAttendanceSession

Flow:
Meeting Service
      ↓
RabbitMQ
      ↓
Attendance Service


TEST-121
ParticipantJoined_ShouldCreateAttendanceRecord


TEST-122
AttendanceRecorded_ShouldUpdateDashboard


TEST-123
MeetingEnded_ShouldStopRecording


10. Database Integration Tests
TEST-130
CreateMeeting_ShouldInsertMeeting


TEST-131
CreateParticipant_ShouldInsertParticipant


TEST-132
RecordingCompleted_ShouldInsertRecording


11. Cache Integration Tests
TEST-140
Presence_ShouldBeStoredInRedis


TEST-141
Permissions_ShouldBeCached


12. External Service Tests
TEST-150
Recording_ShouldUploadToStorage


TEST-151
Notification_ShouldSendEmail


TEST-152
Analytics_ShouldStoreMetrics


13. Test Data Management
Strategy:
Seed Data


Isolation:
Database Transaction Rollback


Alternative:
Database Per Test


14. Test Containers
Services:
PostgreSQL
RabbitMQ
Redis
MinIO

Lifecycle:
Start
      ↓
Run Tests
      ↓
Destroy


15. Example Flow Test
Join Meeting
POST /meetings/{id}/join
      ↓
Create Participant
      ↓
Publish Event
      ↓
Attendance Record Created

Assertions:
Participant Exists
Event Published
Attendance Record Exists

16. Event Assertions
Verify:
Event Published
Payload Correct
Consumer Processed
Side Effects Persisted

17. Failure Scenarios
TEST-160
DatabaseDown_ShouldReturnError


TEST-161
MessageBrokerUnavailable_ShouldRetry


TEST-162
StorageUnavailable_ShouldQueueUpload


18. Performance Requirements
API Integration Test:
< 5 seconds


Event Test:
< 10 seconds


Suite Runtime:
< 15 minutes


19. CI/CD Requirements
Integration Tests:
Run On Pull Request


Run Before:
Deploy To Staging


Fail Deployment If:
Any Critical Test Fails


20. Coverage Goals
Layer
Target
API
80%
Database
80%
Events
90%
Critical Flows
100%


21. Traceability
REQ-018 Join Meeting
      ↓
API-020 Join Meeting
      ↓
SRV-005 Meeting Service
      ↓
TEST-102 JoinMeeting_ShouldCreateParticipant


REQ-024 Attendance
      ↓
EVT-031 AttendanceRecorded
      ↓
SRV-007 Analytics Service
      ↓
TEST-122 AttendanceRecorded_ShouldUpdateDashboard


22. Governance Rules
Mọi API phải có Integration Test.
Mọi Repository phải có Integration Test.
Mọi Event phải có Producer-Consumer Test.
Mọi External Service phải có Contract Test.
Mọi Critical Flow phải có Integration Test.


12.3 Performance Test Design
1. Purpose
Tài liệu này mô tả chiến lược kiểm thử hiệu năng (Performance Testing) của hệ thống.
Mục tiêu:
Đánh giá khả năng chịu tải.
Xác định giới hạn hệ thống.
Phát hiện bottleneck.
Kiểm tra khả năng mở rộng.
Xác minh các Non-Functional Requirements.

2. Performance Objectives
Availability
99.9%


API Response Time
P95 < 500 ms
P99 < 1 second


Dashboard Refresh
< 2 seconds


Join Meeting
< 500 ms


SignalR Broadcast
< 100 ms


WebRTC Latency
< 300 ms


3. Test Categories
Load Testing
Kiểm tra tải bình thường.

Stress Testing
Kiểm tra vượt quá tải thiết kế.

Spike Testing
Kiểm tra tăng tải đột biến.

Endurance Testing
Kiểm tra tải dài hạn.

Scalability Testing
Kiểm tra khả năng scale.

Capacity Testing
Xác định giới hạn tối đa.

4. Test Environment
Staging Environment

Phải gần giống Production:
Database
Redis
Message Broker
Object Storage
SignalR
SFU

5. Test Data
Users:
100,000


Courses:
5,000


Classes:
10,000


Meetings:
20,000


Attendance Records:
10,000,000+


6. Workload Profiles
Normal
1,000 Concurrent Users


Peak
5,000 Concurrent Users


Extreme
10,000 Concurrent Users


7. API Load Tests
Login API
POST /auth/login

Target:
500 Requests/sec


Join Meeting API
POST /meetings/{id}/join

Target:
300 Requests/sec


Metrics API
POST /analytics/metrics

Target:
10,000 Requests/sec


8. Meeting Capacity Tests
Concurrent Meetings
500 Meetings


Participants per Meeting
300 Participants


Total Participants
10,000+


9. SignalR Tests
Active Connections
10,000


Broadcast Rate
1,000 Messages/sec


Presence Updates
5,000 Updates/sec


10. WebRTC Tests
Concurrent Streams
3,000+


Simultaneous Screen Sharing
100+


Reconnect Test
1,000 Reconnects


11. Analytics Tests
Metrics Ingestion:
50,000 Metrics/minute


Dashboard Refresh:
1 second interval


Alert Processing:
1,000 Alerts/minute


12. Database Tests
Transactions:
2,000 TPS


Read Queries:
10,000 QPS


Write Queries:
2,000 QPS


13. Recording Tests
Simultaneous Recordings:
100 Sessions


Upload Throughput:
500 MB/minute


Playback Requests:
500 Requests/minute


14. Endurance Tests
Duration:
24 Hours

Load:
Normal Peak Load

Validate:
Memory Leaks
Connection Leaks
Resource Exhaustion

15. Spike Tests
Scenario:
1,000 → 10,000 Users
within 2 minutes

Validate:
Autoscaling
Recovery
Queue Length

16. Stress Tests
Scenario:
150% Expected Capacity

Validate:
Graceful Degradation
Error Rate
Recovery Time

17. Success Criteria
Error Rate:
< 1%


CPU:
< 80%


Memory:
< 85%


Database Connections:
< 80%


18. Monitoring During Tests
Metrics:
CPU
Memory
Network
Disk
Database
Redis
RabbitMQ
SignalR
SFU

19. Bottleneck Analysis
Collect:
Slow Queries
Thread Starvation
Queue Length
Connection Pool Usage
GC Time
Lock Contention

20. Performance Tools
API Load:
k6
JMeter


Browser:
Playwright


Realtime:
Custom SignalR Load Generator


Infrastructure:
Prometheus
Grafana


21. Reporting
Generate:
Throughput
Latency
Error Rate
Resource Usage
Bottlenecks
Capacity Recommendations

22. Exit Criteria
System passes when:
All SLA Targets Met

AND
No Critical Bottlenecks

AND
No Resource Exhaustion


23. Traceability
NFR-001 Performance
      ↓
Join Meeting SLA
      ↓
Performance Tests
      ↓
Performance Report


NFR-002 Scalability
      ↓
SignalR Capacity Test
      ↓
WebRTC Capacity Test
      ↓
Capacity Report


24. Governance Rules
Mọi API công khai phải có Load Test.
Mọi luồng realtime phải có Stress Test.
Mọi release lớn phải chạy Endurance Test.
Mọi thay đổi kiến trúc phải chạy Capacity Test.
Không được triển khai production nếu chưa đạt SLA.


