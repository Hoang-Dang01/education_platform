# Tổng quan về Quy trình Nghiệp vụ & Giao diện (Design & Process Workflows)

Phân hệ tài liệu này định nghĩa chi tiết các sơ đồ quy trình nghiệp vụ hoạt động (BPMN) và bản vẽ cấu trúc giao diện sơ bộ (Wireframes) của hệ thống **Zoom Education Platform**. Đây là tài liệu nền tảng giúp lập trình viên Frontend và Backend hiểu rõ vị trí hiển thị, luồng chuyển đổi màn hình (Navigation) và cách thức vận hành nghiệp vụ trực quan của hệ thống.

---

## 1. Mục tiêu của Phân hệ tài liệu
* **Trực quan hóa quy trình hoạt động (Process Modeling):** Chuyển dịch các đặc tả chữ của Use Cases thành sơ đồ quy trình trực quan (BPMN sử dụng Mermaid), chỉ rõ luồng công việc giữa Client, Server, và các dịch vụ bên ngoài.
* **Định hình bố cục giao diện (UX Wireframing):** Thiết kế cấu trúc lưới, phân bổ vị trí các khối thành phần (Sidebar, Header, Main content, Video grid) trực tiếp trong Markdown bằng mã Mermaid hoặc khối ASCII, giúp thống nhất thiết kế trước khi vẽ UI hoàn chỉnh.
* **Liên kết nghiệp vụ (Traceability):** Đảm bảo mỗi màn hình wireframe phản ánh chính xác các yêu cầu chức năng (FR) trong SRS và tương thích với dữ liệu được thiết kế trong TDD.

---

## 2. Bản đồ phân bổ tài liệu chi tiết

Thư mục này bao gồm 6 tài liệu con, phục vụ các mục tiêu thiết kế chuyên biệt:

### 📂 01. Sơ đồ quy trình nghiệp vụ
* **[01_BPMN_Workflows.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/01_BPMN_Workflows.md)**
  * Chứa các sơ đồ luồng quy trình (BPMN / Flowchart) mô tả vòng đời hoạt động của hệ thống:
    1. Vòng đời lớp học trực tuyến (Tạo lớp → Vào phòng → Điểm danh → Ghi hình → Kết thúc).
    2. Quy trình điểm danh tự động và ngắt kết nối/kết nối lại.
    3. Quy trình chẩn đoán sự cố mạng khi telemetry phát tín hiệu vượt ngưỡng.

### 📂 02. Quy chuẩn thiết kế giao diện
* **[02_Wireframes_Mockups.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/02_Wireframes_Mockups.md)**
  * Xác lập các quy chuẩn chung về thiết kế giao diện:
    * Hệ màu sắc cảnh báo phân cấp (Xanh lá/Xanh dương/Cam/Đỏ) khớp với chỉ định trong [UC-MON-001](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/User%20Stories%20&%20Use%20Cases/02_Use_Case_Specifications.md#25-uc-mon-001-giam-sat-telemetry--canh-bao-chat-luong-ket-noi).
    * Quy tắc bố trí các khối màn hình và hệ thống grid responsive.
    * Trình bày cách vẽ khung dây (Wireframe) bằng cú pháp Mermaid.

### 📂 03. Đặc tả Wireframe từng phân hệ giao diện
* **[03_LMS_Dashboard_Wireframe.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/03_LMS_Dashboard_Wireframe.md)**
  * Wireframe Dashboard quản lý học tập dành cho Học viên và Giáo viên.
  * Hiển thị danh sách khóa học, lịch học, và nút tham gia phòng học trực tuyến nhanh.

* **[04_Realtime_Monitoring_Dashboard_Wireframe.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/04_Realtime_Monitoring_Dashboard_Wireframe.md)**
  * Giao diện giám sát mạng real-time của Admin.
  * Hiển thị danh sách lớp đang mở, thông số WebRTC telemetry và các cảnh báo kết nối kém dạng biểu đồ time-series.

* **[05_Online_Learning_Interface_Wireframe.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/05_Online_Learning_Interface_Wireframe.md)**
  * Wireframe quan trọng nhất: Giao diện phòng họp WebRTC SFU.
  * Mô tả lưới video (Video Grid), khung chat, bảng điều khiển (toolbar) của Giáo viên/Học viên, hiển thị indicator "REC", popup cam kết ghi hình (Consent Prompt), và widget đo lường chất lượng mạng.

* **[06_Attendance_Interface_Wireframe.md](file:///c:/Git%20cua%20tui/education-platform/Tai_Lieu/Design%20&%20Process%20Workflows/06_Attendance_Interface_Wireframe.md)**
  * Giao diện điểm danh tự động, theo dõi lịch sử điểm danh của học viên và bảng quản trị xuất file báo cáo điểm danh Excel/PDF.

---

## 3. Quy chuẩn vẽ Wireframe bằng Mermaid
Để giữ tính nhất quán, các wireframe trong tài liệu này được biểu diễn bằng sơ đồ Mermaid `graph TD` hoặc `graph LR` với cách gán nhãn mô phỏng layout:

```text
graph TD
    subgraph Màn_hình_A ["🖥️ Tiêu đề trang / URL"]
        Block_1["[ Khối Header: Logo | Search | User Profiler ]"]
        Block_2["[ Khối Sidebar: Navigation links ]"]
        Block_3["[ Khối Main: Main data table / Content Area ]"]
    end
```
Quy ước này giúp giữ cấu trúc tài liệu sạch sẽ, trực quan và dễ sửa đổi trực tiếp bằng code mà không cần phụ thuộc vào file ảnh bên ngoài.
