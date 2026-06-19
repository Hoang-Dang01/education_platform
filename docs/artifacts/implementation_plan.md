# Kế hoạch Triển khai — Tích hợp lib-jitsi-meet & WebRTC (Phase 0.3)

Bản kế hoạch này tập trung vào việc tích hợp thư viện **WebRTC Low-Level (lib-jitsi-meet)** vào giao diện React UI hiện có, thay thế dữ liệu giả lập (Mock Data) bằng kết nối luồng thật, xử lý sự kiện điểm danh và giám sát chất lượng kết nối thời gian thực (Telemetry) đúng theo yêu cầu BRD.

---

## User Review Required

> [!IMPORTANT]
> 1. **Cấu hình HTTPS / Localhost:** Cuộc gọi camera/mic của trình duyệt yêu cầu môi trường bảo mật. Khi chạy cục bộ, bạn truy cập qua `http://localhost:5173/` (hợp lệ). Nếu kiểm thử giữa nhiều thiết bị, cần triển khai HTTPS hoặc dùng tunnel (ngrok).
> 2. **Máy chủ Jitsi mặc định:** Chúng tôi đề xuất kết nối tới máy chủ công cộng ổn định `meet.jit.si` (cấu hình websocket/BOSH) để kiểm thử miễn phí.

---

## Open Questions

> [!WARNING]
> * **Bạn có muốn tùy cấu hình tên miền Jitsi Server riêng biệt không?** Hiện tại chúng tôi sẽ cấu hình mặc định kết nối tới `meet.jit.si`. Nếu bạn đã có server Jitsi tự cài đặt, hãy cung cấp địa chỉ IP/Domain để tôi điền vào cấu hình.

---

## Proposed Changes

### Component 1: Cấu hình Polyfills & Bundler Shims (main.tsx & vite.config.ts)

Thư viện `lib-jitsi-meet` sử dụng môi trường kiểu Node/Webpack truyền thống, yêu cầu một số biến toàn cục (`global`, `process.env`, `jQuery`). Chúng ta cần shim các biến này trước khi load thư viện.

#### [MODIFY] [main.tsx](file:///c:/Git%20cua%20tui/education-platform/app/src/main.tsx)
- Import và gán `jquery` vào `window.$` và `window.jQuery`.
- Gán `window.global` trỏ về `window`.
- Định nghĩa biến giả lập `window.process = { env: {} }`.

---

### Component 2: Xây dựng Jitsi Connector Service (jitsiService.ts)

#### [NEW] [jitsiService.ts](file:///c:/Git%20cua%20tui/education-platform/app/src/lib/jitsiService.ts)
- Khởi tạo thư viện `JitsiMeetJS` bằng cấu hình chuẩn kết nối WebSocket (`wss://meet.jit.si/xmpp-websocket`) và BOSH BIND (`https://meet.jit.si/http-bind`).
- Triển khai lớp `JitsiService` quản lý:
  - Khởi tạo đối tượng `JitsiConnection`.
  - Khởi tạo đối tượng `JitsiConference` (Phòng học trực tuyến).
  - Khởi tạo luồng local tracks (Audio/Video từ webcam và microphone của người dùng).
- Cung cấp các hàm điều khiển thiết bị: `muteAudio()`, `muteVideo()`, `startScreenShare()`, `stopScreenShare()`.

---

### Component 3: Kết nối WebRTC với ClassContext (ClassContext.tsx)

#### [MODIFY] [ClassContext.tsx](file:///c:/Git%20cua%20tui/education-platform/app/src/context/ClassContext.tsx)
- Cập nhật các hàm `joinRoom` và `leaveRoom` để gọi trực tiếp các phương thức kết nối/ngắt kết nối của `JitsiService`.
- Đăng ký lắng nghe sự kiện của `JitsiConference`:
  - `TRACK_ADDED`: Thêm track audio/video từ học viên khác.
  - `TRACK_REMOVED`: Gỡ track.
  - `USER_JOINED` / `USER_LEFT`: Cập nhật danh sách học viên hiện diện.
  - `DOMINANT_SPEAKER_CHANGED`: Phát hiện ai đang phát biểu để kích hoạt viền sáng (active-speaker).
  - `CONNECTION_STATS`: Lấy dữ liệu trễ mạng (RTT/Ping), jitter, packet loss thực tế của từng học viên.
- **Cơ chế Fallback thông minh:** Nếu kết nối Jitsi thất bại, hệ thống tự động fallback về Mock Data để đảm bảo UI không bị crash và vẫn có thể demo/kiểm thử bình thường.

---

### Component 4: Hiển thị Video Thực tế (VideoGrid.tsx & ParticipantVideo)

#### [MODIFY] [VideoGrid.tsx](file:///c:/Git%20cua%20tui/education-platform/app/src/components/VideoGrid.tsx)
- Chuyển tiếp các đối tượng Track thực tế từ `JitsiMeetJS` vào thẻ HTML5 `<video>` và `<audio>`.
- Sử dụng hàm `track.attach(element)` để liên kết luồng stream của Jitsi vào DOM React một cách an toàn mà không bị rò rỉ bộ nhớ khi component bị unmount.

---

### Component 5: Phân tích & Ghi nhận Telemetry Mạng (SidePanel.tsx & ReportsPage.tsx)

- Đọc các tham số telemetry thực tế trả về từ sự kiện `CONNECTION_STATS` để hiển thị cột sóng kết nối của học viên.
- Phân tích và đánh giá chất lượng mạng theo 4 cấp độ đúng chuẩn BRD:
  - **Excellent**: Latency < 100ms, Packet Loss < 1%, Jitter < 20ms
  - **Good**: Latency 100-200ms, Packet Loss 1-3%, Jitter 20-30ms
  - **Poor**: Latency 200-300ms, Packet Loss 3-5%, Jitter 30-50ms
  - **Critical**: Latency > 300ms, Packet Loss > 5%, Jitter > 50ms

---

## Verification Plan

### Automated/Unit Verification
- Biên dịch ứng dụng (`npm run build`) để kiểm tra lỗi kiểu TypeScript hoặc các lỗi liên kết thư viện tĩnh (ESM issues).

### Manual Verification
1. **Kiểm thử Camera/Mic Preview (Lobby):**
   - Đăng nhập, nhập tên phòng và kiểm tra camera có hiển thị luồng cục bộ trước khi vào lớp.
2. **Kiểm thử Kết nối Đa điểm (Multi-peer testing):**
   - Mở 2 tab trình duyệt cùng join vào 1 phòng để kiểm thử truyền nhận hình ảnh và âm thanh hai chiều.
   - Thử bật/tắt thiết bị xem icon Mic/Camera trên UI có đồng bộ trạng thái.
3. **Kiểm thử Chia sẻ màn hình (Screen Sharing):**
   - Click nút chia sẻ màn hình trên toolbar, kiểm tra xem luồng hình ảnh của slide chiếu có hiển thị lên khung chính ở tab thứ hai.
4. **Kiểm thử Telemetry thực tế:**
   - Xem số đo ping/jitter hiển thị trên thanh danh sách học viên có nhảy chỉ số thực tế thay vì cố định.
