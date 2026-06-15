# 3. Domain Architecture
3.1. Tổng quan
Để đảm bảo khả năng mở rộng, dễ bảo trì và phân tách trách nhiệm rõ ràng, hệ thống được tổ chức thành ba miền chức năng (Domain) chính:
LMS Domain
Meeting Domain
Analytics Domain
Mỗi Domain chịu trách nhiệm cho một nhóm nghiệp vụ độc lập và giao tiếp với nhau thông qua API hoặc Event.
Online Learning Platform

├── LMS Domain
├── Meeting Domain
└── Analytics Domain

Việc phân tách theo Domain giúp:
Giảm sự phụ thuộc giữa các thành phần.
Dễ dàng mở rộng hệ thống.
Hỗ trợ phát triển song song giữa các nhóm.
Tăng khả năng bảo trì và nâng cấp trong tương lai.

3.2. LMS Domain
Mục tiêu
LMS Domain chịu trách nhiệm quản lý toàn bộ dữ liệu và nghiệp vụ liên quan đến đào tạo.
Đây là nguồn dữ liệu nghiệp vụ chính của hệ thống.

Thành phần
User Service
Quản lý:
Người dùng.
Vai trò.
Phân quyền.
Các vai trò hỗ trợ:
Admin
Manager
Teacher
Student

Course Service
Quản lý:
Khóa học.
Chương trình đào tạo.
Danh mục khóa học.
Thông tin chính:
Mã khóa học.
Tên khóa học.
Mô tả.
Trạng thái.

Class Service
Quản lý:
Lớp học.
Giáo viên phụ trách.
Danh sách học viên.
Lịch học.
Thông tin chính:
Mã lớp.
Tên lớp.
Khóa học.
Giáo viên.
Học viên.

File Service
Quản lý:
Tài liệu học tập.
Hình ảnh.
Video.
File đính kèm.
Hỗ trợ:
Upload.
Download.
Chia sẻ tài liệu.
Phân quyền truy cập.

Trách nhiệm
LMS Domain chịu trách nhiệm:
Quản lý dữ liệu đào tạo.
Quản lý người dùng.
Quản lý nội dung học tập.
Cung cấp dữ liệu cho Meeting Domain và Analytics Domain.

3.3. Meeting Domain
Mục tiêu
Meeting Domain chịu trách nhiệm tổ chức và vận hành các lớp học trực tuyến theo thời gian thực.
Đây là Domain quan trọng nhất trong quá trình giảng dạy và học tập.

Thành phần
Meeting Service
Quản lý vòng đời lớp học trực tuyến:
Tạo phòng học.
Đóng phòng học.
Quản lý người tham gia.
Điều phối phiên học.

LiveKit Cluster
Đóng vai trò Media Server của hệ thống.
Chịu trách nhiệm:
Audio Streaming.
Video Streaming.
Screen Sharing.
Participant Routing.

Recording Service
Quản lý:
Ghi hình buổi học.
Lưu trữ video.
Truy xuất Recording.
Dữ liệu được lưu trữ trên MinIO hoặc S3.

Realtime Interaction
Hỗ trợ:
Chat.
Raise Hand.
Teacher Control.
Participant Management.

Trách nhiệm
Meeting Domain chịu trách nhiệm:
Tổ chức lớp học trực tuyến.
Truyền tải Audio và Video.
Quản lý tương tác thời gian thực.
Phát sinh các sự kiện phục vụ Attendance và Analytics.

3.4. Analytics Domain
Mục tiêu
Analytics Domain chịu trách nhiệm thu thập, xử lý và phân tích dữ liệu vận hành của hệ thống.
Đây là Domain tạo nên sự khác biệt của nền tảng so với các giải pháp LMS hoặc Video Conference truyền thống.

Thành phần
Attendance Engine
Xử lý các sự kiện:
JOIN
LEAVE
DISCONNECT
RECONNECT
Tính toán:
Thời gian học thực tế.
Tỷ lệ tham gia.
Kết quả điểm danh.

Telemetry Collector
Thu thập dữ liệu từ:
WebRTC Statistics API.
LiveKit Metrics.
System Metrics.
Các chỉ số thu thập:
Latency.
Packet Loss.
Jitter.
RTT.
FPS.
Bitrate.

Analytics Engine
Thực hiện:
Xử lý dữ liệu Telemetry.
Tổng hợp dữ liệu thời gian thực.
Tạo dữ liệu Dashboard.

Diagnostics Engine
Phân tích nguyên nhân sự cố.
Các nhóm lỗi:
Host Side Issues.
Participant Side Issues.
Infrastructure Issues.
Mục tiêu:
Xác định nguyên nhân.
Khoanh vùng phạm vi ảnh hưởng.
Hỗ trợ xử lý sự cố.

Reporting Engine
Tổng hợp dữ liệu từ:
LMS.
Attendance.
Telemetry.
Meeting.
Tạo:
Báo cáo học viên.
Báo cáo lớp học.
Báo cáo vận hành.

Trách nhiệm
Analytics Domain chịu trách nhiệm:
Giám sát hoạt động hệ thống.
Điểm danh tự động.
Theo dõi chất lượng kết nối.
Chẩn đoán sự cố.
Cung cấp Dashboard và Báo cáo.

3.5. Quan hệ giữa các Domain
LMS Domain
     │
     ▼

Meeting Domain

     │
     ▼

Analytics Domain

LMS Domain
Cung cấp dữ liệu:
Người dùng.
Khóa học.
Lớp học.

Meeting Domain
Tiêu thụ dữ liệu từ LMS Domain để tổ chức lớp học.
Đồng thời phát sinh các sự kiện phục vụ Analytics Domain.

Analytics Domain
Tiêu thụ dữ liệu từ:
LMS Domain.
Meeting Domain.
Để thực hiện:
Attendance.
Monitoring.
Diagnostics.
Reporting.

3.6. Kết luận
Kiến trúc Domain được xây dựng theo mô hình phân tách trách nhiệm rõ ràng giữa LMS, Meeting và Analytics.
Cách tiếp cận này giúp hệ thống dễ mở rộng, dễ bảo trì và tạo nền tảng cho việc triển khai các dịch vụ chuyên biệt trong tương lai mà không ảnh hưởng đến các thành phần còn lại của hệ thống.
