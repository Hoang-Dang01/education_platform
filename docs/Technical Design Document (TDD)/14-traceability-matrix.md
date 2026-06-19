13. Requirement Traceability Matrix (RTM)
1. Purpose
Tài liệu này định nghĩa khả năng truy vết (Traceability) end-to-end của toàn bộ hệ thống.
Mục tiêu:
Liên kết tất cả tài liệu.
Kiểm soát phạm vi (Scope Control).
Hỗ trợ Change Impact Analysis.
Hỗ trợ Testing và QA.
Hỗ trợ Audit và Compliance.
Hỗ trợ bảo trì dài hạn.

2. Traceability Principles
Rule-001
Mọi Requirement phải có ID.

Rule-002
Mọi tài liệu phải có ID.

Rule-003
Mọi Requirement phải truy vết được đến Test Case.

Rule-004
Không được tồn tại thành phần "mồ côi" (Orphan).
Ví dụ:
API không có Requirement.
Database không có Use Case.
Test không có Requirement.


3. Document Hierarchy
Requirement
      ↓
Use Case
      ↓
Domain
      ↓
Service
      ↓
Module
      ↓
API
      ↓
Database
      ↓
Event
      ↓
Sequence
      ↓
Test Case


4. Document ID Convention
Requirements
REQ-001
REQ-002
REQ-003


Use Cases
UC-001
UC-002
UC-003


Domains
DOM-001
DOM-002
DOM-003


Services
SRV-001
SRV-002
SRV-003


Modules
MOD-001
MOD-002
MOD-003


APIs
API-001
API-002
API-003


Database
DB-001
DB-002
DB-003


Events
EVT-001
EVT-002
EVT-003


Sequences
SEQ-001
SEQ-002
SEQ-003


Tests
TEST-001
TEST-002
TEST-003


5. Requirement Traceability Matrix
Requirement
Use Case
Service
API
Database
Event
Test
REQ-001
UC-001
SRV-001
API-001
DB-001
EVT-001
TEST-001
REQ-002
UC-003
SRV-005
API-020
DB-031
EVT-023
TEST-014
REQ-003
UC-015
SRV-006
API-030
DB-041
EVT-031
TEST-015


6. Example – Join Meeting
REQ-018 Join Meeting
      ↓
UC-011 Join Meeting
      ↓
DOM-003 Meeting
      ↓
SRV-005 Meeting Service
      ↓
MOD-022 Participant Module
      ↓
API-020 POST /meetings/{id}/join
      ↓
DB-031 participants
      ↓
EVT-023 ParticipantJoined
      ↓
SEQ-001 Join Meeting Flow
      ↓
TEST-014 JoinMeeting_ShouldCreateParticipant


7. Example – Attendance
REQ-024 Attendance Tracking
      ↓
UC-015 Attendance Flow
      ↓
DOM-004 Attendance
      ↓
SRV-006 Attendance Service
      ↓
MOD-030 Attendance Module
      ↓
API-031 POST /attendance/checkin
      ↓
DB-041 attendance_records
      ↓
EVT-031 AttendanceRecorded
      ↓
SEQ-002 Attendance Flow
      ↓
TEST-015 ParticipantJoined_ShouldCreateAttendanceRecord


8. Example – Recording
REQ-040 Recording Management
      ↓
UC-025 Recording Flow
      ↓
DOM-007 Recording
      ↓
SRV-009 Recording Service
      ↓
MOD-045 Recording Module
      ↓
API-060 GET /recordings/{id}
      ↓
DB-060 recordings
      ↓
EVT-051 RecordingCompleted
      ↓
SEQ-004 Recording Flow
      ↓
TEST-035 Recording Test


9. Reverse Traceability
From Bug
BUG-017
      ↓
API-020
      ↓
SRV-005
      ↓
REQ-018


From Database
DB-041
      ↓
API-031
      ↓
UC-015
      ↓
REQ-024


From Test
TEST-015
      ↓
REQ-024


10. Change Impact Analysis
Requirement Changed
REQ-018
      ↓
UC-011
      ↓
SRV-005
      ↓
API-020
      ↓
DB-031
      ↓
EVT-023
      ↓
TEST-014

Tất cả thành phần trên phải được review.

11. Coverage Matrix
Requirement Coverage
Requirement
        ↓
Implementation
        ↓
Test

Coverage:
100%


Orphan Detection
Phát hiện:
APIs không có Requirement.
Tables không có Service.
Tests không có Requirement.
Events không có Consumer.

12. Traceability Repository Structure
traceability/
│
├── requirements.xlsx
├── use-cases.xlsx
├── services.xlsx
├── apis.xlsx
├── database.xlsx
├── events.xlsx
├── tests.xlsx
└── traceability-matrix.xlsx


13. Recommended Metadata
Mỗi tài liệu nên có:
id: REQ-018
name: Join Meeting
status: Approved
owner: Architecture Team
version: 1.0
related:
  - UC-011
  - API-020
  - DB-031
  - EVT-023


14. Governance Rules
Mọi Requirement phải có Test.
Mọi API phải có Requirement.
Mọi Database Table phải có Owner Service.
Mọi Event phải có Producer và Consumer.
Mọi Bug phải truy vết được đến Requirement.
Mọi thay đổi phải cập nhật RTM.

15. Enterprise Traceability Chain
Business Goal
      ↓
Requirement
      ↓
Use Case
      ↓
Domain
      ↓
Service
      ↓
Module
      ↓
API
      ↓
Database
      ↓
Event
      ↓
Sequence
      ↓
Test
      ↓
Deployment
      ↓
Monitoring
      ↓
Incident
      ↓
Bug
      ↓
Requirement

Đây là vòng đời truy vết hoàn chỉnh của một hệ thống enterprise.


