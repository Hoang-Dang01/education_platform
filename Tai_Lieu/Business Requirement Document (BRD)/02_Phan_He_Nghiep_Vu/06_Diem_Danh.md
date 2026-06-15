# 6. Phân hệ Điểm danh (Attendance Management)

## 6.1. Mục tiêu
Phân hệ Điểm danh chịu trách nhiệm ghi nhận, theo dõi và thống kê quá trình tham gia lớp học của học viên trong các buổi học trực tuyến.

Khác với hình thức điểm danh truyền thống chỉ xác nhận sự có mặt, hệ thống cho phép xác định chính xác thời gian tham gia thực tế, số lần mất kết nối và mức độ hoàn thành của từng học viên trong mỗi buổi học. Dữ liệu điểm danh được sử dụng cho báo cáo đào tạo, đánh giá mức độ tham gia học tập và các nghiệp vụ quản lý liên quan.

## 6.2. Nguyên tắc hoạt động
Việc điểm danh được thực hiện hoàn toàn tự động dựa trên trạng thái kết nối của người dùng trong phòng học trực tuyến.

Khi người dùng tham gia hoặc rời khỏi lớp học, hệ thống sẽ ghi nhận các sự kiện tương ứng và lưu vào lịch sử tham gia của buổi học. Toàn bộ dữ liệu được xử lý tự động, không yêu cầu giáo viên thực hiện điểm danh thủ công.

## 6.3. Các sự kiện ghi nhận
Trong quá trình tham gia lớp học, hệ thống ghi nhận các loại sự kiện sau:
* **JOIN:** Người dùng tham gia phòng học thành công.
* **LEAVE:** Người dùng chủ động rời khỏi phòng học.
* **DISCONNECT:** Người dùng bị mất kết nối do lỗi mạng, mất điện hoặc sự cố thiết bị.
* **RECONNECT:** Người dùng kết nối lại sau khi bị ngắt kết nối.

## 6.4. Theo dõi lịch sử tham gia
Đối với mỗi học viên, hệ thống lưu toàn bộ lịch sử tham gia trong suốt thời gian diễn ra buổi học.

*Ví dụ lịch sử sự kiện:*

| Thời gian | Sự kiện |
| :---: | :---: |
| 08:00 | JOIN |
| 08:20 | DISCONNECT |
| 08:25 | RECONNECT |
| 09:00 | LEAVE |

Từ lịch sử trên, hệ thống tính toán:
* Thời gian tham gia lần 1: 20 phút.
* Thời gian tham gia lần 2: 35 phút.
* **Tổng thời gian tham gia thực tế:** 55 phút.

## 6.5. Tính toán thời gian tham gia
Hệ thống tính tổng thời gian học dựa trên khoảng thời gian người dùng thực sự duy trì kết nối với lớp học. Các khoảng thời gian mất kết nối sẽ không được tính vào thời gian tham gia thực tế.

> **Công thức:**
> `Tổng thời gian tham gia = Tổng thời gian kết nối hợp lệ`

*Ví dụ:*
* **Buổi học:** 08:00 - 09:00
* **Chi tiết sự kiện của học viên:**
  * 08:00: JOIN
  * 08:15: DISCONNECT
  * 08:25: RECONNECT
  * 09:00: LEAVE
* **Kết quả tính toán:**
  * Kết nối lần 1: 15 phút.
  * Kết nối lần 2: 35 phút.
  * **Tổng thời gian tham gia:** 50 phút.

## 6.6. Thống kê mất kết nối
Hệ thống theo dõi số lần mất kết nối của từng học viên trong quá trình học.

*Ví dụ sự cố mạng:*

| Thời gian | Sự kiện |
| :---: | :---: |
| 08:15 | DISCONNECT |
| 08:35 | DISCONNECT |
| 08:50 | DISCONNECT |

* **Kết quả:** Số lần mất kết nối là 3 lần.

Thông tin này được sử dụng để đánh giá chất lượng tham gia và hỗ trợ phân tích sự cố kết nối.

## 6.7. Đánh giá mức độ tham gia
Hệ thống cho phép xác định tỷ lệ tham gia của học viên dựa trên thời lượng học thực tế so với thời lượng buổi học.

> **Công thức:**
> `Tỷ lệ tham gia (%) = (Thời gian tham gia thực tế / Tổng thời lượng buổi học) * 100`

*Ví dụ:*
* **Thời lượng buổi học:** 120 phút
* **Thời gian tham gia:** 108 phút
* **Kết quả:** Tỷ lệ tham gia đạt `90%`

## 6.8. Kết quả thống kê
Đối với mỗi buổi học, hệ thống cung cấp các chỉ số:
* **Thông tin tham gia:**
  * Thời gian vào lớp.
  * Thời gian rời lớp.
  * Tổng thời gian tham gia thực tế.
  * Tỷ lệ tham gia.
* **Thông tin kết nối:**
  * Số lần mất kết nối.
  * Tổng thời gian mất kết nối.
  * Thời gian kết nối dài nhất.
  * Thời gian kết nối trung bình.
* **Trạng thái hoàn thành:**
  * Đạt yêu cầu tham gia.
  * Không đạt yêu cầu tham gia.

Ngưỡng đánh giá có thể được cấu hình theo quy định của từng đơn vị đào tạo.
* *Ví dụ định nghĩa ngưỡng:*
  * **Đạt:** tham gia từ 80% thời lượng buổi học trở lên.
  * **Không đạt:** tham gia dưới 80% thời lượng buổi học.

## 6.9. Báo cáo điểm danh
Hệ thống hỗ trợ tổng hợp và xuất báo cáo điểm danh theo: Buổi học, Lớp học, Khóa học, Học viên.

*Các định dạng xuất báo cáo hỗ trợ:* Excel, CSV, PDF.

## 6.10. Vai trò trong hệ thống
Phân hệ Điểm danh là nguồn dữ liệu chính phục vụ công tác quản lý và đánh giá quá trình học tập. Dữ liệu từ phân hệ này được sử dụng bởi:
* Phân hệ Báo cáo và thống kê.
* Phân hệ Giám sát lớp học.
* Phân hệ Phân tích chất lượng đào tạo.
* Phân hệ Quản lý học viên.

Đây là cơ sở để xác định mức độ tham gia thực tế của học viên thay vì chỉ dựa trên việc có mặt trong lớp học.
