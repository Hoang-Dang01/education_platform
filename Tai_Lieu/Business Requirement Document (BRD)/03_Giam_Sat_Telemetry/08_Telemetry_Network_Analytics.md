# 8. Phân hệ Telemetry & Network Analytics

## 8.1. Mục tiêu
Phân hệ Telemetry & Network Analytics chịu trách nhiệm thu thập, phân tích và đánh giá chất lượng kết nối trong quá trình học trực tuyến.

Dữ liệu được thu thập theo thời gian thực từ các kết nối WebRTC nhằm cung cấp khả năng giám sát, cảnh báo và hỗ trợ xác định nguyên nhân ảnh hưởng đến chất lượng lớp học. Đây là phân hệ tạo nên sự khác biệt của hệ thống so với các nền tảng họp trực tuyến thông thường.

## 8.2. Nguồn dữ liệu
Hệ thống thu thập dữ liệu liên tục trong suốt thời gian diễn ra lớp học từ các nguồn:
* WebRTC Statistics API.
* Media Server Telemetry.
* Application Event Logs.
* Attendance Events.

## 8.3. Các chỉ số giám sát

### Latency
* **Mô tả:** Thời gian truyền dữ liệu từ thiết bị người dùng đến hệ thống và ngược lại.
* **Đơn vị:** Milliseconds (ms)
* **Bảng đánh giá tham khảo:**

| Giá trị | Mức độ |
| :--- | :---: |
| &lt; 100 ms | Tốt |
| 100 - 200 ms | Chấp nhận được |
| 200 - 300 ms | Cảnh báo |
| &gt; 300 ms | Kém |

### Packet Loss
* **Mô tả:** Tỷ lệ gói tin bị mất trong quá trình truyền dữ liệu. Packet Loss cao có thể gây mất tiếng, giật hình, hoặc đóng băng video.
* **Đơn vị:** Phần trăm (%)
* **Bảng đánh giá tham khảo:**

| Giá trị | Mức độ |
| :--- | :---: |
| &lt; 1% | Tốt |
| 1 - 3% | Chấp nhận được |
| 3 - 5% | Cảnh báo |
| &gt; 5% | Kém |

### Jitter
* **Mô tả:** Mức độ dao động của độ trễ mạng theo thời gian. Jitter cao thường gây hiện tượng âm thanh bị đứt quãng, video không ổn định.
* **Đơn vị:** Milliseconds (ms)
* **Bảng đánh giá tham khảo:**

| Giá trị | Mức độ |
| :--- | :---: |
| &lt; 20 ms | Tốt |
| 20 - 30 ms | Chấp nhận được |
| 30 - 50 ms | Cảnh báo |
| &gt; 50 ms | Kém |

### RTT (Round Trip Time)
* **Mô tả:** Thời gian để một gói dữ liệu được gửi đi và nhận phản hồi từ phía đối diện.
* **Đơn vị:** Milliseconds (ms)
* **Mục đích:** Đánh giá độ phản hồi của kết nối.

### Bitrate
* **Mô tả:** Tốc độ truyền tải dữ liệu âm thanh và hình ảnh.
* **Đơn vị:** Kbps hoặc Mbps
* **Mục đích:** Đánh giá khả năng truyền tải media của kết nối.

### FPS (Frame Per Second)
* **Mô tả:** Số lượng khung hình video hiển thị trong một giây.
* **Đơn vị:** FPS
* **Mục đích:** Đánh giá độ mượt của video.

## 8.4. Thu thập dữ liệu thời gian thực
* **Chu kỳ thu thập:** Hệ thống thu thập dữ liệu định kỳ từ các kết nối WebRTC.
* **Chu kỳ đề xuất:**
  * **5 giây/lần:** đối với Dashboard Realtime.
  * **30 giây/lần:** đối với dữ liệu lưu trữ lịch sử.
* Các thông số này có thể được cấu hình theo quy mô triển khai.

## 8.5. Phân tích chất lượng kết nối
Dựa trên các chỉ số thu thập được, hệ thống tự động đánh giá chất lượng kết nối của từng người tham gia theo các trạng thái: `Excellent`, `Good`, `Fair`, `Poor`, `Critical`.

*Ví dụ ma trận đánh giá chất lượng:*

| Latency | Packet Loss | Jitter | Đánh giá |
| :---: | :---: | :---: | :---: |
| 50 ms | 0.5% | 10 ms | Excellent |
| 120 ms | 1.0% | 20 ms | Good |
| 250 ms | 4.0% | 35 ms | Fair |
| 350 ms | 7.0% | 60 ms | Poor |

## 8.6. Cảnh báo thời gian thực
Hệ thống tự động sinh cảnh báo khi các chỉ số vượt ngưỡng cho phép.
* *Ví dụ các cảnh báo:*
  * **Latency cao:** Latency > 300 ms
  * **Packet Loss cao:** Packet Loss > 5%
  * **Jitter cao:** Jitter > 50 ms
  * **Video chất lượng thấp:** FPS < 10
  * **Mất kết nối liên tục:** Nhiều lần Disconnect trong khoảng thời gian ngắn.

## 8.7. Lưu trữ dữ liệu Telemetry
Dữ liệu Telemetry được lưu trữ phục vụ báo cáo sau buổi học, phân tích sự cố, thống kê vận hành và đánh giá chất lượng đào tạo.
* **Các trường dữ liệu lưu trữ:** Timestamp, User ID, Meeting ID, Latency, Packet Loss, Jitter, RTT, Bitrate, FPS, Connection Status.

## 8.8. Tích hợp với các phân hệ khác
Dữ liệu Telemetry được sử dụng bởi các phân hệ: Monitoring, Attendance, Reporting, Network Diagnostics và Dashboard quản trị.

## 8.9. Vai trò trong hệ thống
Phân hệ Telemetry & Network Analytics là nền tảng dữ liệu phục vụ việc giám sát và phân tích chất lượng lớp học trực tuyến.

Toàn bộ các chức năng đánh giá kết nối, phát hiện sự cố, cảnh báo chất lượng và xác định nguyên nhân lỗi đều được xây dựng dựa trên dữ liệu được thu thập từ phân hệ này.
