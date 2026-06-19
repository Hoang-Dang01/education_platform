# EduMeet — Hướng dẫn Deploy Jitsi Meet Self-Hosted

## Yêu cầu trên server
- Linux (Ubuntu 22.04 LTS khuyến nghị)
- Docker Engine ≥ 20.10
- Docker Compose Plugin ≥ 2.0
- RAM ≥ 4GB, CPU ≥ 2 cores
- Đường truyền đối xứng (upload/download tốt)

## Ports cần mở trên Firewall / Security Group

```bash
# Lệnh mở port trên UFW (Ubuntu)
sudo ufw allow 5001/tcp   # HTTP (redirect sang HTTPS)
sudo ufw allow 8070/tcp   # HTTPS — Web UI EduMeet
sudo ufw allow 9621/udp   # JVB Media — QUAN TRỌNG nhất cho WebRTC
sudo ufw allow 5678/tcp   # JVB TCP fallback
sudo ufw allow 8082/tcp   # Frontend Web App UI
sudo ufw reload
```

> ⚠️ **Nếu không mở port 9621/UDP, video/audio sẽ không hoạt động dù kết nối XMPP thành công.**

---

## Bước 1 — Sao chép thư mục lên server

Từ máy Windows của bạn, dùng SCP hoặc rsync:

```bash
# Từ Windows PowerShell
scp -r ".\docker-jitsi\" user@YOUR_SERVER_IP:~/edumeet/
```

---

## Bước 2 — Cấu hình trên server

```bash
# SSH vào server
ssh user@YOUR_SERVER_IP

# Vào thư mục
cd ~/edumeet/docker-jitsi

# Cấp quyền thực thi cho script
chmod +x gen-passwords.sh

# Sinh passwords ngẫu nhiên (sẽ tạo file .env từ template)
./gen-passwords.sh

# Mở .env và thay YOUR_SERVER_IP bằng IP thật
nano .env
# Tìm 3 dòng sau và thay IP:
#   DOCKER_HOST_ADDRESS=YOUR_SERVER_IP
#   JVB_ADVERTISE_IPS=YOUR_SERVER_IP
#   PUBLIC_URL=https://YOUR_SERVER_IP:8070
```

---

## Bước 3 — Tạo thư mục config

```bash
# Tạo thư mục lưu trữ config của Jitsi
mkdir -p jitsi-config
```

---

## Bước 4 — Khởi động stack

```bash
# Pull images và chạy nền
docker compose up -d

# Theo dõi logs khi khởi động (chờ khoảng 30-60 giây)
docker compose logs -f

# Kiểm tra tất cả containers đang chạy
docker compose ps
```

**Kết quả mong đợi:**
```
NAME            STATUS          PORTS
docker-jitsi-web-1      running   0.0.0.0:5001->80/tcp, 0.0.0.0:8070->443/tcp
docker-jitsi-prosody-1  running
docker-jitsi-jicofo-1   running
docker-jitsi-jvb-1      running   0.0.0.0:9621->9621/udp
docker-jitsi-frontend-1 running   0.0.0.0:8082->80/tcp
```

---

## Bước 5 — Kiểm tra hoạt động

```bash
# Kiểm tra web UI phản hồi (bỏ qua cảnh báo SSL self-signed)
curl -k https://localhost:8070

# Kiểm tra JVB health
curl http://localhost:5001/about/health
```

---

## Bước 6 — Truy cập từ trình duyệt

1. Mở `https://YOUR_SERVER_IP:8070`
2. Trình duyệt sẽ cảnh báo **"Kết nối không bảo mật"** — đây là bình thường với self-signed cert
3. Click **"Advanced"** → **"Proceed to YOUR_SERVER_IP (unsafe)"**
4. Tạo phòng thử nghiệm, join 2 tab → xác nhận video/audio hoạt động

---

## Bước 7 — Cấu hình EduMeet App kết nối server riêng

Sau khi server đã chạy, cập nhật file `app/.env.production`:

```env
VITE_JITSI_HOST=YOUR_SERVER_IP
VITE_JITSI_PORT=8070
VITE_FORCE_MOCK=false
```

Build lại app:
```bash
cd app
npm run build
```

---

## Các lệnh quản lý thường dùng

```bash
# Xem status
docker compose ps

# Xem logs realtime
docker compose logs -f

# Xem logs của một service cụ thể
docker compose logs -f jvb

# Restart một service
docker compose restart jvb

# Dừng toàn bộ stack
docker compose down

# Cập nhật images mới nhất
docker compose pull
docker compose up -d
```

---

## Troubleshooting

### Video/Audio không hoạt động dù đã kết nối được
→ **Port 10000/UDP chưa được mở** trên firewall. Kiểm tra lại Security Group.

### Không kết nối được vào phòng
→ Kiểm tra `XMPP_DOMAIN` và `PUBLIC_URL` trong `.env` đúng chưa.

### Màn hình trắng khi vào web
→ Kiểm tra `docker compose logs web` để xem lỗi Nginx.

### JVB báo lỗi ICE connection
→ `JVB_ADVERTISE_IPS` chưa đúng với IP public. Server có thể đứng sau NAT.

---

## Nâng cấp lên HTTPS với domain thật (tương lai)

Khi bạn có domain, chỉ cần:
1. Trỏ domain về IP server
2. Thêm vào `.env`:
   ```
   ENABLE_LETSENCRYPT=1
   LETSENCRYPT_DOMAIN=meet.yourdomain.com
   LETSENCRYPT_EMAIL=your@email.com
   PUBLIC_URL=https://meet.yourdomain.com
   ```
3. `docker compose up -d` — Let's Encrypt tự động cấp cert miễn phí
