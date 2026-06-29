# LiveKit Deployment Infrastructure for EduMeet

Thư mục này chứa toàn bộ hạ tầng cấu hình để khởi chạy LiveKit Server phục vụ lớp học trực tuyến EduMeet. Cấu hình được chia rõ ràng thành:
1. **Local Development (`local/`)**: Chạy nhanh trên máy local của lập trình viên, sử dụng bridge network và Google STUN.
2. **VPS Pilot (`vps/`)**: Chạy trên máy chủ Cloud/VPS công cộng có domain riêng, tích hợp tự động SSL Caddy và coturn TURN server.
3. **Module Egress (`egress/`)**: Worker ghi hình (Egress) và kho lưu trữ (MinIO), cấu hình chạy độc lập tùy chọn (mặc định tắt).
4. **Monitoring Stack (`monitoring/`)**: Giám sát metrics LiveKit qua Prometheus + Grafana.

---

## 1. Môi trường phát triển cục bộ (Local Dev Setup)

### Yêu cầu hệ thống:
- Đã cài đặt **Docker** và **Docker Compose**.

### Các bước chạy:
1. Di chuyển vào thư mục local:
   ```bash
   cd infrastructure/livekit-deploy/local
   ```
2. Khởi động LiveKit server:
   ```bash
   docker compose up -d
   ```
3. LiveKit Server sẽ chạy tại địa chỉ: `http://localhost:7880`.
4. Để kiểm thử hoặc dev frontend/backend, cập nhật cấu hình file `.env`:
   - Backend NestJS (`apps/api/.env`):
     ```env
     MEDIA_PROVIDER=livekit
     LIVEKIT_API_KEY=devkey
     LIVEKIT_API_SECRET=secret
     LIVEKIT_SERVER_URL=http://localhost:7880
     ```
   - Frontend React (`apps/web/.env`):
     ```env
     VITE_MEDIA_PROVIDER=livekit
     VITE_LIVEKIT_SERVER_URL=ws://localhost:7880
     ```

---

## 2. Triển khai máy chủ Staging / Pilot (Single VPS Deployment)

### Yêu cầu hệ thống:
- 1 Server Ubuntu (khuyên dùng tối thiểu 4 vCPUs, 8GB RAM).
- 1 Tên miền (Domain Name) trỏ bản ghi A về IP công cộng của VPS (Ví dụ: `livekit.edumeet.vn`).
- Đã cài đặt Docker và Docker Compose.

### Bước 1: Mở cổng Firewall (UFW)
Chạy các lệnh sau trên VPS để mở các cổng mạng WebRTC và HTTP cần thiết:
```bash
# Cổng API/WebSocket Signaling (Định tuyến qua Caddy SSL)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp

# Cổng Coturn (TURN/STUN server)
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp

# Dải cổng WebRTC Media Transport (UDP)
sudo ufw allow 50000:50200/udp

# Kích hoạt Firewall
sudo ufw enable
```

### Bước 2: Cập nhật cấu hình IP và Domain
1. Di chuyển vào thư mục `vps/`:
   ```bash
   cd infrastructure/livekit-deploy/vps
   ```
