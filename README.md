# EduMeet Distributed Platform - Hệ thống Đào tạo & Lớp học Trực tuyến Tích hợp

EduMeet là một nền tảng quản lý học tập (LMS) tích hợp phòng học trực tuyến tương tác thời gian thực, đáp ứng các tiêu chuẩn doanh nghiệp và tổ chức giáo dục. Nền tảng được xây dựng trên kiến trúc Monorepo để dễ dàng chia sẻ tài nguyên và tối ưu hóa quy trình phát triển.

---

## 1. Tổng quan Kiến trúc Hệ thống (System Architecture)

Dự án được tổ chức dưới dạng **Monorepo** sử dụng `npm workspaces`, giúp quản lý đồng bộ mã nguồn Frontend, Backend và các thư viện chia sẻ:

*   **Frontend Client (`apps/web`)**:
    *   Ứng dụng Single Page Application (SPA) phát triển bằng **React**, **TypeScript** và **Vite**.
    *   Giao diện hiện đại, trực quan (hỗ trợ Light/Dark mode), tối ưu trải nghiệm người dùng.
    *   Tích hợp **Jitsi Meet Connection** qua SDK/IFrame phục vụ truyền tải video/audio trực tuyến thời gian thực chất lượng cao.
    *   Tích hợp Client Telemetry Collector để liên tục đo đạc thông số mạng WebRTC của người dùng.
*   **Backend Server (`apps/api`)**:
    *   Hệ thống REST API server xây dựng trên framework **NestJS** (TypeScript).
    *   Sử dụng **Prisma ORM** để tương tác với cơ sở dữ liệu **PostgreSQL**.
    *   Chịu trách nhiệm xác thực người dùng (JWT), phân quyền, quản lý tài liệu học tập, cấp mã Token bảo mật truy cập lớp học Jitsi, và thu thập/xử lý số liệu giám sát Telemetry.
*   **Thư viện Chia sẻ (`packages/`)**:
    *   `packages/shared-types`: Định nghĩa các kiểu dữ liệu (Types & Interfaces) TypeScript dùng chung cho cả Frontend và Backend.
    *   `packages/contracts`: Định nghĩa các schema xác thực DTO (Data Transfer Object) để đồng bộ hóa ràng buộc dữ liệu.
    *   `packages/sdk`: Thư viện API client helper giúp Frontend dễ dàng giao tiếp với Backend API.
*   **Hạ tầng Triển khai (`infrastructure/`)**:
    *   `infrastructure/jitsi-deploy`: Cấu hình cài đặt cụm máy chủ truyền thông Jitsi Meet tự lưu trữ (self-hosted) sử dụng Docker Compose.

---

## 2. Các Phân Hệ Nghiệp Vụ Cốt Lõi (Core Modules)

### Phân hệ Quản lý Học tập (LMS)
*   **Lịch học tập**: Giao diện Calendar hiển thị trực quan các buổi học trực tuyến đã lên lịch.
*   **Quản lý Khóa học & Tài liệu (Materials)**: Hỗ trợ giáo viên tải lên tài liệu học tập (file PDF), gán tài liệu vào lớp học. Học sinh có thể trực tiếp xem hoặc tải tài liệu về.
*   **Quản trị Người dùng**: Quản lý danh sách Giáo viên, Học sinh, Admin. Tích hợp cơ chế **bảo mật buộc đổi mật khẩu** đối với tài khoản đăng nhập lần đầu tiên.

### Phân hệ Lớp học Trực tuyến (Live Classroom)
*   **Video/Audio Call**: Kết nối truyền thông đa luồng chất lượng cao thông qua máy chủ Jitsi Meet.
*   **Thanh điều khiển tương tác (Control Bar)**: Cho phép bật/tắt camera, bật/tắt microphone, chia sẻ màn hình (Share Screen), và rời phòng học.
*   **Tương tác Lớp học**:
    *   **Khung Chat**: Nhắn tin trao đổi thời gian thực giữa các thành viên lớp học.
    *   **Bảng vẽ trực tuyến (Whiteboard)**: Giáo viên và học sinh cùng tương tác vẽ sơ đồ trực tiếp.
    *   **Giơ tay phát biểu (Raise Hand)**: Cơ chế thu hút sự chú ý khi học viên muốn phát biểu ý kiến.
    *   **Chia nhóm nhỏ (Breakout Rooms)**: Cho phép giáo viên chia nhỏ lớp học thành các phòng thảo luận riêng tư.

### Phân hệ Giám sát Mạng & Telemetry (Telemetry & Monitoring)
*   **Thu thập Chỉ số Mạng**: Client tự động đo đạc các thông số WebRTC từ máy học sinh (Ping, Round Trip Time - RTT, Packet Loss, Jitter, Trạng thái kết nối).
*   **Giám sát Thời gian thực**: Giáo viên có thể theo dõi trực tiếp trạng thái kết nối mạng của từng học sinh ngay trên màn hình lớp học (Hiển thị biểu tượng chất lượng mạng Đỏ/Vàng/Xanh và số liệu chi tiết) để nhanh chóng phát hiện học sinh bị lag/mất kết nối.
*   **Trang Giám sát Telemetry**: Admin và Giáo viên có thể xem lịch sử telemetry qua dashboard phân tích trực quan.

---

## 3. Hướng dẫn Khởi chạy Phát triển (Local Development)

### Bước 1: Cài đặt Dependencies
Từ thư mục gốc của dự án, chạy lệnh sau để cài đặt toàn bộ package cho các workspace:
```bash
npm install
```

### Bước 2: Thiết lập Cơ sở dữ liệu và Biến môi trường
1.  Tạo tệp cấu hình `.env` trong thư mục `apps/api/` với các thông số kết nối Database PostgreSQL và khóa bảo mật:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/edumeet?schema=public"
    JWT_SECRET="your-super-secret-key-change-in-production"
    JITSI_APP_ID="vpaas-magic-cookie"
    JITSI_SECRET="your-jitsi-secret-key"
    ```
2.  Khởi tạo schema database thông qua Prisma:
    ```bash
    # Di chuyển vào apps/api
    cd apps/api
    # Push schema lên database
    npx prisma db push
    ```
3.  Nạp dữ liệu mẫu ban đầu (Seed data):
    ```bash
    # Chạy script seed từ root workspace
    npm run prisma:seed
    ```

### Bước 3: Khởi chạy Dev Server
Chạy song song hai server Frontend và Backend bằng các terminal riêng biệt:

*   **Chạy Backend API Server**:
    ```bash
    npm run dev:api
    ```
    API sẽ chạy mặc định tại: [http://localhost:3000](http://localhost:3000)

*   **Chạy Frontend Web Client**:
    ```bash
    npm run dev:web
    ```
    Web client sẽ chạy mặc định tại: [http://localhost:5173](http://localhost:5173)

---

## 4. Hướng dẫn Đóng gói và Triển khai với Docker

Để xây dựng và kiểm tra Docker image cho Frontend Web:

1.  **Xây dựng Docker image**:
    Chạy lệnh sau từ thư mục gốc của dự án:
    ```bash
    docker build -t edumeet-frontend -f apps/web/Dockerfile ./apps/web
    ```

2.  **Khởi chạy Container**:
    Chạy container trên cổng `8080`:
    ```bash
    docker run -d -p 8080:80 --name edumeet-web-container edumeet-frontend
    ```

3.  **Kiểm tra hoạt động**:
    Mở trình duyệt truy cập: [http://localhost:8080](http://localhost:8080)

4.  **Dừng và dọn dẹp**:
    ```bash
    docker rm -f edumeet-web-container
    ```


