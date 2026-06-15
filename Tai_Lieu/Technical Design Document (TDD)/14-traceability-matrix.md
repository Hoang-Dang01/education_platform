# 14. Requirement Traceability Matrix (RTM)

> **Mục đích:** Liên kết end-to-end từ Functional Requirement → Use Case → Domain → Service → API → Database Table → Event → Test Case. Đảm bảo không có "orphan" component nào không có requirement, và không có requirement nào không được implement.
> **Tham chiếu:** SRS 01_Functional_Requirements.md · TDD 06-api-design.md · TDD 08-event-design.md · TDD 07-database-design.md · User Stories 02_Use_Case_Specifications.md
> **Source of Truth:** SRS 01_Functional_Requirements.md — mọi FR-ID và tên FR trong tài liệu này phải khớp tuyệt đối với file đó.

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

### 3.1 Authentication & Session Management

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-AUTH-001 | Đăng nhập bằng email/password | UC-AUTH-001 | SRV-001 | API-001 `POST /auth/login` | `users`, `sessions` | `SessionCreated` | TC-AUTH-001 |
| FR-AUTH-002 | Đăng xuất & thu hồi token | UC-AUTH-001 | SRV-001 | API-003 `POST /auth/logout` | `sessions` | `SessionRevoked` | TC-AUTH-002 |
| FR-AUTH-003 | Làm mới Access Token (Refresh) | UC-AUTH-001 | SRV-001 | API-002 `POST /auth/refresh` | `sessions` | — | TC-AUTH-003 |
| FR-AUTH-004 | Yêu cầu khôi phục mật khẩu | UC-AUTH-001 | SRV-001 | `POST /auth/forgot-password` | `users` | `PasswordResetRequested` | TC-AUTH-004 |
| FR-AUTH-005 | Thiết lập lại mật khẩu mới | UC-AUTH-001 | SRV-001 | `POST /auth/reset-password` | `users` | `PasswordChanged` | TC-AUTH-005 |
| FR-AUTH-006 | Quản lý phiên đăng nhập & Force Logout | UC-AUTH-001 | SRV-001 | `GET /auth/sessions` · `DELETE /auth/sessions/{id}` | `sessions` | `SessionRevoked` | TC-AUTH-006 |

---

### 3.2 User Management & RBAC

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-USR-001 | Tạo và quản lý tài khoản người dùng | UC-ADM-001 | SRV-002 | API-004 `POST /users` · API-006 `PUT /users/{id}` | `users`, `user_roles` | `UserCreated` · `UserDeactivated` | TC-USR-001 |
| FR-USR-002 | Kiểm soát quyền truy cập theo vai trò (RBAC) | UC-ADM-001 | SRV-002 | *(middleware — áp dụng cho tất cả endpoints)* | `roles`, `permissions`, `user_roles` | — | TC-USR-002 |
| FR-USR-003 | Audit Log cho hành động quan trọng | UC-ADM-001 | SRV-002 | `GET /audit-logs` | `audit_logs` | — | TC-USR-003 |
| FR-USR-004 | Notification / Alert gửi đến người dùng | UC-ADM-001 | SRV-010 | *(consume domain events → push notification)* | `notifications` | `NotificationSent` | TC-USR-004 |
| FR-USR-005 | Quản lý cấu hình vận hành hệ thống | UC-ADM-001 | SRV-002 | `GET /admin/config` · `PUT /admin/config` | *(config store)* | `ConfigUpdated` | TC-USR-005 |

---

