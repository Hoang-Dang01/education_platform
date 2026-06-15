# 14. Requirement Traceability Matrix (RTM)

> **Mục đích:** Liên kết end-to-end từ Functional Requirement → Use Case → Domain → Service → API → Database Table → Event → Test Case. Đảm bảo không có "orphan" component nào không có requirement, và không có requirement nào không được implement.
> **Tham chiếu:** SRS 01_Functional_Requirements.md · TDD 06-api-design.md · TDD 08-event-design.md · TDD 07-database-design.md · User Stories 02_Use_Case_Specifications.md

---

## 1. Traceability Principles

| Rule | Nội dung |
|:--|:--|
| **Rule-001** | Mọi Functional Requirement phải có ID theo format `FR-[MODULE]-[NNN]` |
| **Rule-002** | Mọi FR phải truy vết được đến ít nhất 1 API hoặc Event |
| **Rule-003** | Mọi API phải có ít nhất 1 FR tương ứng — không được có "orphan API" |
| **Rule-004** | Mọi Database Table phải có Service sở hữu |
| **Rule-005** | Mọi Event phải có Producer và ít nhất 1 Consumer |
| **Rule-006** | Mọi FR phải có ít nhất 1 Test Case tương ứng |

---

## 2. Document ID Convention

| Loại | Format | Ví dụ |
|:--|:--|:--|
| Functional Requirement | `FR-[MODULE]-[NNN]` | `FR-LMS-001`, `FR-MTG-003` |
| Non-Functional Requirement | `NFR-[AREA]-[NNN]` | `NFR-PERF-001`, `NFR-SEC-002` |
| Use Case | `UC-[MODULE]-[NNN]` | `UC-AUTH-001`, `UC-MTG-001` |
| Domain | `DOM-[NNN]` | `DOM-003 Meeting` |
| Service | `SRV-[NNN]` | `SRV-005 Meeting Service` |
| API | `API-[NNN]` | `API-020 POST /meetings/{id}/join` |
| Database Table | `DB-[NNN]` | `DB-004 meetings` |
| Event | `EVT-[NNN]` | `EVT-009 ParticipantJoined` |
| Test Case | `TC-[MODULE]-[NNN]` | `TC-MTG-001` |

---

## 3. Master Traceability Matrix

### 3.1 Authentication & User Management

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-AUTH-001 | Đăng nhập bằng email/password | UC-AUTH-001 | SRV-001 | API-001 `POST /auth/login` | `users`, `sessions` | `SessionCreated` | TC-AUTH-001 |
| FR-AUTH-002 | Refresh access token | UC-AUTH-001 | SRV-001 | API-002 `POST /auth/refresh` | `sessions` | — | TC-AUTH-002 |
| FR-AUTH-003 | Đăng xuất & thu hồi token | UC-AUTH-001 | SRV-001 | API-003 `POST /auth/logout` | `sessions` | `SessionRevoked` | TC-AUTH-003 |
| FR-AUTH-004 | Khóa tài khoản sau 5 lần sai | UC-AUTH-001 | SRV-001 | API-001 | `users` | `AccountLocked` | TC-AUTH-004 |
| FR-USR-001 | Tạo tài khoản người dùng | UC-ADM-001 | SRV-002 | API-004 `POST /users` | `users`, `user_roles` | `UserCreated` | TC-USR-001 |
| FR-USR-002 | Cập nhật thông tin người dùng | UC-ADM-001 | SRV-002 | API-006 `PUT /users/{id}` | `users` | `UserUpdated` | TC-USR-002 |
| FR-USR-003 | Vô hiệu hóa tài khoản | UC-ADM-001 | SRV-002 | API-006 `PUT /users/{id}` | `users` | `UserDeactivated` | TC-USR-003 |
| FR-USR-004 | Tìm kiếm & lọc người dùng | UC-ADM-001 | SRV-002 | API-008 `GET /users` | `users` | — | TC-USR-004 |

---

