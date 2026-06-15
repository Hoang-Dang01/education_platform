# 9. Giám sát người dùng (Participant Monitoring)

## 9.1. Mục tiêu
Phân hệ Giám sát người dùng cho phép quản lý và quản trị viên theo dõi trạng thái hoạt động của từng người tham gia trong các lớp học trực tuyến.

Thông tin được cập nhật theo thời gian thực nhằm hỗ trợ giám sát chất lượng học tập, đánh giá tình trạng kết nối và xử lý sự cố khi cần thiết.

## 9.2. Thông tin người dùng
Đối với mỗi người tham gia lớp học, hệ thống hiển thị các thông tin cơ bản sau:
* **Thông tin cá nhân:** Họ và tên, Mã người dùng.
* **Vai trò trong lớp học:** Admin, Manager, Teacher, Student.

## 9.3. Thông tin thiết bị
Hệ thống thu thập thông tin thiết bị đang được sử dụng để tham gia lớp học phục vụ việc hỗ trợ kỹ thuật và phân tích sự cố.
* **Loại thiết bị:** Desktop, Laptop, Mobile, Tablet.
* **Hệ điều hành:** Windows, macOS, Linux, Android, iOS...
* **Trình duyệt sử dụng:** Chrome, Edge, Firefox, Safari...

## 9.4. Thông tin mạng
Hệ thống ghi nhận môi trường và thông số kết nối mạng:
* **Loại mạng:** LAN (Ethernet), Wi-Fi, 4G, 5G, VPN (nếu phát hiện được).
* **Thông tin kết nối:** Trạng thái kết nối, Thời gian kết nối, Số lần mất kết nối, Thời gian mất kết nối gần nhất.

## 9.5. Chất lượng kết nối
Đối với từng người tham gia, hệ thống hiển thị các chỉ số chất lượng kết nối được thu thập từ WebRTC Statistics API.
* **Chỉ số hiển thị:** Latency, Packet Loss, Jitter, RTT, Bitrate, FPS.
* **Trạng thái chất lượng:** Hệ thống tự động phân loại thành các mức `Excellent`, `Good`, `Fair`, `Poor`, `Critical`.

## 9.6. Trạng thái tham gia học tập
Cho phép theo dõi tình trạng tham gia của người dùng trong buổi học:
* **Thông tin hiển thị:** Thời gian tham gia, Thời gian học thực tế, Tỷ lệ tham gia, Số lần mất kết nối.
* **Trạng thái hiện tại:** Online, Away, Reconnecting, Offline.

## 9.7. Hỗ trợ xử lý sự cố
Thông tin giám sát người dùng là cơ sở để xác định nhanh các trường hợp gặp vấn đề trong quá trình học trực tuyến.
* **Trường hợp 1:** Một học viên có Packet Loss cao, Jitter cao, trong khi các học viên khác hoạt động bình thường.
  * *Kết luận sơ bộ:* Sự cố thuộc về phía học viên.
* **Trường hợp 2:** Nhiều học viên cùng gặp chất lượng kết nối kém trong cùng thời điểm.
  * *Kết luận sơ bộ:* Khả năng cao sự cố thuộc về giáo viên hoặc hạ tầng mạng trung gian.

## 9.8. Vai trò trong hệ thống
Phân hệ Giám sát người dùng cung cấp góc nhìn chi tiết đến từng cá nhân tham gia lớp học. Dữ liệu từ phân hệ này được sử dụng bởi:
* Phân hệ Real-Time Monitoring.
* Phân hệ Telemetry & Network Analytics.
* Phân hệ Network Diagnostics.
* Phân hệ Attendance.
* Phân hệ Reporting.

Đây là nguồn dữ liệu quan trọng phục vụ việc đánh giá chất lượng tham gia học tập và xác định nguyên nhân các sự cố kết nối trong quá trình đào tạo trực tuyến.
