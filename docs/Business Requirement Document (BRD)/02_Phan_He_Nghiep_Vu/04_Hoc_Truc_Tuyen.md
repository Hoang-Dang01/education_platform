# 4. Phân hệ Học trực tuyến (Online Learning Platform)

## 4.1. Mục tiêu
Phân hệ Học trực tuyến cung cấp môi trường giảng dạy và học tập trực tuyến theo thời gian thực, cho phép giáo viên và học viên tương tác trực tiếp thông qua âm thanh, hình ảnh, chia sẻ nội dung và các công cụ hỗ trợ lớp học.

Phân hệ này đóng vai trò là nền tảng tổ chức các buổi học trực tuyến, được tích hợp trực tiếp với hệ thống LMS và các chức năng điểm danh, giám sát và báo cáo.

## 4.2. Quản lý phòng học trực tuyến (Meeting Room)
* **Mô tả:** Mỗi buổi học được tổ chức dưới dạng một phòng học trực tuyến gắn với lịch học của lớp. Luồng nghiệp vụ điều phối (Meeting Orchestration) bao gồm: xác thực người dùng, kiểm tra lịch học, phân quyền tham gia (giáo viên/học viên), quản lý trạng thái phiên học (Session) và sinh Token gia nhập phòng học được làm chủ hoàn toàn bởi **EduMeet Backend**. Cơ sở hạ tầng hội nghị truyền hình bên thứ ba (như Jitsi Meet SFU) chỉ được tái sử dụng ở tầng truyền dẫn luồng truyền thông (Media Transport Layer) mà không kiểm soát trạng thái phòng hay nghiệp vụ đào tạo.
* **Chức năng:**
  * Điều phối và xác thực quyền gia nhập phòng học (qua API `/meetings/join`).
  * Khởi tạo và kết thúc phiên học (Session Lifecycle) ở backend.
  * Tham gia phòng học bằng Token cấu hình được cấp bởi EduMeet.
  * Rời phòng học và tự động cập nhật trạng thái session.
  * Quản lý danh sách người tham gia thực tế trong cơ sở dữ liệu.
  * Theo dõi trạng thái kết nối của người dùng qua WebSocket Gateway của EduMeet.

## 4.3. Camera và Microphone
* **Mô tả:** Cho phép người tham gia sử dụng hình ảnh và âm thanh trong quá trình học tập nhằm tăng tính tương tác giữa giáo viên và học viên.
* **Chức năng:**
  * Bật hoặc tắt camera.
  * Bật hoặc tắt microphone.
  * Hiển thị trạng thái camera và microphone của từng người tham gia.
  * Giáo viên có thể quản lý quyền sử dụng microphone của học viên.

## 4.4. Chia sẻ màn hình (Screen Sharing)
* **Mô tả:** Cho phép giáo viên hoặc người được cấp quyền chia sẻ nội dung trình bày trực tiếp trong buổi học.
* **Chức năng:**
  * Chia sẻ toàn bộ màn hình.
  * Chia sẻ một cửa sổ ứng dụng cụ thể.
  * Chia sẻ một tab trình duyệt.
  * Chuyển quyền chia sẻ màn hình.

## 4.5. Nhắn tin và trao đổi (Chat)
* **Mô tả:** Hỗ trợ trao đổi thông tin trong quá trình học tập mà không làm gián đoạn nội dung giảng dạy.
* **Chức năng:**
  * Chat toàn bộ lớp học.
  * Chat cá nhân.
  * Gửi biểu tượng cảm xúc (Emoji).
  * Gửi tập tin và tài liệu hỗ trợ.

## 4.6. Quản lý phát biểu (Raise Hand)
* **Mô tả:** Cho phép học viên đăng ký phát biểu và hỗ trợ giáo viên điều phối lớp học hiệu quả hơn.
* **Chức năng:**
  * **Đối với học viên:**
    * Giơ tay phát biểu.
    * Hủy yêu cầu phát biểu.
  * **Đối với giáo viên:**
    * Xem danh sách yêu cầu phát biểu.
    * Chấp nhận hoặc từ chối yêu cầu.
    * Bật hoặc tắt microphone của học viên.
    * Điều phối thứ tự phát biểu.

## 4.7. Chia nhóm thảo luận (Breakout Room)
* **Mô tả:** Cho phép giáo viên chia lớp học thành nhiều nhóm nhỏ để thảo luận hoặc thực hiện bài tập nhóm.
* **Chức năng:**
  * Tạo nhóm thảo luận.
  * Phân bổ học viên vào từng nhóm.
  * Di chuyển học viên giữa các nhóm.
  * Theo dõi hoạt động của từng nhóm.
  * Kết thúc và hợp nhất các nhóm về phòng học chính.

## 4.8. Ghi hình và lưu trữ bài giảng (Recording)
* **Mô tả:** Cho phép ghi lại toàn bộ nội dung buổi học để phục vụ việc xem lại, kiểm tra hoặc lưu trữ.
* **Chức năng:**
  * Bắt đầu và dừng ghi hình.
  * Tự động lưu trữ bản ghi sau khi kết thúc buổi học.
  * Quản lý danh sách bài giảng đã ghi hình.
  * Xem lại bài giảng trực tuyến.
  * Phân quyền truy cập bài giảng đã lưu.

## 4.9. Vai trò trong hệ thống
Phân hệ Học trực tuyến là môi trường diễn ra toàn bộ hoạt động giảng dạy và học tập. Dữ liệu phát sinh từ phân hệ này sẽ được sử dụng bởi các phân hệ khác như:
* Phân hệ Điểm danh (Attendance).
* Phân hệ Giám sát thời gian thực (Monitoring).
* Phân hệ Phân tích kết nối (Telemetry Analytics).
* Phân hệ Báo cáo và thống kê.
* Phân hệ Lưu trữ bài giảng.

Toàn bộ dữ liệu tham gia lớp học, thời gian kết nối, trạng thái người dùng và bản ghi bài giảng đều được liên kết với lớp học và lịch học được quản lý trong hệ thống LMS.
