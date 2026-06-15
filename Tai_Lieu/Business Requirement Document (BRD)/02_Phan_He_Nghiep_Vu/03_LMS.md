# 3. Phân hệ LMS (Learning Management System)

## 3.1. Mục tiêu
Phân hệ LMS là thành phần trung tâm của hệ thống, chịu trách nhiệm quản lý toàn bộ hoạt động đào tạo trước, trong và sau quá trình học trực tuyến.

Phân hệ này cho phép tổ chức đào tạo quản lý tập trung các khóa học, lớp học, giáo viên, học viên và lịch học trên cùng một nền tảng.

## 3.2. Quản lý khóa học
* **Mô tả:** Cho phép tạo và quản lý các chương trình đào tạo được triển khai trong hệ thống. Mỗi khóa học đại diện cho một nội dung đào tạo cụ thể và có thể được mở thành nhiều lớp học khác nhau.
* **Thông tin quản lý:**
  * Mã khóa học.
  * Tên khóa học.
  * Mô tả khóa học.
  * Danh mục khóa học.
  * Trạng thái hoạt động.
* **Chức năng:**
  * Tạo khóa học.
  * Cập nhật thông tin khóa học.
  * Ngừng hoặc kích hoạt khóa học.
  * Tìm kiếm và phân loại khóa học.

## 3.3. Quản lý lớp học
* **Mô tả:** Lớp học là đơn vị triển khai thực tế của một khóa học. Một khóa học có thể được tổ chức thành nhiều lớp học khác nhau theo thời gian, khu vực hoặc đối tượng học viên.
  * *Ví dụ:*
    * **Khóa học:** Java Cơ Bản
    * Lớp Java-CB-01
    * Lớp Java-CB-02
    * Lớp Java-CB-03
* **Thông tin quản lý:**
  * Mã lớp học.
  * Tên lớp học.
  * Khóa học liên kết.
  * Giáo viên phụ trách.
  * Danh sách học viên.
  * Trạng thái lớp học.
* **Chức năng:**
  * Tạo lớp học.
  * Gán giáo viên phụ trách.
  * Thêm hoặc xóa học viên.
  * Quản lý danh sách lớp.
  * Theo dõi trạng thái lớp học.

## 3.4. Quản lý lịch học
* **Mô tả:** Cho phép xâyững và quản lý lịch học cho từng lớp học, đồng thời liên kết trực tiếp với hệ thống học trực tuyến. Lịch học là cơ sở để hệ thống tạo phiên học trực tuyến, gửi thông báo và phục vụ công tác điểm danh.
* **Thông tin quản lý:**
  * Ngày học.
  * Giờ bắt đầu.
  * Giờ kết thúc.
  * Phòng học trực tuyến.
  * Trạng thái buổi học.
* **Chức năng:**
  * Tạo lịch học.
  * Chỉnh sửa lịch học.
  * Hủy lịch học.
  * Gửi thông báo cho giáo viên và học viên.
  * Liên kết với phiên học trực tuyến.

## 3.5. Vai trò trong hệ thống
Phân hệ LMS đóng vai trò là nguồn dữ liệu trung tâm cho các phân hệ khác. Các phân hệ sử dụng dữ liệu từ LMS bao gồm:
* Phân hệ học trực tuyến (Meeting).
* Phân hệ điểm danh (Attendance).
* Phân hệ báo cáo và thống kê.
* Phân hệ giám sát lớp học.
* Phân hệ lưu trữ bài giảng.

Mọi phiên học trực tuyến, dữ liệu điểm danh và báo cáo đều được liên kết với khóa học và lớp học được quản lý trong LMS.
