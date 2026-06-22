# Kế Hoạch Thiết Lập Cấu Trúc Monorepo Vật Lý — EduMeet (NPM Workspaces)

Kế hoạch này mô tả các bước di chuyển thư mục, cấu hình dự án, liên kết TypeScript path aliases và thiết lập shared packages cho toàn bộ hệ thống EduMeet.

---

## Các Phase Thực Hiện

### Phase 1 — Restructure thư mục

#### 1. Tạo thư mục workspace
Tạo các thư mục cấu trúc chính ở root:
*   `apps/`
*   `packages/`

#### 2. Di chuyển các ứng dụng hiện tại
*   Di chuyển `app/` (React Frontend) -> `apps/web/`
*   Di chuyển `backend/` (NestJS Backend) -> `apps/api/`

#### 3. Khởi tạo các shared packages sơ khai
Tạo các thư mục bên trong `packages/`:
*   `packages/shared-types/`
*   `packages/contracts/`
*   `packages/sdk/`

---

### Phase 2 — Workspace configuration

#### 4. Tạo root `package.json`
Tạo mới file `package.json` ở thư mục gốc khai báo workspaces và các lệnh chạy liên kết:
```json
{
  "name": "education-platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:web": "npm run dev -w apps/web",
    "dev:api": "npm run start:dev -w apps/api",
    "build:web": "npm run build -w apps/web",
    "build:api": "npm run build -w apps/api",
    "lint:web": "npm run lint -w apps/web",
    "lint:api": "npm run lint -w apps/api",
    "test:web": "npm run test -w apps/web",
    "test:api": "npm run test -w apps/api"
  }
}
```

#### 5. Khởi tạo cấu hình cho shared packages
Tạo file `packages/shared-types/package.json`:
```json
{
  "name": "@edumeet/shared-types",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts"
}
```
Tạo file rỗng `packages/shared-types/index.ts` làm điểm xuất dữ liệu types.

#### 6. Cấu hình root TypeScript aliases
Tạo file `tsconfig.base.json` ở thư mục gốc để quản lý đường dẫn aliases dùng chung:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@edumeet/shared-types": ["packages/shared-types"],
      "@edumeet/contracts": ["packages/contracts"]
    }
  }
}
```

#### 7. Cập nhật cấu hình TypeScript kế thừa (tsconfig extends)
*   **Web (`apps/web/tsconfig.json`)**: Bổ sung kế thừa từ `tsconfig.base.json`.
*   **API (`apps/api/tsconfig.json`)**: Bổ sung kế thừa từ `tsconfig.base.json`.

---

### Phase 3 — Dependency cleanup

#### 8. Dọn dẹp thư mục dependencies cũ
Xóa bỏ toàn bộ:
*   `apps/web/node_modules/`
*   `apps/api/node_modules/`
*   `apps/web/package-lock.json`
*   `apps/api/package-lock.json`

#### 9. Reinstall & Link dependencies
Chạy lệnh `npm install` tại thư mục gốc để:
*   NPM tự động tải và hoist các gói thư viện trùng nhau lên root.
*   Thiết lập liên kết symlink giữa `@edumeet/shared-types` và các ứng dụng.

---

## Kế Hoạch Xác Minh (Verification Plan)

### 1. Kiểm tra cấu trúc liên kết:
*   Chạy lệnh `npm ls --workspaces` để xác minh NPM nhận diện đủ các workspaces.

### 2. Kiểm thử biên dịch:
*   Chạy `npm run build:web` kiểm tra frontend build.
*   Chạy `npm run build:api` kiểm tra backend build & Prisma schema generator.

### 3. Kiểm thử Runtime:
*   Chạy `npm run dev:web` kiểm tra Vite và render page.
*   Chạy `npm run dev:api` kiểm tra NestJS và kết nối PostgreSQL.

### 4. Kiểm thử Shared Packages:
*   Thử nghiệm import một kiểu dữ liệu từ `@edumeet/shared-types` vào `apps/web/` và `apps/api/` để xác nhận TS compile thành công.