### 3.3 LMS — Course & Class Management

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-LMS-001 | Tạo khóa học mới | UC-LMS-001 | SRV-003 | API-009 `POST /courses` | `courses` | `CourseCreated` | TC-LMS-001 |
| FR-LMS-002 | Cập nhật thông tin khóa học | UC-LMS-001 | SRV-003 | API-011 `PUT /courses/{id}` | `courses` | `CourseUpdated` | TC-LMS-002 |
| FR-LMS-003 | Kích hoạt / Ngừng hoạt động khóa học | UC-LMS-001 | SRV-003 | API-011 `PUT /courses/{id}` | `courses` | `CourseStatusChanged` | TC-LMS-003 |
| FR-LMS-004 | Tìm kiếm và lọc khóa học | UC-LMS-001 | SRV-003 | API-013 `GET /courses` | `courses` | — | TC-LMS-004 |
| FR-LMS-005 | Tạo lớp học mới | UC-LMS-001 | SRV-003 | API-014 `POST /classes` | `classes` | `ClassCreated` | TC-LMS-005 |
| FR-LMS-006 | Quản lý giáo viên phụ trách lớp | UC-LMS-001 | SRV-003 | API-017 `POST /classes/{id}/instructors` | `enrollments` | `TeacherAssigned` | TC-LMS-006 |
| FR-LMS-007 | Quản lý danh sách học viên trong lớp | UC-LMS-001 | SRV-003 | API-016 `POST /classes/{id}/students` | `enrollments` | `StudentEnrolled` | TC-LMS-007 |
| FR-LMS-008 | Tạo lịch học cho lớp | UC-LMS-001 | SRV-003 | API-018 `POST /meetings` | `meetings`, `classes` | `ScheduleCreated` · `MeetingCreated` | TC-LMS-008 |
| FR-LMS-009 | Chỉnh sửa và hủy lịch học | UC-LMS-001 | SRV-003 | `PUT /meetings/{id}` · `DELETE /meetings/{id}` | `meetings` | `ScheduleCancelled` | TC-LMS-009 |

---

### 3.4 Online Meeting (WebRTC)

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-MTG-001 | Tham gia phòng học trực tuyến | UC-MTG-001 | SRV-005 | API-020 `POST /meetings/{id}/join` | `meetings`, `participants` | `ParticipantJoined` | TC-MTG-001 |
| FR-MTG-002 | Rời phòng học / Kết thúc buổi học | UC-MTG-001 | SRV-005 | API-021 `POST /meetings/{id}/leave` · API-022 `POST /meetings/{id}/end` | `meetings`, `participants` | `ParticipantLeft` · `MeetingEnded` | TC-MTG-002 |
| FR-MTG-003 | Tự động reconnect khi mất kết nối | UC-MTG-001 | SRV-005 | *(WebSocket event — không có REST endpoint)* | `participants` | `ParticipantDisconnected` · `ParticipantRejoined` | TC-MTG-003 |
| FR-MTG-004 | Bật / Tắt camera | UC-MTG-001 | SRV-005 | *(WebRTC signaling / WebSocket toggle)* | — | `CameraToggled` | TC-MTG-004 |
| FR-MTG-005 | Bật / Tắt microphone | UC-MTG-001 | SRV-005 | *(WebRTC signaling / WebSocket toggle)* | — | `MicToggled` | TC-MTG-005 |
| FR-MTG-006 | Chia sẻ màn hình | UC-MTG-001 | SRV-005 | *(WebRTC DataChannel / SFU track)* | — | `ScreenShareStarted` · `ScreenShareStopped` | TC-MTG-006 |
| FR-MTG-007 | Chat trong lớp học | UC-MTG-001 | SRV-005 | `POST /meetings/{id}/chat` · `GET /meetings/{id}/chat` | *(chat store)* | `ChatMessageSent` | TC-MTG-007 |
| FR-MTG-008 | Quản lý phát biểu (Raise Hand) | UC-MTG-001 | SRV-005 | *(WebSocket — raise/lower hand event)* | — | `RaiseHandRequested` · `RaiseHandGranted` | TC-MTG-008 |
| FR-MTG-009 | Chia nhóm thảo luận (Breakout Room) | UC-MTG-001 | SRV-005 | `POST /meetings/{id}/breakout` · `DELETE /meetings/{id}/breakout` | — | `BreakoutCreated` · `BreakoutEnded` | TC-MTG-009 |
| FR-MTG-010 | Ghi hình buổi học | UC-MTG-002 | SRV-011 | API-031 `POST /recordings/start` · API-032 `POST /recordings/stop` · API-033 `GET /recordings/{id}` | `recordings` | `RecordingStarted` · `RecordingStopped` · `RecordingCompleted` | TC-MTG-010 |

---

