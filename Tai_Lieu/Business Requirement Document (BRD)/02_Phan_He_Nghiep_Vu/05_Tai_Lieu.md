# 5. Phân hệ Tài liệu (Document Management)

## 5.1. Mục tiêu
Phân hệ Tài liệu cho phép lưu trữ, quản lý và chia sẻ các tài liệu phục vụ hoạt động giảng dạy và học tập trong hệ thống.

Tài liệu có thể được liên kết với khóa học, lớp học hoặc từng buổi học cụ thể, giúp giáo viên và học viên dễ dàng truy cập, sử dụng và quản lý nội dung đào tạo trên một nền tảng tập trung.

## 5.2. Loại tài liệu hỗ trợ
Hệ thống hỗ trợ các định dạng tài liệu phổ biến phục vụ nhu cầu đào tạo:
* **Tài liệu văn bản:** PDF, DOCX
* **Bảng tính:** XLSX
* **Tài liệu trình chiếu:** PPTX
* **Hình ảnh:** JPG, JPEG, PNG
* **Video:** MP4

Danh sách định dạng hỗ trợ có thể được mở rộng hoặc cấu hình theo nhu cầu vận hành của đơn vị sử dụng.

## 5.3. Chức năng
Phân hệ cung cấp các chức năng chính sau:
* Tải lên tài liệu.
* Chia sẻ tài liệu cho người dùng được cấp quyền.
* Tải xuống tài liệu.
* Tìm kiếm và tra cứu tài liệu.
* Liên kết tài liệu với khóa học, lớp học hoặc buổi học.
* Quản lý quyền truy cập tài liệu.

## 5.4. Quy tắc xử lý tài liệu
Trước khi lưu trữ, hệ thống thực hiện các bước kiểm tra và xử lý nhằm đảm bảo tính an toàn và hiệu quả trong quản lý dữ liệu.

### Kiểm tra định dạng
Chỉ cho phép tải lên các định dạng nằm trong danh sách được hỗ trợ. Các định dạng thực thi hoặc có nguy cơ gây mất an toàn thông tin sẽ bị từ chối.
* *Ví dụ các định dạng bị cấm:* EXE, BAT, CMD, DLL, APK

### Kiểm tra kích thước tệp
Hệ thống kiểm tra kích thước tệp trước khi lưu trữ. Giới hạn dung lượng tối đa được cấu hình theo chính sách vận hành của từng đơn vị sử dụng.

| Loại tài liệu | Kích thước tối đa |
| :--- | :---: |
| PDF | 100 MB |
| Office Documents | 50 MB |
| Hình ảnh | 20 MB |
| Video | 2 GB |

> *Lưu ý:* Các giá trị trên chỉ mang tính tham khảo và có thể thay đổi theo yêu cầu triển khai thực tế.

### Tiền xử lý dữ liệu
Để hỗ trợ quản lý và tra cứu hiệu quả, hệ thống có thể thực hiện một số bước xử lý tự động:
* **Đối với tài liệu PDF:**
  * Trích xuất metadata.
  * Xác định số trang.
  * Sinh ảnh đại diện (thumbnail).
* **Đối với hình ảnh:**
  * Kiểm tra định dạng.
  * Tối ưu dung lượng lưu trữ.
  * Sinh ảnh xem trước.
* **Đối với video:**
  * Kiểm tra định dạng và codec.
  * Sinh ảnh đại diện.
  * Trích xuất thông tin thời lượng.

## 5.5. Phân quyền truy cập
Hệ thống hỗ trợ kiểm soát quyền truy cập tài liệu theo vai trò người dùng (Admin, Manager, Teacher, Student) và phạm vi sử dụng.

Tài liệu có thể được gắn với:
* Khóa học.
* Lớp học.
* Buổi học.
* Nhóm người dùng cụ thể.

Chỉ những người dùng được cấp quyền mới có thể truy cập hoặc tải xuống tài liệu.

## 5.6. Lưu trữ
Tài liệu được lưu trữ trên hệ thống Object Storage nhằm đảm bảo khả năng mở rộng dữ liệu lớn, hiệu năng truy xuất cao, hỗ trợ sao lưu phục hồi và tối ưu cho video/tệp dung lượng lớn.

Hệ thống có thể triển khai trên:
* MinIO.
* Amazon S3.
* Azure Blob Storage.
* Các nền tảng lưu trữ tương đương.

## 5.7. Vai trò trong hệ thống
Phân hệ Tài liệu đóng vai trò là kho lưu trữ tập trung cho toàn bộ nội dung đào tạo. Dữ liệu từ phân hệ này được sử dụng bởi:
* Phân hệ LMS.
* Phân hệ Học trực tuyến.
* Phân hệ Ghi hình bài giảng.
* Phân hệ Báo cáo và thống kê.

Đồng thời đây cũng là nền tảng để mở rộng các chức năng nâng cao trong tương lai như tìm kiếm nội dung, phân tích tài liệu hoặc tích hợp trợ lý AI hỗ trợ học tập.