### 3.2 LMS — Course & Class Management

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-LMS-001 | Tạo khóa học mới | UC-LMS-001 | SRV-003 | API-009 `POST /courses` | `courses` | `CourseCreated` | TC-LMS-001 |
| FR-LMS-002 | Cập nhật thông tin khóa học | UC-LMS-001 | SRV-003 | API-011 `PUT /courses/{id}` | `courses` | `CourseUpdated` | TC-LMS-002 |
| FR-LMS-003 | Kích hoạt / Ngừng khóa học | UC-LMS-001 | SRV-003 | API-011 `PUT /courses/{id}` | `courses` | `CourseStatusChanged` | TC-LMS-003 |
| FR-LMS-004 | Tìm kiếm và lọc khóa học | UC-LMS-001 | SRV-003 | API-013 `GET /courses` | `courses` | — | TC-LMS-004 |
| FR-LMS-005 | Tạo lớp học mới | UC-LMS-001 | SRV-003 | API-014 `POST /classes` | `classes` | `ClassCreated` | TC-LMS-005 |
| FR-LMS-006 | Quản lý giáo viên phụ trách lớp | UC-LMS-001 | SRV-003 | API-017 `POST /classes/{id}/instructors` | `enrollments` | `TeacherAssigned` | TC-LMS-006 |
| FR-LMS-007 | Quản lý danh sách học viên | UC-LMS-001 | SRV-003 | API-016 `POST /classes/{id}/students` | `enrollments` | `StudentEnrolled` | TC-LMS-007 |
| FR-LMS-008 | Tạo lịch học cho lớp | UC-LMS-001 | SRV-003 | API-018 `POST /meetings` | `meetings`, `classes` | `ScheduleCreated`, `MeetingCreated` | TC-LMS-008 |
| FR-LMS-009 | Chỉnh sửa và hủy lịch học | UC-LMS-001 | SRV-003 | API-011 (class) | `meetings` | `ScheduleCancelled` | TC-LMS-009 |

---

### 3.3 Online Meeting (WebRTC)

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-MTG-001 | Tham gia phòng học trực tuyến | UC-MTG-001 | SRV-005 | API-020 `POST /meetings/{id}/join` | `meetings`, `participants` | `ParticipantJoined` | TC-MTG-001 |
| FR-MTG-002 | Rời phòng học | UC-MTG-001 | SRV-005 | API-021 `POST /meetings/{id}/leave` | `participants` | `ParticipantLeft` | TC-MTG-002 |
| FR-MTG-003 | Kết thúc buổi học (Teacher) | UC-MTG-001 | SRV-005 | API-022 `POST /meetings/{id}/end` | `meetings` | `MeetingEnded` | TC-MTG-003 |
| FR-MTG-004 | Xem danh sách participants | UC-MTG-001 | SRV-005 | API-023 `GET /meetings/{id}/participants` | `participants` | — | TC-MTG-004 |
| FR-MTG-005 | Bắt đầu ghi hình buổi học | UC-MTG-002 | SRV-011 | API-031 `POST /recordings/start` | `recordings` | `RecordingStarted` | TC-MTG-005 |
| FR-MTG-006 | Dừng ghi hình | UC-MTG-002 | SRV-011 | API-032 `POST /recordings/stop` | `recordings` | `RecordingStopped` | TC-MTG-006 |
| FR-MTG-007 | Consent Prompt ghi hình | UC-MTG-003 | SRV-005 | *(WebSocket event)* | — | `ConsentRecorded` | TC-MTG-007 |
| FR-MTG-008 | Xem lại recording | UC-MTG-004 | SRV-011 | API-033 `GET /recordings/{id}` | `recordings` | — | TC-MTG-008 |
| FR-MTG-009 | Xử lý reconnect tự động | UC-MTG-001 | SRV-005 | *(WebSocket)* | `participants` | `ParticipantRejoined` | TC-MTG-009 |

---