### 3.5 Attendance (Điểm danh tự động)

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-ATT-001 | Tự động ghi nhận sự kiện tham gia (JOIN/LEAVE/DISCONNECT/RECONNECT) | UC-ATT-001 | SRV-006 | *(consume: ParticipantJoined · ParticipantLeft · ParticipantDisconnected · ParticipantRejoined)* | `attendance_sessions`, `attendance_records` | — | TC-ATT-001 |
| FR-ATT-002 | Tính tổng thời gian tham gia thực tế | UC-ATT-001 | SRV-006 | *(internal calculation, consume MeetingEnded)* | `attendance_records` | — | TC-ATT-002 |
| FR-ATT-003 | Tính tỷ lệ tham gia và đánh giá Đạt / Không đạt | UC-ATT-001 | SRV-006 | *(internal calculation)* | `attendance_records` | `AttendanceRecorded` | TC-ATT-003 |
| FR-ATT-004 | Thống kê số lần mất kết nối | UC-ATT-001 | SRV-006 | `GET /attendance/students/{id}/sessions/{sessionId}` | `attendance_records` | — | TC-ATT-004 |
| FR-ATT-005 | Xem lịch sử tham gia từng buổi học | UC-ATT-002 | SRV-006 | API-027 `GET /attendance/students/{id}` | `attendance_records` | — | TC-ATT-005 |
| FR-ATT-006 | Xuất báo cáo điểm danh | UC-ATT-002 | SRV-006 | API-026 `GET /attendance/reports/{classId}?format=xlsx\|csv\|pdf` | `attendance_records` | `ReportGenerated` | TC-ATT-006 |

---

### 3.6 Document Management

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-DOC-001 | Upload tài liệu học tập | UC-DOC-001 | SRV-004 | `POST /documents` | `materials` | `DocumentUploaded` | TC-DOC-001 |
| FR-DOC-002 | Download tài liệu (Presigned URL) | UC-DOC-002 | SRV-004 | `GET /documents/{id}/download` | `materials` | — | TC-DOC-002 |
| FR-DOC-003 | Tìm kiếm tài liệu | UC-DOC-001 | SRV-004 | `GET /documents?keyword={}&classId={}` | `materials` | — | TC-DOC-003 |
| FR-DOC-004 | Quản lý quyền truy cập tài liệu | UC-DOC-001 | SRV-004 | `PUT /documents/{id}/access` | `materials` | `DocumentAccessRevoked` | TC-DOC-004 |

---

### 3.7 Report & Export

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-RPT-001 | Báo cáo học viên | UC-RPT-001 | SRV-007 | `GET /reports/students/{id}` | `attendance_records`, `connection_metrics` | — | TC-RPT-001 |
| FR-RPT-002 | Báo cáo lớp học | UC-RPT-001 | SRV-007 | API-030 `GET /analytics/classes/{classId}` | `attendance_records`, `connection_metrics` | — | TC-RPT-002 |
| FR-RPT-003 | Báo cáo khóa học | UC-RPT-001 | SRV-007 | `GET /reports/courses/{courseId}` | `attendance_records`, `enrollments` | — | TC-RPT-003 |
| FR-RPT-004 | Báo cáo vận hành hệ thống | UC-RPT-001 | SRV-007 | `GET /reports/system` | `connection_metrics`, `alerts`, `incident_logs` | — | TC-RPT-004 |
| FR-RPT-005 | Bộ lọc và tùy chỉnh báo cáo | UC-RPT-001 | SRV-007 | *(query params trên tất cả GET /reports endpoints)* | — | — | TC-RPT-005 |
| FR-RPT-006 | Xuất báo cáo (Excel / CSV / PDF) | UC-RPT-001 | SRV-007 | `GET /reports/*?format=xlsx\|csv\|pdf` | `attendance_records` | `ReportGenerated` | TC-RPT-006 |
| FR-RPT-007 | Lập lịch gửi báo cáo tự động | UC-RPT-001 | SRV-007 | `POST /reports/schedules` · `GET /reports/schedules` | *(schedule store)* | `ScheduledReportSent` | TC-RPT-007 |

---

### 3.8 Realtime Monitoring

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-MON-001 | Dashboard tổng quan hệ thống | UC-MON-001 | SRV-008 | API-028 `GET /analytics/dashboard` | `connection_metrics`, `alerts` | — | TC-MON-001 |
| FR-MON-002 | Giám sát chi tiết từng lớp học | UC-MON-001 | SRV-008 | API-029 `GET /analytics/metrics?roomId={id}` | `connection_metrics` | — | TC-MON-002 |
| FR-MON-003 | Giám sát từng người tham gia trong lớp | UC-MON-001 | SRV-008 | `GET /monitoring/participants/{id}` | `connection_metrics` | — | TC-MON-003 |
| FR-MON-004 | Hiển thị chỉ số chất lượng kết nối realtime | UC-MON-001 | SRV-008 | `GET /monitoring/metrics` | `connection_metrics` | `MetricCollected` | TC-MON-004 |
| FR-MON-005 | Tự động phát sinh cảnh báo chất lượng | UC-MON-001 | SRV-008 | *(internal threshold check — publish AlertRaised)* | `alerts` | `AlertRaised` | TC-MON-005 |

