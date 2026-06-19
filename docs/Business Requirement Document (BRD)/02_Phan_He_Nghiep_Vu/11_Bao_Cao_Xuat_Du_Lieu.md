# 11. Phân hệ Báo cáo và Xuất dữ liệu (Reporting & Export)

## 11.1. Mục tiêu
Phân hệ Báo cáo và Xuất dữ liệu cung cấp khả năng tổng hợp, phân tích và xuất dữ liệu đào tạo từ toàn bộ hệ thống.

Dữ liệu báo cáo được xây dựng dựa trên thông tin từ các phân hệ: LMS, Meeting, Attendance, Monitoring, Telemetry, và Network Diagnostics. Mục tiêu là hỗ trợ quản lý đánh giá hiệu quả đào tạo, theo dõi mức độ tham gia học tập và giám sát chất lượng vận hành của hệ thống.

## 11.2. Định dạng xuất dữ liệu
Hệ thống hỗ trợ xuất báo cáo dưới các định dạng phổ biến:
* **Excel (.xlsx)**
* **CSV (.csv)**
* **PDF (.pdf)**

Tùy theo nhu cầu sử dụng, người dùng có thể lựa chọn định dạng phù hợp để lưu trữ hoặc chia sẻ.

## 11.3. Báo cáo học viên
* **Mục tiêu:** Cung cấp thông tin chi tiết về quá trình tham gia học tập của từng học viên.
* **Thông tin báo cáo:**
  * **Thông tin cá nhân:** Mã học viên, Họ tên, Lớp học, Khóa học.
  * **Thống kê tham gia:** Tổng số buổi học, Số buổi đã tham gia, Số buổi vắng mặt, Tổng thời gian học thực tế, Tỷ lệ tham gia.
  * **Thống kê kết nối:** Tổng số lần mất kết nối, Tổng thời gian mất kết nối, Chất lượng kết nối trung bình.
  * **Kết quả điểm danh:** Đạt yêu cầu, Không đạt yêu cầu.

## 11.4. Báo cáo lớp học
* **Mục tiêu:** Đánh giá hiệu quả vận hành của từng lớp học.
* **Thông tin báo cáo:**
  * **Thông tin lớp học:** Mã lớp học, Tên lớp học, Giáo viên phụ trách, Thời gian đào tạo.
  * **Thống kê học tập:** Tổng số học viên, Số học viên tham gia, Tỷ lệ tham gia trung bình, Tỷ lệ hoàn thành lớp học.
  * **Thống kê chất lượng kết nối:** Latency trung bình, Packet Loss trung bình, Jitter trung bình, Số lượng cảnh báo phát sinh.
  * **Thống kê sự cố:** Tổng số sự cố kết nối, Số học viên gặp sự cố, Số lần gián đoạn lớp học.

## 11.5. Báo cáo khóa học
* **Mục tiêu:** Đánh giá hiệu quả triển khai của toàn bộ khóa học.
* **Thông tin báo cáo:**
  * Số lượng lớp học.
  * Số lượng học viên.
  * Tỷ lệ hoàn thành khóa học.
  * Tỷ lệ tham gia trung bình.
  * Tổng thời lượng đào tạo.
  * Chất lượng kết nối trung bình.
  * Tổng số sự cố phát sinh.

## 11.6. Báo cáo vận hành hệ thống
* **Mục tiêu:** Hỗ trợ quản trị viên theo dõi tình trạng vận hành của nền tảng.
* **Thông tin báo cáo:**
  * Tổng số lớp học được tổ chức.
  * Tổng số phiên học trực tuyến.
  * Tổng số người dùng hoạt động.
  * Tổng thời gian sử dụng hệ thống.
  * Tổng số kết nối được ghi nhận.
  * Tổng số cảnh báo chất lượng.
  * Tổng số sự cố hạ tầng.

## 11.7. Bộ lọc báo cáo
Người dùng có thể lọc dữ liệu theo nhiều tiêu chí khác nhau:
* **Thời gian:** Theo ngày, theo tuần, theo tháng, theo năm hoặc khoảng thời gian tùy chọn.
* **Đối tượng:** Khóa học, Lớp học, Giáo viên, Học viên.
* **Trạng thái:** Hoàn thành, Chưa hoàn thành, Đạt yêu cầu, Không đạt yêu cầu.

## 11.8. Lập lịch báo cáo
Hệ thống hỗ trợ tạo và gửi báo cáo tự động theo lịch (Hàng ngày, Hàng tuần, Hàng tháng). Báo cáo có thể được gửi qua email hoặc tải xuống trực tiếp từ hệ thống.

## 11.9. Vai trò trong hệ thống
Phân hệ Báo cáo và Xuất dữ liệu là tầng tổng hợp dữ liệu cuối cùng của hệ thống. Phân hệ này chuyển đổi dữ liệu vận hành, dữ liệu học tập và dữ liệu chất lượng kết nối thành các báo cáo phục vụ công tác quản lý, đánh giá và ra quyết định.

Đây là công cụ chính giúp tổ chức đào tạo đo lường hiệu quả hoạt động và chất lượng đào tạo trên toàn hệ thống.