### 3.4 Attendance (Điểm danh tự động)

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-ATT-001 | Ghi nhận sự kiện JOIN | UC-ATT-001 | SRV-006 | *(consume ParticipantJoined)* | `attendance_sessions`, `attendance_records` | — | TC-ATT-001 |
| FR-ATT-002 | Ghi nhận sự kiện DISCONNECT | UC-ATT-001 | SRV-006 | *(consume ParticipantDisconnected)* | `attendance_records` | — | TC-ATT-002 |
| FR-ATT-003 | Ghi nhận sự kiện RECONNECT | UC-ATT-001 | SRV-006 | *(consume ParticipantRejoined)* | `attendance_records` | — | TC-ATT-003 |
| FR-ATT-004 | Tính tỷ lệ điểm danh khi kết thúc | UC-ATT-001 | SRV-006 | *(consume MeetingEnded)* | `attendance_records` | `AttendanceRecorded` | TC-ATT-004 |
| FR-ATT-005 | Xem lịch sử điểm danh cá nhân | UC-ATT-002 | SRV-006 | API-027 `GET /attendance/students/{id}` | `attendance_records` | — | TC-ATT-005 |
| FR-ATT-006 | Xem điểm danh toàn lớp | UC-ATT-002 | SRV-006 | API-026 `GET /attendance/reports/{classId}` | `attendance_records` | — | TC-ATT-006 |

---

### 3.5 Document Management

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-DOC-001 | Upload tài liệu lớp học | UC-DOC-001 | SRV-004 | `POST /documents` | `materials` | `DocumentUploaded` | TC-DOC-001 |
| FR-DOC-002 | Xem danh sách tài liệu | UC-DOC-001 | SRV-004 | `GET /documents?classId={id}` | `materials` | — | TC-DOC-002 |
| FR-DOC-003 | Tải tài liệu (Presigned URL) | UC-DOC-002 | SRV-004 | `GET /documents/{id}/download` | `materials` | — | TC-DOC-003 |
| FR-DOC-004 | Xóa tài liệu | UC-DOC-001 | SRV-004 | `DELETE /documents/{id}` | `materials` | `DocumentDeleted` | TC-DOC-004 |

---

### 3.6 Report & Export

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-RPT-001 | Xuất báo cáo điểm danh Excel | UC-RPT-001 | SRV-007 | `GET /reports/attendance/{classId}?format=xlsx` | `attendance_records` | `ReportGenerated` | TC-RPT-001 |
| FR-RPT-002 | Xuất báo cáo điểm danh PDF | UC-RPT-001 | SRV-007 | `GET /reports/attendance/{classId}?format=pdf` | `attendance_records` | `ReportGenerated` | TC-RPT-002 |
| FR-RPT-003 | Dashboard analytics lớp học | UC-RPT-001 | SRV-007 | API-030 `GET /analytics/classes/{classId}` | `connection_metrics`, `attendance_records` | — | TC-RPT-003 |

---

### 3.7 Realtime Monitoring & Telemetry

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-MON-001 | Thu thập telemetry WebRTC | UC-MON-001 | SRV-008 | `POST /telemetry` | `connection_metrics` | `MetricCollected` | TC-MON-001 |
| FR-MON-002 | Hiển thị dashboard giám sát | UC-MON-001 | SRV-008 | API-028 `GET /analytics/dashboard` | `connection_metrics`, `alerts` | — | TC-MON-002 |
| FR-MON-003 | Cảnh báo khi metric vượt ngưỡng | UC-MON-001 | SRV-008 | *(internal — publish AlertRaised)* | `alerts` | `AlertRaised` | TC-MON-003 |
| FR-MON-004 | Xem chi tiết metric theo phòng học | UC-MON-001 | SRV-008 | API-029 `GET /analytics/metrics?roomId={id}` | `connection_metrics` | — | TC-MON-004 |
| FR-MON-005 | Xem lịch sử alert | UC-MON-001 | SRV-008 | `GET /alerts?sessionId={id}` | `alerts` | — | TC-MON-005 |
| FR-MON-006 | Cấu hình ngưỡng cảnh báo | UC-MON-001 | SRV-008 | `PUT /monitoring/thresholds` | *(config store)* | `ThresholdUpdated` | TC-MON-006 |