---

### 3.9 Telemetry & Network Analytics

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-TEL-001 | Thu thập dữ liệu telemetry từ WebRTC | UC-MON-001 | SRV-008 | `POST /telemetry` | `connection_metrics` | `MetricCollected` | TC-TEL-001 |
| FR-TEL-002 | Đánh giá chất lượng kết nối tự động (5 mức) | UC-MON-001 | SRV-008 | *(internal calculation — kết quả trả về trong telemetry response)* | `connection_metrics` | — | TC-TEL-002 |

---

### 3.10 Network Diagnostics (Rule Engine)

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-NDX-001 | Phân tích nguyên nhân sự cố bằng Rule Engine (Rule 01–08) | UC-NDX-001 | SRV-009 | *(consume AlertRaised)* · `GET /diagnostics/{sessionId}` · `PUT /diagnostics/{id}/acknowledge` | `incident_logs` | `IncidentDetected` · `IncidentResolved` | TC-NDX-001 |
| FR-NDX-002 | Gợi ý xử lý sự cố | UC-NDX-001 | SRV-009 | `GET /diagnostics/{sessionId}/recommendations` | `incident_logs` | — | TC-NDX-002 |

---

### 3.11 Notification Center

| FR | Tên | UC | SRV | API | DB Table | Event | TC |
|:--|:--|:--|:--|:--|:--|:--|:--|
| FR-NTF-001 | Đọc và quản lý trạng thái thông báo | UC-NTF-001 | SRV-010 | `GET /notifications` · `PATCH /notifications/{id}/read` · `PATCH /notifications/read-all` | `notifications` | — | TC-NTF-001 |
| FR-NTF-002 | Lịch sử thông báo | UC-NTF-001 | SRV-010 | `GET /notifications/history` | `notifications` | — | TC-NTF-002 |
| FR-NTF-003 | Cơ chế gửi lại khi lỗi (Retry) | UC-NTF-001 | SRV-010 | *(internal retry queue — exponential backoff, max 3 lần)* | `notifications` | `NotificationFailed` · `NotificationSent` | TC-NTF-003 |
| FR-NTF-004 | Cấu hình nhận thông báo (Preference Matrix) | UC-NTF-001 | SRV-010 | `GET /notifications/preferences` · `PUT /notifications/preferences` | *(preferences store)* | — | TC-NTF-004 |
| FR-NTF-005 | Chống trùng lặp thông báo (Deduplication) | UC-NTF-001 | SRV-010 | *(internal dedup logic — window 2 phút)* | `notifications` | — | TC-NTF-005 |

---

## 4. Database Table Ownership Matrix

