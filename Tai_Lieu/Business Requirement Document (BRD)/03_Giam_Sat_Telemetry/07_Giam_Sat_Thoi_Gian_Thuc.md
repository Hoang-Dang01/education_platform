# 7. Phân hệ Giám sát thời gian thực (Real-Time Monitoring)

## 7.1. Mục tiêu
Phân hệ Giám sát thời gian thực cho phép quản lý và quản trị viên theo dõi toàn bộ hoạt động học trực tuyến đang diễn ra trên hệ thống.

Mục tiêu chính của phân hệ là:
* Giám sát trạng thái vận hành của các lớp học theo thời gian thực.
* Theo dõi chất lượng kết nối của giáo viên và học viên.
* Phát hiện sớm các sự cố ảnh hưởng đến chất lượng học tập.
* Hỗ trợ xác định nguyên nhân sự cố kết nối.
* Cung cấp dữ liệu phục vụ phân tích và báo cáo sau buổi học.

## 7.2. Dashboard tổng quan
* **Mô tả:** Dashboard cung cấp cái nhìn tổng thể về toàn bộ hệ thống đào tạo trực tuyến tại thời điểm hiện tại.
* **Thông tin hiển thị:**
  * Tổng số lớp học đang diễn ra.
  * Tổng số giáo viên đang trực tuyến.
  * Tổng số học viên đang trực tuyến.
  * Tổng số kết nối đang hoạt động.
  * Tổng số người dùng gặp sự cố kết nối.
  * Tổng số lớp học có cảnh báo chất lượng.
* **Mục đích:** Giúp quản lý nhanh chóng đánh giá tình trạng vận hành của toàn bộ hệ thống mà không cần truy cập từng lớp học riêng lẻ.

## 7.3. Giám sát lớp học
* **Mô tả:** Cho phép theo dõi trạng thái của từng lớp học đang diễn ra.
* **Thông tin hiển thị:**
  * Mã lớp học, Tên lớp học, Giáo viên phụ trách.
  * Số lượng học viên tham gia.
  * Thời gian bắt đầu và thời lượng đã diễn ra.
  * Trạng thái lớp học.
* **Trạng thái lớp học hỗ trợ:** Scheduled, In Progress, Completed, Interrupted, Cancelled.

## 7.4. Giám sát người tham gia
* **Mô tả:** Cho phép theo dõi chi tiết từng người tham gia trong lớp học.
* **Thông tin hiển thị:**
  * Họ tên, vai trò.
  * Trạng thái kết nối.
  * Trạng thái bật/tắt Camera và Microphone.
  * Thời gian tham gia và số lần mất kết nối.
* **Trạng thái kết nối hỗ trợ:** Connected, Reconnecting, Disconnected.

## 7.5. Giám sát chất lượng kết nối
* **Mô tả:** Hệ thống thu thập và hiển thị các chỉ số kỹ thuật liên quan đến chất lượng truyền tải âm thanh và hình ảnh trong thời gian thực.
* **Chỉ số giám sát:**
  * **Latency (Độ trễ):** Thời gian truyền dữ liệu giữa thiết bị người dùng và hệ thống. Đơn vị: Milliseconds (ms).
  * **Packet Loss (Tỷ lệ mất gói):** Tỷ lệ dữ liệu bị thất lạc trong quá trình truyền tải. Đơn vị: %.
  * **Jitter (Độ dao động độ trễ):** Mức độ biến động của độ trễ mạng theo thời gian. Đơn vị: Milliseconds (ms).
  * **Bitrate:** Tốc độ truyền dữ liệu âm thanh và hình ảnh. Đơn vị: Kbps hoặc Mbps.
  * **Frame Rate (FPS):** Số khung hình hiển thị mỗi giây đối với luồng video.

## 7.6. Thông tin thiết bị và mạng
* **Mô tả:** Cho phép xác định môi trường kết nối của từng người tham gia nhằm hỗ trợ phân tích nguyên nhân sự cố.
* **Thông tin thu thập:**
  * Loại thiết bị (Desktop, Laptop, Tablet, Mobile).
  * Hệ điều hành, trình duyệt sử dụng.
  * Loại kết nối mạng.
  * Địa chỉ IP công khai (nếu được phép theo chính sách bảo mật).
* **Loại kết nối hỗ trợ:** Wi-Fi, Ethernet, Mobile Network, VPN.

## 7.7. Cảnh báo chất lượng
* **Mô tả:** Hệ thống tự động phát hiện các trường hợp có nguy cơ ảnh hưởng đến chất lượng lớp học.
* **Ví dụ các ngưỡng cảnh báo:**
  * **Cảnh báo độ trễ cao:** Latency > 300 ms
  * **Cảnh báo mất gói:** Packet Loss > 5%
  * **Cảnh báo dao động mạng:** Jitter > 30 ms
  * **Cảnh báo mất kết nối liên tục:** Số lần Disconnect vượt ngưỡng cấu hình.

## 7.8. Hỗ trợ xác định nguyên nhân sự cố
* **Mục tiêu:** Hỗ trợ quản lý nhanh chóng xác định phạm vi ảnh hưởng của sự cố.
* **Các kịch bản điển hình:**
  * **Trường hợp 1:** Một học viên có Packet Loss cao.
    * *Kết luận sơ bộ:* Sự cố thuộc về phía học viên.
  * **Trường hợp 2:** Nhiều học viên cùng lúc gặp Latency cao.
    * *Kết luận sơ bộ:* Khả năng cao sự cố thuộc về giáo viên hoặc hạ tầng mạng.
  * **Trường hợp 3:** Toàn bộ lớp học mất kết nối.
    * *Kết luận sơ bộ:* Khả năng cao sự cố thuộc về hệ thống hoặc máy chủ.

## 7.9. Dữ liệu phục vụ báo cáo
Toàn bộ dữ liệu giám sát được lưu trữ để phục vụ:
* Báo cáo chất lượng lớp học và kết nối.
* Phân tích sự cố sau buổi học.
* Thống kê vận hành hệ thống.
* Đánh giá chất lượng đào tạo.

## 7.10. Vai trò trong hệ thống
Phân hệ Giám sát thời gian thực là trung tâm điều hành vận hành của toàn bộ nền tảng đào tạo trực tuyến.

Phân hệ này cung cấp khả năng theo dõi, cảnh báo và phân tích chất lượng lớp học theo thời gian thực, giúp quản lý chủ động xử lý sự cố và đảm bảo chất lượng giảng dạy trong suốt quá trình đào tạo.