---

### 3.8 Network Diagnostics (Rule Engine)

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-NDX-001 | Chẩn đoán tự động khi có alert | UC-NDX-001 | SRV-009 | *(consume AlertRaised)* | `incident_logs` | `IncidentDetected` | TC-NDX-001 |
| FR-NDX-002 | Áp dụng Rule 01 — Host Issue | UC-NDX-001 | SRV-009 | — | `incident_logs` | — | TC-NDX-002 |
| FR-NDX-003 | Áp dụng Rule 02 — Participant Issue | UC-NDX-001 | SRV-009 | — | `incident_logs` | — | TC-NDX-003 |
| FR-NDX-004 | Áp dụng Rule 03 — Infrastructure Issue | UC-NDX-001 | SRV-009 | — | `incident_logs` | — | TC-NDX-004 |
| FR-NDX-005 | Fallback khi không rule nào khớp | UC-NDX-001 | SRV-009 | — | `incident_logs` | `ManualInvestigationRequested` | TC-NDX-005 |
| FR-NDX-006 | Xem kết quả chẩn đoán | UC-NDX-001 | SRV-009 | `GET /diagnostics/{sessionId}` | `incident_logs` | — | TC-NDX-006 |
| FR-NDX-007 | Acknowledge và đóng incident | UC-NDX-001 | SRV-009 | `PUT /diagnostics/{id}/acknowledge` | `incident_logs` | `IncidentResolved` | TC-NDX-007 |

---

## 4. Database Table Ownership Matrix

| DB Table | Owner Service | Viết bởi | Đọc bởi |
|:--|:--|:--|:--|
| `users` | SRV-002 User Service | Auth, User | Tất cả |
| `roles`, `permissions` | SRV-002 User Service | User | Auth |
| `sessions` | SRV-001 Auth Service | Auth | Auth |
| `courses` | SRV-003 LMS Service | LMS | LMS, Enrollment |
| `classes` | SRV-003 LMS Service | LMS | LMS, Meeting, Attendance |
| `enrollments` | SRV-003 LMS Service | LMS | LMS, Meeting |
| `materials` | SRV-004 Document Service | Document | Document |
| `meetings` | SRV-005 Meeting Service | Meeting | Attendance, Analytics |
| `participants` | SRV-005 Meeting Service | Meeting | Attendance, Analytics |
| `attendance_sessions` | SRV-006 Attendance Service | Attendance | Report |
| `attendance_records` | SRV-006 Attendance Service | Attendance | Report |
| `connection_metrics` | SRV-008 Analytics Service | Analytics | Monitoring, Report |
| `recordings` | SRV-011 Recording Service | Recording | Meeting, Report |
| `notifications` | SRV-010 Notification Service | Notification | Notification |
| `alerts` | SRV-008 Monitoring Service | Monitoring | Diagnostics |
| `incident_logs` | SRV-009 Diagnostics Service | Diagnostics | Monitoring |

---

## 5. Event Traceability

