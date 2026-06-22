# Kế Hoạch Triển Khai Phân Chia Giai Đoạn (Phased Implementation Plan) — JWT Authentication & Seeding

Kế hoạch này phân chia công việc triển khai Authentication & Database Seeding cho hệ thống EduMeet thành **7 giai đoạn nhỏ (Phases)**. Mỗi giai đoạn là một phần tính năng độc lập, có thể biên dịch, chạy được, kiểm thử được và merge riêng lẻ.

---

## Các Phase Chi Tiết

### Phase 0 — Foundation Setup (Cài đặt Hạ tầng & Cấu hình)
Mục tiêu: Cài đặt các thư viện cần thiết, thiết lập script monorepo và cấu hình môi trường toàn cục `@nestjs/config`.

* **Các file thay đổi/tạo mới**:
  * [MODIFY] [package.json (api)](file:///d:/HoangDang/IT/education_platform/apps/api/package.json): Cài đặt dependencies xác thực, mã hóa và kiểm duyệt. Thêm cấu hình prisma seed.
  * [MODIFY] [package.json (root)](file:///d:/HoangDang/IT/education_platform/package.json): Thêm script chạy seed của workspace.
  * [MODIFY] [app.module.ts](file:///d:/HoangDang/IT/education_platform/apps/api/src/app.module.ts): Đăng ký `ConfigModule.forRoot({ isGlobal: true })`.
* **Verification**:
  * Chạy `npm install` thành công ở root.
  * Khởi động server backend `npm run dev:api` không lỗi và load được biến môi trường.
* **Definition of Done (DoD)**:
  * [ ] Thư viện cài đặt đầy đủ mà không có conflict.
  * [ ] Ứng dụng NestJS khởi chạy thành công.
  * [ ] `ConfigModule` hoạt động bình thường ở local.

---

### Phase 1 — Shared Contracts + Validation Layer (Hợp đồng dữ liệu & ValidationPipe)
Mục tiêu: Định nghĩa các interface Request/Response dùng chung ở monorepo package và thiết lập bộ kiểm duyệt ValidationPipe nghiêm ngặt ở API.

* **Các file thay đổi/tạo mới**:
  * [MODIFY] [index.ts (shared)](file:///d:/HoangDang/IT/education_platform/packages/shared-types/index.ts): Định nghĩa các interface `RegisterRequest`, `LoginRequest`, `AuthUserDto`, `AuthResponse`.
  * [MODIFY] [main.ts](file:///d:/HoangDang/IT/education_platform/apps/api/src/main.ts): Cấu hình `ValidationPipe` với `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
* **Verification**:
  * Khởi động và compile ứng dụng thành công.
* **Definition of Done (DoD)**:
  * [ ] Gói shared types `@edumeet/shared-types` được export đúng cách.
  * [ ] Lớp validation Pipe được khai báo toàn cục trong `main.ts`.

---

### Phase 2 — Auth Module Skeleton & DTOs (Khung Module Auth & DTOs)
Mục tiêu: Thiết lập cấu trúc thư mục module `auth`, định nghĩa các DTOs kế thừa từ shared-types và cấu hình token JWT an toàn nhưng chưa triển khai logic nghiệp vụ.

* **Các file thay đổi/tạo mới**:
  * [MODIFY] [app.module.ts](file:///d:/HoangDang/IT/education_platform/apps/api/src/app.module.ts): Import `AuthModule`.
  * [NEW] `apps/api/src/modules/auth/auth.module.ts`: Khai báo module, cấu hình `JwtModule.registerAsync()` sử dụng `ConfigService` để lấy `JWT_SECRET` với check fail-fast an toàn trên production.
  * [NEW] `apps/api/src/modules/auth/dto/register.dto.ts` & `login.dto.ts`: Tạo các DTO class `implements` interface tương ứng từ shared package và gắn các decorator kiểm duyệt dữ liệu (`@IsEmail`, `@MinLength(6)`, `@IsString`).
  * [NEW] `apps/api/src/modules/auth/auth.controller.ts` & `auth.service.ts`: Tạo file khung rỗng.
* **Verification**:
  * Backend boot thành công và compile bình thường.
* **Definition of Done (DoD)**:
  * [ ] AuthModule boot mà không bị lỗi Circular Dependency.
  * [ ] Các DTOs được khai báo chính xác với kiểm duyệt kiểu dữ liệu.

---

### Phase 3 — Register Flow (Luồng Đăng ký & Chống nâng quyền)
Mục tiêu: Hiện thực hóa logic đăng ký tài khoản mới, mã hóa mật khẩu và ngăn chặn việc tự nâng vai trò.

* **Các file thay đổi/tạo mới**:
  * [MODIFY] `apps/api/src/modules/auth/auth.service.ts`: Triển khai `register(dto)` kiểm tra trùng email $\rightarrow$ `ConflictException` (409), mã hóa password bằng bcrypt với `SALT_ROUNDS = 10`, tạo user mới và ép buộc vai trò `role = 'student'`.
  * [MODIFY] `apps/api/src/modules/auth/auth.controller.ts`: Lộ diện endpoint POST `/auth/register` (Public).
* **Verification**:
  * Đăng ký thành công trả về User mới trong DB với vai trò mặc định `student`.
  * Đăng ký trùng email trả về `409 Conflict`.
  * Gửi thêm trường rác như `role: 'admin'` $\rightarrow$ bị `400 Bad Request` chặn bởi pipe.
* **Definition of Done (DoD)**:
  * [ ] Endpoint `/auth/register` đăng ký thành công và trả về dữ liệu chuẩn.
  * [ ] Chống nâng quyền (Role escalation) hoạt động chính xác (đã được verify thủ công).
  * [ ] Email trùng lặp trả về đúng mã lỗi `409`.

---

### Phase 4 — Database Seeding (Dữ liệu mẫu cho hệ thống)
Mục tiêu: Thiết lập tập lệnh seed khởi tạo 4 tài khoản với các vai trò tương ứng chạy song song bằng `Promise.all()` và sử dụng `upsert` an toàn để phục vụ test login ở phase tiếp theo.

* **Các file thay đổi/tạo mới**:
  * [NEW] [seed.ts (prisma)](file:///d:/HoangDang/IT/education_platform/apps/api/prisma/seed.ts): Tạo kịch bản seeding với 4 tài khoản mẫu: admin, manager, teacher, student (mã hóa mật khẩu song song).
* **Verification**:
  * Chạy `npm run prisma:seed` ở root thành công tạo 4 user trong database.
  * Chạy lại lần 2, dữ liệu được cập nhật mà không gây ra lỗi duplicate keys.
* **Definition of Done (DoD)**:
  * [ ] Lệnh seed chạy hoàn tất mà không gặp lỗi.
  * [ ] 4 tài khoản có mặt trong DB với mật khẩu dạng hash.
  * [ ] Tính năng `upsert` chạy rerunnable trơn tru.

---

### Phase 5 — Login Flow + JWT Issue (Luồng Đăng nhập & Cấp phát JWT)
Mục tiêu: Hiện thực hóa logic xác thực thông tin đăng nhập và sinh mã JWT token thời hạn 7 ngày.

* **Các file thay đổi/tạo mới**:
  * [MODIFY] `apps/api/src/modules/auth/auth.service.ts`: Triển khai `login(dto)` so khớp email và so sánh bcrypt mật khẩu $\rightarrow$ `UnauthorizedException` (401), sinh token chứa payload `{ sub, email, role, name }`.
  * [MODIFY] `apps/api/src/modules/auth/auth.controller.ts`: Lộ diện endpoint POST `/auth/login` (Public).
* **Verification**:
  * Đăng nhập đúng với tài khoản đã seed ở Phase 4 trả về `200 OK` kèm `accessToken` và profile user.
  * Đăng nhập sai mật khẩu hoặc tài khoản không tồn tại trả về `401 Unauthorized`.
* **Definition of Done (DoD)**:
  * [ ] Endpoint `/auth/login` hoạt động ổn định.
  * [ ] Cấp token JWT hợp lệ với thời hạn `7d`.
  * [ ] Thông tin trả về không lộ trường mật khẩu.

---

### Phase 6 — JWT Strategy + Protected Routes (Xác thực Token & API `/auth/me`)
Mục tiêu: Bảo vệ các API bằng AuthGuard và xây dựng endpoint `/auth/me` để lấy thông tin mới nhất từ cơ sở dữ liệu.

* **Các file thay đổi/tạo mới**:
  * [NEW] `apps/api/src/modules/auth/jwt.strategy.ts` & `jwt-auth.guard.ts`: Hiện thực JWT strategy và JwtAuthGuard.
  * [MODIFY] `apps/api/src/modules/auth/auth.controller.ts`: Lộ diện endpoint GET `/auth/me` bảo vệ bởi `@UseGuards(JwtAuthGuard)`.
  * [MODIFY] `apps/api/src/modules/auth/auth.service.ts`: Triển khai hàm `getUserProfile(userId)` lấy thông tin cập nhật mới nhất từ DB qua Prisma.
* **Verification**:
  * Gửi request `/auth/me` không token hoặc token sai trả về `401 Unauthorized`.
  * Gửi request `/auth/me` kèm Token đúng trả về thông tin user đầy đủ và chính xác.
* **Definition of Done (DoD)**:
  * [ ] `JwtAuthGuard` chặn token không hợp lệ thành công.
  * [ ] Endpoint `/auth/me` trả về thông tin người dùng được truy vấn trực tiếp từ cơ sở dữ liệu.

---

## Kế hoạch triển khai từng bước (Execution Rule)

1. Chúng ta sẽ tiến hành triển khai **từng Phase một**, bắt đầu từ **Phase 0**.
2. Sau khi hoàn thành xong và kiểm thử thành công một Phase, chúng ta mới chuyển sang Phase tiếp theo.
3. Trong quá trình viết mã, chúng ta liên tục cập nhật tiến độ vào file `task.md`.
