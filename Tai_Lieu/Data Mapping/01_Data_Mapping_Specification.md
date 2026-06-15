# 01. Data Mapping Specification (Đặc tả ánh xạ dữ liệu)

> **Mục đích:** Định nghĩa chính xác cách ánh xạ từng trường dữ liệu từ hệ thống cũ (Legacy LMS) sang hệ thống mới (Zoom Education Platform). Đây là tài liệu làm việc cho kỹ sư ETL.
> **Tham chiếu:** TDD 07-database-design.md · Data Mapping 02_Data_Model_ERD.md · Data Mapping 03_Data_Migration_Strategy.md

---

## Quy ước ký hiệu

| Ký hiệu | Ý nghĩa |
|:--|:--|
| `PK` | Primary Key |
| `FK` | Foreign Key |
| `GEN` | Generate mới — không lấy từ nguồn |
| `CONST` | Giá trị cố định (constant) |
| `MAP` | Tra bảng chuyển đổi |
| `CALC` | Tính toán từ các trường khác |
| `SKIP` | Không migrate — bỏ qua |
| `HASH` | Cần hash lại |

---

## 1. Bảng `users`

**Legacy source:** `old_users`

| # | Source Field | Source Type | Target Field | Target Type | Transform Rule | Ghi chú |
|:--|:--|:--|:--|:--|:--|:--|
| 1 | `usr_id` (INT) | INT | `id` | UUID | `GEN` — tạo UUID mới, lưu mapping vào `temp_id_mappings` | Không dùng lại integer ID |
| 2 | `usr_email` | VARCHAR(100) | `email` | VARCHAR(255) | `LOWER(TRIM(usr_email))` | Chuẩn hóa lowercase |
| 3 | `usr_password` | VARCHAR(60) | `password_hash` | VARCHAR(255) | `HASH` — rehash bằng bcrypt (cost=12) | Mật khẩu cũ có thể là MD5/SHA1 |
| 4 | `usr_fullname` | VARCHAR(150) | `full_name` | VARCHAR(255) | `TRIM(usr_fullname)` | |
| 5 | `usr_avatar` | TEXT | `avatar_url` | TEXT | Copy if not null, else `NULL` | |
| 6 | `usr_status` | TINYINT (0/1) | `status` | VARCHAR(20) | `MAP: 1→'Active', 0→'Inactive'` | |
| 7 | `usr_created` | DATETIME | `created_at` | TIMESTAMPTZ | `CONVERT to UTC` | |
| 8 | `usr_updated` | DATETIME | `updated_at` | TIMESTAMPTZ | `CONVERT to UTC` | |
| 9 | *(không có)* | — | `deleted_at` | TIMESTAMPTZ | `CONST: NULL` | Soft delete mới |

**Validation rule:** `email` phải unique. Nếu duplicate → ghi log, giữ bản ghi `created_at` cũ nhất, đánh dấu bản còn lại là `Inactive`.

---

## 2. Bảng `roles`

**Legacy source:** `old_roles`

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `role_id` (INT) | `id` (UUID) | `GEN` + lưu mapping |
| 2 | `role_name` | `name` | `TRIM(UPPER(role_name))` |
| 3 | `role_desc` | `description` | Copy |
| 4 | *(không có)* | `created_at` | `CONST: migration_date` |

**Seed data bắt buộc (nếu legacy thiếu):**

| `name` | `description` |
|:--|:--|
| `ADMIN` | Quản trị viên hệ thống |
| `MANAGER` | Quản lý đào tạo |
| `TEACHER` | Giảng viên |
| `STUDENT` | Học viên |

---

## 3. Bảng `user_roles` (quan hệ User ↔ Role)

**Legacy source:** `old_user_roles` hoặc cột `usr_role` trong `old_users`

| # | Source | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `old_users.usr_id` | `user_id` (UUID) | Tra `temp_id_mappings` |
| 2 | `old_users.usr_role` | `role_id` (UUID) | `MAP: 'admin'→ADMIN_UUID, 'teacher'→TEACHER_UUID, 'student'→STUDENT_UUID` |
| 3 | *(không có)* | `assigned_at` | `CONST: migration_date` |

---

## 4. Bảng `courses`

**Legacy source:** `old_courses`