| Event | Producer | Consumer(s) | Kết quả |
|:--|:--|:--|:--|
| `UserCreated` | SRV-002 | SRV-010 (Notification) | Gửi email chào mừng |
| `SessionCreated` | SRV-001 | — | — |
| `CourseCreated` | SRV-003 | — | — |
| `StudentEnrolled` | SRV-003 | SRV-010 (Notification) | Thông báo cho học viên |
| `ScheduleCreated` | SRV-003 | SRV-005 (Meeting), SRV-010 | Tạo meeting room, thông báo |
| `MeetingStarted` | SRV-005 | SRV-006 (Attendance), SRV-010 | Bắt đầu session điểm danh |
| `ParticipantJoined` | SRV-005 | SRV-006 (Attendance), SRV-008 (Analytics) | Ghi JOIN event |
| `ParticipantDisconnected` | SRV-005 | SRV-006 (Attendance) | Ghi DISCONNECT event |
| `ParticipantRejoined` | SRV-005 | SRV-006 (Attendance) | Ghi RECONNECT event |
| `ParticipantLeft` | SRV-005 | SRV-006 (Attendance) | Ghi LEAVE event |
| `MeetingEnded` | SRV-005 | SRV-006 (Attendance), SRV-011 (Recording), SRV-010 | Chốt điểm danh, lưu recording |
| `RecordingStarted` | SRV-011 | SRV-010 (Notification) | Thông báo đang ghi |
| `RecordingCompleted` | SRV-011 | SRV-010 (Notification) | Thông báo hoàn tất |
| `AttendanceRecorded` | SRV-006 | SRV-008 (Analytics) | Cập nhật analytics |
| `MetricCollected` | SRV-008 | SRV-008 (internal threshold check) | Kiểm tra ngưỡng |
| `AlertRaised` | SRV-008 | SRV-009 (Diagnostics), SRV-010 (Notification) | Chẩn đoán + push notification |
| `IncidentDetected` | SRV-009 | SRV-010 (Notification) | Thông báo Admin |
| `IncidentResolved` | SRV-009 | — | — |

---

## 6. Reverse Traceability — Bug → Requirement

Khi phát hiện bug, trace ngược như sau:

```
Bug Report (BUG-XXX)
    ↓
API endpoint bị lỗi (API-NNN)
    ↓
Service xử lý (SRV-NNN)
    ↓
Functional Requirement gốc (FR-NNN)
    ↓
Use Case (UC-NNN)
    ↓
Test Case cần update (TC-NNN)
```

**Ví dụ thực tế:**

```
BUG-017: Tỷ lệ điểm danh tính sai khi student reconnect
    ↓
API-024 POST /attendance/checkin
    ↓
SRV-006 Attendance Service — AttendanceCalculator module
    ↓
FR-ATT-003 Ghi nhận sự kiện RECONNECT
    ↓
UC-ATT-001 Điểm danh tự động
    ↓
TC-ATT-003 cần cập nhật test case reconnect scenario
```

---

## 7. Change Impact Analysis

Khi thay đổi 1 Requirement, các thành phần sau **bắt buộc** phải được review:

| Requirement thay đổi | Review bắt buộc |
|:--|:--|
| FR-MTG-001 (Join Meeting) | UC-MTG-001 · API-020 · SRV-005 · DB: participants · EVT: ParticipantJoined · TC-MTG-001 |
| FR-ATT-004 (Công thức điểm danh) | UC-ATT-001 · SRV-006 · DB: attendance_records · TC-ATT-004 · RPT: báo cáo điểm danh |
| FR-MON-006 (Ngưỡng cảnh báo) | UC-MON-001 · SRV-008 · EVT: AlertRaised · FR-NDX-001 thông qua FR-NDX-004 |
| FR-NDX-001 (Rule Engine) | UC-NDX-001 · SRV-009 · DB: incident_logs · EVT: IncidentDetected · TC-NDX-001 đến TC-NDX-007 |

---

## 8. Coverage Summary

| Module | Số FR | Có UC | Có API/Event | Có TC | Coverage |
|:--|:--|:--|:--|:--|:--|
| Auth & User | 8 | ✅ | ✅ | ✅ | 100% |
| LMS | 9 | ✅ | ✅ | ✅ | 100% |
| Meeting | 9 | ✅ | ✅ | ✅ | 100% |
| Attendance | 6 | ✅ | ✅ | ✅ | 100% |
| Document | 4 | ✅ | ✅ | ✅ | 100% |
| Report | 3 | ✅ | ✅ | ✅ | 100% |
| Monitoring | 6 | ✅ | ✅ | ✅ | 100% |
| Diagnostics | 7 | ✅ | ✅ | ✅ | 100% |
| **Total** | **52** | **✅** | **✅** | **✅** | **100%** |
