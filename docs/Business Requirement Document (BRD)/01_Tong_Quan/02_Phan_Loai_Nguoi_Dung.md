# 2. Phân loại người dùng

Hệ thống được thiết kế với mô hình phân quyền theo vai trò (Role-Based Access Control - RBAC), nhằm đảm bảo mỗi nhóm người dùng chỉ được truy cập và thực hiện các chức năng phù hợp với trách nhiệm của mình.

## 2.1. Quản trị hệ thống (Admin)
* **Vai trò:** Là người quản trị cao nhất của hệ thống, chịu trách nhiệm quản lý toàn bộ dữ liệu, người dùng và hoạt động vận hành.
* **Quyền hạn:**
  * Quản lý tài khoản người dùng.
  * Quản lý vai trò và phân quyền.
  * Quản lý khóa học và lớp học.
  * Quản lý giáo viên và học viên.
  * Theo dõi toàn bộ lớp học đang diễn ra.
  * Giám sát chất lượng kết nối của hệ thống.
  * Truy cập và xuất các báo cáo tổng hợp.
  * Cấu hình các tham số vận hành của hệ thống.

## 2.2. Quản lý đào tạo (Manager)
* **Vai trò:** Là người chịu trách nhiệm điều phối và giám sát hoạt động đào tạo trong phạm vi đơn vị hoặc chương trình đào tạo được phân công.
* **Quyền hạn:**
  * Quản lý khóa học.
  * Quản lý lớp học.
  * Phân công giáo viên.
  * Theo dõi lịch học.
  * Giám sát các lớp học đang diễn ra.
  * Theo dõi tỷ lệ tham gia học tập.
  * Xem báo cáo và thống kê đào tạo.
  * Theo dõi chất lượng vận hành của lớp học.

## 2.3. Giáo viên (Teacher)
* **Vai trò:** Là người trực tiếp tổ chức và điều hành các buổi học trực tuyến.
* **Quyền hạn:**
  * Quản lý lớp học được phân công.
  * Tổ chức và điều hành phiên học trực tuyến.
  * Quản lý danh sách học viên trong lớp.
  * Chia sẻ tài liệu học tập.
  * Thực hiện điểm danh.
  * Quản lý quyền phát biểu của học viên.
  * Ghi hình và lưu trữ bài giảng.
  * Theo dõi trạng thái tham gia của học viên.

## 2.4. Học viên (Student)
* **Vai trò:** Là người tham gia các chương trình đào tạo và lớp học trực tuyến.
* **Quyền hạn:**
  * Tham gia lớp học được phân công.
  * Truy cập tài liệu học tập.
  * Sử dụng camera và microphone trong phạm vi cho phép.
  * Gửi tin nhắn và trao đổi trong lớp học.
  * Tham gia phát biểu và tương tác với giáo viên.
  * Xem lịch học và thông tin khóa học.
  * Xem lại các bài giảng được cấp quyền truy cập.

## 2.5. Ma trận phân quyền tổng quan

| Chức năng                   | Admin | Manager | Teacher | Student |
| :-------------------------- | :---: | :-----: | :-----: | :-----: |
| Quản lý người dùng          |  Có   |    -    |    -    |    -    |
| Quản lý khóa học            |  Có   |   Có    |    -    |    -    |
| Quản lý lớp học             |  Có   |   Có    |   Có*   |    -    |
| Quản lý học viên            |  Có   |   Có    |   Có    |    -    |
| Tổ chức lớp học trực tuyến  |  Có   |   Có    |   Có    |    -    |
| Tham gia lớp học            |  Có   |   Có    |   Có    |   Có    |
| Chia sẻ tài liệu            |  Có   |   Có    |   Có    |    -    |
| Điểm danh                   |  Có   |   Có    |   Có    |    -    |
| Giám sát lớp học            |  Có   |   Có    |    -    |    -    |
| Xem báo cáo                 |  Có   |   Có    |  Có**   |    -    |

> * Trong phạm vi lớp học được phân công.  
> ** Chỉ xem dữ liệu liên quan đến lớp học phụ trách.
