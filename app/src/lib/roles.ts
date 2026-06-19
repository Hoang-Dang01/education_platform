/**
 * RBAC — PHÂN QUYỀN THEO VAI TRÒ
 *
 * Nguồn duy nhất (single source of truth) cho vai trò người dùng và ma trận
 * phân quyền, bám theo BRD mục 2 "Phân loại người dùng".
 *
 * Khi cần thêm/bớt quyền, chỉ sửa ở tệp này — UI và logic nghiệp vụ đều tra
 * cứu qua `can()` thay vì kiểm tra role bằng tay (vd `role === 'teacher'`).
 */

// 4 vai trò theo BRD 2.1 - 2.4
export type UserRole = 'admin' | 'manager' | 'teacher' | 'student';

// Danh sách hành động được kiểm soát — tương ứng BRD 2.5 (Ma trận phân quyền)
export type Permission =
  | 'manage_users'       // Quản lý người dùng
  | 'manage_courses'     // Quản lý khóa học
  | 'manage_classes'     // Quản lý lớp học
  | 'manage_students'    // Quản lý học viên
  | 'host_session'       // Tổ chức lớp học trực tuyến
  | 'join_session'       // Tham gia lớp học
  | 'share_materials'    // Chia sẻ tài liệu
  | 'take_attendance'    // Điểm danh
  | 'monitor_classes'    // Giám sát lớp học
  | 'view_reports';      // Xem báo cáo

// Thông tin hiển thị cho từng vai trò
export interface RoleMeta {
  /** Nhãn tiếng Việt hiển thị trên UI */
  label: string;
  /** Mô tả ngắn vai trò */
  description: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  admin: {
    label: 'Quản trị viên',
    description: 'Quản trị toàn bộ hệ thống, người dùng và vận hành.',
  },
  manager: {
    label: 'Quản lý đào tạo',
    description: 'Điều phối và giám sát hoạt động đào tạo được phân công.',
  },
  teacher: {
    label: 'Giáo viên',
    description: 'Tổ chức và điều hành các buổi học trực tuyến.',
  },
  student: {
    label: 'Học viên',
    description: 'Tham gia các lớp học và chương trình đào tạo.',
  },
};

/**
 * Ma trận phân quyền — sao chép trực tiếp từ BRD 2.5.
 *
 *  Chức năng                  | Admin | Manager | Teacher | Student
 *  Quản lý người dùng         |  Có   |    -    |    -    |    -
 *  Quản lý khóa học           |  Có   |   Có    |    -    |    -
 *  Quản lý lớp học            |  Có   |   Có    |   Có*   |    -
 *  Quản lý học viên           |  Có   |   Có    |   Có    |    -
 *  Tổ chức lớp học trực tuyến |  Có   |   Có    |   Có    |    -
 *  Tham gia lớp học           |  Có   |   Có    |   Có    |   Có
 *  Chia sẻ tài liệu           |  Có   |   Có    |   Có    |    -
 *  Điểm danh                  |  Có   |   Có    |   Có    |    -
 *  Giám sát lớp học           |  Có   |   Có    |    -    |    -
 *  Xem báo cáo                |  Có   |   Có    |  Có**   |    -
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'manage_users',
    'manage_courses',
    'manage_classes',
    'manage_students',
    'host_session',
    'join_session',
    'share_materials',
    'take_attendance',
    'monitor_classes',
    'view_reports',
  ],
  manager: [
    'manage_courses',
    'manage_classes',
    'manage_students',
    'host_session',
    'join_session',
    'share_materials',
    'take_attendance',
    'monitor_classes',
    'view_reports',
  ],
  teacher: [
    'manage_classes',     // * trong phạm vi lớp được phân công
    'manage_students',
    'host_session',
    'join_session',
    'share_materials',
    'take_attendance',
    'view_reports',       // ** chỉ lớp phụ trách
  ],
  student: [
    'join_session',
  ],
};

/** Kiểm tra một vai trò có quyền thực hiện hành động hay không. */
export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Lấy nhãn tiếng Việt của vai trò (an toàn với giá trị lạ). */
export function roleLabel(role: UserRole): string {
  return ROLE_META[role]?.label ?? 'Không xác định';
}

/** Vai trò có quyền điều hành lớp (giáo viên trở lên) — tiện cho UI lớp học. */
export function isInstructor(role: UserRole): boolean {
  return can(role, 'host_session');
}

/**
 * Quy đổi vai trò từ Jitsi (chỉ có 'moderator' | 'participant') sang UserRole.
 * Jitsi không phân biệt admin/manager/teacher, nên moderator được coi là teacher.
 */
export function roleFromJitsi(jitsiRole: string): UserRole {
  return jitsiRole === 'moderator' ? 'teacher' : 'student';
}