2. Mở file [livekit.yaml](file:///d:/HoangDang/IT/education_platform/infrastructure/livekit-deploy/vps/livekit.yaml) và thay thế:
   - `yourdomain.com` thành tên miền thực tế của bạn.
   - Nhập `api_key` và `api_secret` bảo mật của riêng bạn.
3. Mở file [turnserver.conf](file:///d:/HoangDang/IT/education_platform/infrastructure/livekit-deploy/vps/turnserver.conf) và thay thế:
   - `your-vps-public-ip` thành địa chỉ IP công cộng thực tế của VPS.
   - `yourdomain.com` thành tên miền của bạn.
4. Mở file [Caddyfile](file:///d:/HoangDang/IT/education_platform/infrastructure/livekit-deploy/vps/Caddyfile) và cập nhật domain của bạn.

### Bước 3: Chạy hạ tầng trên VPS
Khởi chạy LiveKit + Caddy + Coturn:
```bash
docker compose up -d
```

Caddy sẽ tự động giao tiếp với Let's Encrypt để xin chứng chỉ SSL. LiveKit API sẽ hoạt động an toàn tại: `https://livekit.yourdomain.com` (hoặc `wss://livekit.yourdomain.com`).

---

## 3. Module ghi hình Egress & Lưu trữ MinIO (Tùy chọn)

Nếu bạn muốn kích hoạt tính năng ghi hình lớp học trên VPS (hoặc chạy trên một VPS 2 độc lập để tránh nặng máy chủ chính):
1. Cập nhật thông số kết nối và S3 storage trong [egress.yaml](file:///d:/HoangDang/IT/education_platform/infrastructure/livekit-deploy/egress/egress.yaml).
2. Chạy module ghi hình:
   ```bash
   cd infrastructure/livekit-deploy/egress
   docker compose -f docker-compose.egress.yml up -d
   ```

---

## 4. Monitoring Stack

Giám sát tải hệ thống và WebRTC metrics:
```bash
cd infrastructure/livekit-deploy/monitoring
docker compose -f docker-compose.monitoring.yml up -d
```
Truy cập Grafana tại `http://localhost:3000` (đăng nhập bằng `admin` / `admin`). Trỏ Datasource về Prometheus (`http://prometheus:9090`).

---

## 5. Quản lý Khóa bảo mật (Secrets Management)

Để đảm bảo an toàn tối đa cho môi trường Production, **tuyệt đối không hardcode keys** vào các file cấu hình được commit lên git.
1. Sao chép file ví dụ để tạo file cấu hình thực tế:
   ```bash
   cp vps/.env.production.example vps/.env.production
   ```
2. Sinh mã bảo mật ngẫu nhiên chất lượng cao bằng lệnh:
   - Sinh LiveKit API Secret:
     ```bash
     openssl rand -hex 32
     ```
   - Sinh TURN Password:
     ```bash
     openssl rand -hex 16
     ```
3. Cập nhật các giá trị sinh được vào `vps/.env.production`, file cấu hình `livekit.yaml` và `turnserver.conf` tương ứng trước khi chạy lệnh docker compose.

---

## 6. Chính sách Lưu trữ & Dọn dẹp (Storage Retention Policy)

Các luồng ghi hình Chrome headless và dữ liệu telemetry phình rất nhanh theo thời gian. Khuyến nghị áp dụng chính sách tự động dọn dẹp:
- **Ghi hình lớp học (Recordings)**: Lưu trữ tối đa **30 ngày**. Thiết lập Lifecycle Rule trên MinIO bucket (`edumeet-recordings`) để tự động xóa các đối tượng (objects) cũ hơn 30 ngày.
- **Dữ liệu Telemetry**: Lưu trữ tối đa **90 ngày**. Lập lịch cron job chạy câu lệnh SQL để dọn dẹp bảng `TelemetrySample` định kỳ trên cơ sở dữ liệu PostgreSQL.
- **Log hệ thống (Container Logs)**: Giới hạn file tối đa 10MB và tự động xoay vòng (log rotate) giữ lại tối đa **14 ngày** (đã được cấu hình sẵn trong docker-compose logs driver).

---

## 7. Kịch bản Kiểm thử & Nghiệm thu (Deployment Validation Runbook)

Thực hiện lần lượt 4 bước sau để nghiệm thu môi trường trước khi go-live:

### Bước 1: Khởi động Local Services & Check Metrics
1. Chạy docker compose ở local:
   ```bash
   docker compose -f local/docker-compose.yml up -d
   ```
2. Kiểm tra xem LiveKit Server đã up chưa bằng cách gọi endpoint:
   - Kiểm tra API: `curl http://localhost:7880/` (Phải trả về `OK` hoặc phản hồi HTTP hợp lệ).
   - Kiểm tra metrics: `curl http://localhost:7880/metrics` (Phải trả về danh sách stats dạng Prometheus text).

### Bước 2: Tích hợp với Backend NestJS
1. Chạy backend ở chế độ dev:
   ```bash
   npm run dev:api
   ```
2. Thực hiện gọi API `POST /sessions/:id/join` bằng Postman/curl. Đảm bảo Backend sinh JWT token hợp lệ và trả về payload có dạng:
   ```json
   {
     "roomId": "room-uuid",
     "token": "eyJhbG...",
     "serverUrl": "ws://localhost:7880"
   }
   ```

### Bước 3: Kiểm thử Lớp học trên Trình duyệt (Multi-peer test)
1. Chạy frontend:
   ```bash
   npm run dev:web
   ```
2. Mở 2 tab trình duyệt ẩn danh khác nhau:
   - Tab 1: Đăng nhập vai trò Giảng viên (Teacher) và tham gia lớp học.
   - Tab 2: Đăng nhập vai trò Học sinh (Student) và tham gia cùng phòng học đó.
3. Xác minh:
   - Âm thanh và hình ảnh WebRTC được truyền tải mượt mà giữa hai peer.
   - Tính năng giơ tay (Raise hand) và chat realtime qua data channel hoạt động đồng bộ.
   - Kiểm tra telemetry hiển thị chính xác độ trễ (rtt) thực tế trên thẻ video.

### Bước 4: Kiểm thử môi trường NAT khắc nghiệt (NAT Torture Test)
Đây là bước bắt buộc để kiểm nghiệm khả năng đâm xuyên NAT của coturn:
1. Deploy stack `vps/` lên một VPS public IP.
2. Dùng 1 thiết bị kết nối mạng **4G di động** (chạy đằng sau Carrier-grade NAT - CGNAT).
3. Dùng thiết bị thứ 2 kết nối mạng **Wi-Fi văn phòng/trường học** (chạy sau Symmetric NAT/Firewall chặn cổng UDP phổ thông).
4. Cả hai thiết bị cùng tham gia vào lớp học trên VPS.
5. **Xác nhận**: Media tracks (hình ảnh/tiếng) vẫn kết nối thành công (nhờ TURN server chuyển tiếp media qua cổng 3478 TCP/UDP dự phòng). Nếu một trong hai bên chỉ thấy đen màn hình, kiểm tra lại cấu hình `external-ip` trong file `turnserver.conf` và các luật firewall của VPS.