| # | Source Field | Source Type | Target Field | Target Type | Transform Rule |
|:--|:--|:--|:--|:--|:--|
| 1 | `course_id` | INT | `id` | UUID | `GEN` + mapping |
| 2 | `course_code` | VARCHAR(20) | `code` | VARCHAR(50) | `TRIM(UPPER(course_code))` |
| 3 | `course_name` | VARCHAR(200) | `title` | VARCHAR(500) | `TRIM` |
| 4 | `course_desc` | TEXT | `description` | TEXT | Copy |
| 5 | `is_active` | TINYINT | `status` | VARCHAR(20) | `MAP: 1→'Active', 0→'Inactive'` |
| 6 | `created_by` | INT | `created_by` | UUID | Tra `temp_id_mappings` (users) |
| 7 | `created_at` | DATETIME | `created_at` | TIMESTAMPTZ | Convert UTC |
| 8 | `updated_at` | DATETIME | `updated_at` | TIMESTAMPTZ | Convert UTC |

---

## 5. Bảng `classes`

**Legacy source:** `old_classes`

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `class_id` | `id` | `GEN` + mapping |
| 2 | `class_code` | `code` | `TRIM(UPPER)` |
| 3 | `class_name` | `name` | `TRIM` |
| 4 | `course_id` | `course_id` | Tra `temp_id_mappings` (courses) |
| 5 | `start_date` | `start_date` | Convert UTC |
| 6 | `end_date` | `end_date` | Convert UTC |
| 7 | `class_status` | `status` | `MAP: 'active'→'Active', 'closed'→'Completed', 'pending'→'Scheduled'` |
| 8 | `created_at` | `created_at` | Convert UTC |

---

## 6. Bảng `enrollments` (quan hệ User ↔ Class ↔ Course)

**Legacy source:** `old_enrollments`

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `enroll_id` | `id` | `GEN` |
| 2 | `user_id` | `user_id` | Tra mapping |
| 3 | `course_id` | `course_id` | Tra mapping |
| 4 | `class_id` | `class_id` | Tra mapping |
| 5 | `role_in_class` | `role` | `MAP: 'instructor'→'Teacher', 'learner'→'Student'` |
| 6 | `enroll_date` | `enrolled_at` | Convert UTC |

---

## 7. Bảng `meetings`

**Legacy source:** `old_sessions` / `old_meetings`

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `session_id` | `id` | `GEN` + mapping |
| 2 | `class_id` | `class_id` | Tra mapping |
| 3 | `session_title` | `title` | `TRIM` |
| 4 | `meeting_pin` | `meeting_code` | Copy nếu unique, else `GEN` mã mới |
| 5 | `session_status` | `status` | `MAP: 'scheduled'→'Scheduled', 'ongoing'→'Live', 'finished'→'Ended'` |
| 6 | `scheduled_time` | `scheduled_at` | Convert UTC |
| 7 | `actual_start` | `started_at` | Convert UTC, NULL nếu chưa bắt đầu |
| 8 | `actual_end` | `ended_at` | Convert UTC, NULL nếu chưa kết thúc |
| 9 | `created_at` | `created_at` | Convert UTC |

---

## 8. Bảng `participants`

**Legacy source:** `old_session_participants`

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `part_id` | `id` | `GEN` |
| 2 | `session_id` | `meeting_id` | Tra mapping (meetings) |
| 3 | `user_id` | `user_id` | Tra mapping (users) |
| 4 | `joined_time` | `joined_at` | Convert UTC |
| 5 | `left_time` | `left_at` | Convert UTC, NULL nếu chưa rời |
| 6 | `participant_role` | `role` | `MAP: 'host'→'Host', 'participant'→'Participant'` |
| 7 | *(không có)* | `connection_status` | `CONST: 'Disconnected'` (tất cả đã kết thúc) |

---

## 9. Bảng `attendance_sessions`

**Legacy source:** `old_attendance_sessions`

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `att_session_id` | `id` | `GEN` + mapping |
| 2 | `session_id` | `meeting_id` | Tra mapping (meetings) |
| 3 | `started_at` | `started_at` | Convert UTC |
| 4 | `ended_at` | `ended_at` | Convert UTC |

**Xử lý thiếu:** Nếu legacy không có `attendance_sessions` riêng → tạo 1 record/meeting với `started_at = meetings.started_at`, `ended_at = meetings.ended_at`.

---

## 10. Bảng `attendance_records`