| DB Table | Owner Service | Viết bởi | Đọc bởi |
|:--|:--|:--|:--|
| `users` | SRV-002 User Service | Auth, User | Tất cả (qua JWT claim) |
| `roles`, `permissions`, `user_roles` | SRV-002 User Service | User | Auth |
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
| `UserDeactivated` | SRV-002 | SRV-001 (Auth), SRV-010 | Thu hồi token, thông báo |
| `SessionCreated` | SRV-001 | — | — |
| `SessionRevoked` | SRV-001 | — | — |
| `CourseCreated` | SRV-003 | — | — |
| `StudentEnrolled` | SRV-003 | SRV-010 (Notification) | Thông báo cho học viên |
| `ScheduleCreated` | SRV-003 | SRV-005 (Meeting), SRV-010 | Tạo meeting room, thông báo |
| `ScheduleCancelled` | SRV-003 | SRV-010 | Thông báo hủy lịch |
| `MeetingStarted` | SRV-005 | SRV-006 (Attendance), SRV-010 | Bắt đầu attendance session |
| `ParticipantJoined` | SRV-005 | SRV-006 (Attendance), SRV-008 (Analytics) | Ghi JOIN event |
| `ParticipantDisconnected` | SRV-005 | SRV-006 (Attendance) | Ghi DISCONNECT event |
| `ParticipantRejoined` | SRV-005 | SRV-006 (Attendance) | Ghi RECONNECT event |
| `ParticipantLeft` | SRV-005 | SRV-006 (Attendance) | Ghi LEAVE event |
| `MeetingEnded` | SRV-005 | SRV-006 (Attendance), SRV-011 (Recording), SRV-010 | Chốt điểm danh, lưu recording, thông báo |
| `RecordingStarted` | SRV-011 | SRV-010 (Notification) | Thông báo đang ghi hình |
| `RecordingStopped` | SRV-011 | SRV-011 (internal transcode) | Bắt đầu transcode |
| `RecordingCompleted` | SRV-011 | SRV-010 (Notification) | Thông báo hoàn tất |
| `AttendanceRecorded` | SRV-006 | SRV-008 (Analytics) | Cập nhật learning metrics |
| `MetricCollected` | SRV-008 | SRV-008 (internal threshold check) | Kiểm tra ngưỡng cảnh báo |
| `AlertRaised` | SRV-008 | SRV-009 (Diagnostics), SRV-010 (Notification) | Chẩn đoán + push alert |
| `IncidentDetected` | SRV-009 | SRV-010 (Notification) | Thông báo Admin/Manager |
| `IncidentResolved` | SRV-009 | — | — |
| `NotificationSent` | SRV-010 | — | — |
| `NotificationFailed` | SRV-010 | SRV-010 (retry queue) | Retry gửi lại |
| `ReportGenerated` | SRV-007 | SRV-010 | Thông báo báo cáo sẵn sàng tải |

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
BUG-017: Tỷ lệ điểm danh tính sai khi student reconnect nhiều lần
    ↓
GET /attendance/students/{id} trả về thời gian không khớp
    ↓
SRV-006 Attendance Service — AttendanceCalculator module
    ↓
FR-ATT-002 Tính tổng thời gian tham gia thực tế
    ↓
UC-ATT-001 Điểm danh tự động
    ↓
TC-ATT-002 cần cập nhật test case: multiple disconnect/reconnect scenario
```

---

## 7. Change Impact Analysis

Khi thay đổi 1 Requirement, các thành phần sau **bắt buộc** phải được review:

| Requirement thay đổi | Review bắt buộc |
|:--|:--|
| FR-MTG-001 (Join Meeting) | UC-MTG-001 · API-020 · SRV-005 · DB: participants · EVT: ParticipantJoined · TC-MTG-001 |
| FR-ATT-002 (Tính thời gian tham gia) | UC-ATT-001 · SRV-006 · DB: attendance_records · FR-ATT-003 (tỷ lệ phụ thuộc vào giá trị này) · TC-ATT-002 |
| FR-MON-005 (Ngưỡng cảnh báo) | UC-MON-001 · SRV-008 · EVT: AlertRaised · FR-NDX-001 (Rule Engine nhận input từ alert) |
| FR-NDX-001 (Rule Engine) | UC-NDX-001 · SRV-009 · DB: incident_logs · EVT: IncidentDetected · TC-NDX-001 |
| FR-TEL-001 (Telemetry ingestion) | FR-MON-004 (hiển thị metric) · FR-MON-005 (threshold check) · FR-TEL-002 (quality scoring) · DB: connection_metrics |

---

## 8. Coverage Summary

| Module | Số FR | Có UC | Có API/Event | Có TC | Coverage |
|:--|:--|:--|:--|:--|:--|
| Authentication (FR-AUTH) | 6 | ✅ | ✅ | ✅ | 100% |
| User Management (FR-USR) | 5 | ✅ | ✅ | ✅ | 100% |
| LMS (FR-LMS) | 9 | ✅ | ✅ | ✅ | 100% |
| Meeting (FR-MTG) | 10 | ✅ | ✅ | ✅ | 100% |
| Attendance (FR-ATT) | 6 | ✅ | ✅ | ✅ | 100% |
| Document (FR-DOC) | 4 | ✅ | ✅ | ✅ | 100% |
| Report (FR-RPT) | 7 | ✅ | ✅ | ✅ | 100% |
| Monitoring (FR-MON) | 5 | ✅ | ✅ | ✅ | 100% |
| Telemetry (FR-TEL) | 2 | ✅ | ✅ | ✅ | 100% |
| Diagnostics (FR-NDX) | 2 | ✅ | ✅ | ✅ | 100% |
| Notification (FR-NTF) | 5 | ✅ | ✅ | ✅ | 100% |
| **Total** | **61** | **✅** | **✅** | **✅** | **100%** |
