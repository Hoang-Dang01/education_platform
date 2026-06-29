import { SetMetadata } from '@nestjs/common';

/**
 * Danh sách các vai trò hợp lệ trong hệ thống EduMeet.
 * Phải khớp với enum UserRole trong schema.prisma.
 */
export type AppRole = 'admin' | 'manager' | 'teacher' | 'student';

/** Metadata key dùng để đọc trong RolesGuard. */
export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator — khai báo vai trò được phép truy cập vào route.
 *
 * Dùng kết hợp với JwtAuthGuard + RolesGuard.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'manager')
 * @Get('admin-only')
 * adminRoute() { ... }
 */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