**Legacy source:** `old_attendance` (điểm danh thủ công cũ)

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `att_id` | `id` | `GEN` |
| 2 | `att_session_id` | `attendance_session_id` | Tra mapping |
| 3 | `user_id` | `user_id` | Tra mapping |
| 4 | `check_in_time` | `joined_at` | Convert UTC |
| 5 | `check_out_time` | `left_at` | Convert UTC |
| 6 | `duration_min` | `duration_seconds` | `duration_min × 60` |
| 7 | `status` | `attendance_status` | `MAP: 'present'→'Present', 'absent'→'Absent', 'late'→'Late'` |
| 8 | `created_at` | `created_at` | Convert UTC |

**Lưu ý:** Legacy chỉ có điểm danh thủ công. Dữ liệu event-based (JOIN/DISCONNECT) **không có** trong legacy — bắt đầu thu thập từ ngày go-live.

---

## 11. Bảng `connection_metrics`

**Legacy source:** Không có (NEW — bắt đầu thu thập từ go-live)

| # | Target Field | Giá trị |
|:--|:--|:--|
| — | Toàn bộ bảng | `SKIP` — không migrate, chỉ thu thập từ hệ thống mới |

---

## 12. Bảng `recordings`

**Legacy source:** `old_recordings` (nếu có)

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `rec_id` | `id` | `GEN` + mapping |
| 2 | `session_id` | `meeting_id` | Tra mapping |
| 3 | `file_path` | `file_path` | Copy đường dẫn mới sau khi migrate file sang Object Storage |
| 4 | `duration_sec` | `duration_seconds` | Copy |
| 5 | `file_size_mb` | `file_size` | `file_size_mb × 1048576` (convert sang bytes) |
| 6 | `recorded_at` | `created_at` | Convert UTC |

**Lưu ý:** File vật lý cần được copy sang Object Storage mới và đường dẫn `file_path` phải được cập nhật sau khi copy thành công.

---

## 13. Bảng `materials` (tài liệu lớp học)

**Legacy source:** `old_materials`

| # | Source Field | Target Field | Transform Rule |
|:--|:--|:--|:--|
| 1 | `mat_id` | `id` | `GEN` + mapping |
| 2 | `class_id` | `class_id` | Tra mapping |
| 3 | `mat_title` | `title` | `TRIM` |
| 4 | `mat_type` | `type` | `MAP: 'pdf'→'PDF', 'video'→'Video', 'doc'→'Document'` |
| 5 | `file_url` | `file_path` | Copy sau khi migrate file |
| 6 | `uploaded_by` | `uploaded_by` | Tra mapping (users) |
| 7 | `upload_date` | `created_at` | Convert UTC |

---

## 14. Bảng `notifications`

**Legacy source:** Không có (NEW)

| # | Target Field | Giá trị |
|:--|:--|:--|
| — | Toàn bộ bảng | `SKIP` — bắt đầu từ go-live, không migrate thông báo cũ |

---

## 15. Tóm tắt quyết định Migration

| Bảng | Migrate | Lý do nếu Skip |
|:--|:--:|:--|
| `users` | ✅ | Core entity |
| `roles` | ✅ | Seed data |
| `user_roles` | ✅ | Phụ thuộc users + roles |
| `courses` | ✅ | Core entity |
| `classes` | ✅ | Core entity |
| `enrollments` | ✅ | Quan hệ |
| `meetings` | ✅ | Lịch sử buổi học |
| `participants` | ✅ | Lịch sử tham gia |
| `attendance_sessions` | ✅ | Tạo synthetic từ meetings |
| `attendance_records` | ✅ | Lịch sử điểm danh thủ công cũ |
| `connection_metrics` | ❌ | Không có trong legacy |
| `recordings` | ✅ (có điều kiện) | Chỉ migrate nếu file vật lý còn |
| `materials` | ✅ | Tài liệu lớp học |
| `notifications` | ❌ | Thông báo cũ không cần thiết |

---

## 16. Bảng tạm phục vụ Migration

| Tên bảng | Mục đích | Xóa sau khi |
|:--|:--|:--|
| `temp_id_mappings` | Lưu cặp `(legacy_id, new_uuid)` cho mọi entity | Sau khi reconciliation pass 100% |
| `migration_error_log` | Ghi lỗi theo từng record (bảng, legacy_id, lỗi) | Sau khi tất cả lỗi được xử lý |
| `migration_progress` | Offset/status từng bảng để resume nếu bị ngắt | Sau khi migration hoàn tất |
