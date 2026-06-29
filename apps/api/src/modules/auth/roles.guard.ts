import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator';

/**
 * RolesGuard — kiểm tra vai trò người dùng từ JWT payload trước khi cho phép vào route.
 *
 * Flow:
 * 1. Đọc metadata @Roles() được gắn trên handler/controller qua Reflector.
 * 2. Nếu route không gắn @Roles() → bỏ qua (allow all authenticated users).
 * 3. Lấy req.user.role từ JWT payload đã được JwtStrategy xác thực.
 * 4. So sánh với danh sách role được phép → allow hoặc throw ForbiddenException.
 *
 * Lưu ý: Guard này phải dùng SAU JwtAuthGuard (vì cần req.user đã được populate).
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'manager')
 * @Get('protected')
 * protectedRoute() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Đọc @Roles() metadata từ handler trước, fallback sang class-level
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu route không yêu cầu role cụ thể → không chặn
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Không xác định được vai trò người dùng.');
    }

    const hasRole = requiredRoles.includes(user.role as AppRole);
    if (!hasRole) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện hành động này. Yêu cầu vai trò: ${requiredRoles.join(' hoặc ')}.`,
      );
    }

    return true;
  }
}
