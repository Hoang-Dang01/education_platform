# Cấu trúc thư mục dự án (Project Directory Structure)

Dưới đây là sơ đồ cấu trúc cây thư mục toàn bộ dự án **Zoom Education Platform**:

```text
education-platform/
├── README.md                              # Giới thiệu dự án và hướng dẫn chung
├── Cau_Truc_Thu_Muc.md                    # Sơ đồ cấu trúc cây thư mục của dự án (file này)
└── Tai_Lieu/                              # Thư mục chứa tài liệu dự án
    ├── Business Requirement Document (BRD)/ # Thư mục tài liệu yêu cầu nghiệp vụ (BRD)
    │   ├── README.md                      # Mục lục tài liệu BRD (Table of Contents)
    │   ├── 01_Tong_Quan/                  # Tổng quan dự án & Người dùng
    │   │   ├── 01_Muc_Tieu_Du_An.md       # 1. Mục tiêu dự án
    │   │   └── 02_Phan_Loai_Nguoi_Dung.md # 2. Phân loại người dùng
    │   ├── 02_Phan_He_Nghiep_Vu/          # Các phân hệ chức năng
    │   │   ├── 03_LMS.md                  # 3. Phân hệ LMS
    │   │   ├── 04_Hoc_Truc_Tuyen.md       # 4. Phân hệ Học trực tuyến
    │   │   ├── 05_Tai_Lieu.md             # 5. Phân hệ Tài liệu
    │   │   ├── 06_Diem_Danh.md            # 6. Phân hệ Điểm danh
    │   │   └── 11_Bao_Cao_Xuat_Du_Lieu.md # 11. Phân hệ Báo cáo và Xuất dữ liệu
    │   ├── 03_Giam_Sat_Telemetry/         # Giám sát và phân tích mạng
    │   │   ├── 07_Giam_Sat_Thoi_Gian_Thuc.md      # 7. Phân hệ Giám sát thời gian thực
    │   │   ├── 08_Telemetry_Network_Analytics.md  # 8. Phân hệ Telemetry & Network Analytics
    │   │   ├── 09_Giam_Sat_Nguoi_Dung.md          # 9. Giám sát người dùng
    │   │   └── 10_Chan_Doan_Su_Co.md              # 10. Phân hệ Chẩn đoán nguyên nhân sự cố
    │   └── 04_Ket_Luan/                   # Kết luận tài liệu BRD
    │       └── 12_Ket_Luan.md             # 12. Kết luận
    │
    ├── Software Requirement Specification (SRS)/ # Thư mục đặc tả yêu cầu phần mềm (SRS)
    │   ├── README.md                      # Mục lục tài liệu SRS
    │   ├── 01_Functional_Requirements.md  # Yêu cầu chức năng
    │   ├── 02_Non_Functional_Requirements.md # Yêu cầu phi chức năng
    │   └── 03_System_Constraints.md       # Ràng buộc hệ thống
    │
    ├── User Stories & Use Cases/          # Thư mục quản lý câu chuyện người dùng & ca sử dụng
    │   ├── README.md                      # Mục lục tài liệu User Stories & Use Cases
    │   ├── 01_Use_Case_Diagrams.md        # Sơ đồ Use Case
    │   ├── 02_Use_Case_Specifications.md  # Đặc tả Use Case chi tiết
    │   ├── 03_User_Stories_Catalog.md     # Danh mục User Stories và Acceptance Criteria
    │   └── 04_Acceptance_Criteria_Format_Standard.md # Chuẩn tiêu chí nghiệm thu (Given/When/Then)
    │
    ├── Design & Process Workflows/        # Thư mục thiết kế quy trình và giao diện sơ bộ
    │   ├── README.md                      # Mục lục tài liệu quy trình & giao diện
    │   ├── 01_BPMN_Workflows.md           # Sơ đồ quy trình nghiệp vụ BPMN
    │   ├── 02_Wireframes_Mockups.md       # Thiết kế Wireframes và Mockups chung
    │   ├── 03_LMS_Dashboard_Wireframe.md  # Wireframe Dashboard LMS
    │   ├── 04_Realtime_Monitoring_Dashboard_Wireframe.md # Wireframe Dashboard giám sát thời gian thực
    │   ├── 05_Online_Learning_Interface_Wireframe.md # Wireframe giao diện học trực tuyến WebRTC
    │   └── 06_Attendance_Interface_Wireframe.md # Wireframe giao diện điểm danh
    │
    ├── Data Mapping/                      # Thư mục đặc tả chuyển đổi/ánh xạ dữ liệu
    │   ├── README.md                      # Mục lục tài liệu ánh xạ dữ liệu
    │   ├── 01_Data_Mapping_Specification.md # Đặc tả ánh xạ dữ liệu chi tiết
    │   ├── 02_Data_Model_ERD.md           # Sơ đồ quan hệ thực thể (ERD) và dữ liệu
    │   └── 03_Data_Migration_Strategy.md  # Chiến lược và kịch bản di chuyển dữ liệu
    │
    ├── Technical Requirement Document (TRD)/ # Thư mục tài liệu đặc tả kỹ thuật (TRD)
    │   ├── README.md                      # Mục lục tài liệu TRD (Table of Contents)
    │   ├── 01_Kien_Truc/                  # Kiến trúc hệ thống đề xuất
    │   │   ├── 01_Kien_Truc_De_Xuat.md    # 1. Kiến trúc hệ thống đề xuất
    │   │   └── 02_Kien_Truc_Tong_The.md   # 2. Kiến trúc tổng thể
    │   └── 02_Ke_Hoach_Va_Danh_Gia/        # Kế hoạch triển khai & Đánh giá
    │       ├── 03_Ke_Hoach_Trien_Khai.md  # 3. Kế hoạch triển khai hệ thống
    │       └── 04_Danh_Gia_Do_Phuc_Tap.md # 4. Đánh giá độ phức tạp hệ thống
    │
    ├── Solution Architecture Document (SAD)/ # Thư mục kiến trúc giải pháp (SAD)
    │   ├── README.md                      # Mục lục tài liệu SAD (Table of Contents)
    │   ├── 01_Tong_Quan/                  # Giới thiệu tổng quan
    │   │   └── 01_Gioi_Thieu.md           # 1. Giới thiệu tổng quan
    │   ├── 02_Kien_Truc_Thiet_Ke/         # Kiến trúc chi tiết các miền & dịch vụ
    │   │   ├── 02_Kien_Truc_Tong_The.md   # 2. Kiến trúc tổng thể
    │   │   ├── 03_Domain_Architecture.md  # 3. Kiến trúc miền (Domain)
    │   │   ├── 04_Service_Architecture.md # 4. Kiến trúc dịch vụ (Service)
    │   │   └── 05_Data_Flow_Architecture.md # 5. Luồng dữ liệu (Data Flow)
    │   ├── 03_Cong_Nghe_Ha_Tang/          # Thiết kế kỹ thuật & Mở rộng
    │   │   ├── 06_Technology_Stack.md     # 6. Lựa chọn công nghệ
    │   │   ├── 07_Scalability_Strategy.md # 7. Chiến lược mở rộng
    │   │   ├── 08_Security_Architecture.md # 8. Kiến trúc bảo mật
    │   │   └── 09_Deployment_Architecture.md # 9. Mô hình triển khai
    │   └── 04_Ket_Luan_Phu_Luc/           # Phần kết & Phụ lục tham chiếu
    │       ├── 10_Ket_Luan.md             # 10. Kết luận
    │       └── 11_Appendix.md             # 11. Appendix & Quyết định kiến trúc (ADR)
    │
    └── Technical Design Document (TDD)/   # Thư mục thiết kế kỹ thuật chi tiết (TDD)
        ├── README.md                      # Mục lục tài liệu TDD (Table of Contents)
        ├── 00-document-index.md           # Chỉ mục tài liệu và cơ chế truy vết
        ├── 01-system-overview.md          # Tổng quan hệ thống
        ├── 02-domain-decomposition.md     # Phân rã miền nghiệp vụ
        ├── 03-bounded-context-design.md   # Thiết kế ngữ cảnh giới hạn (Bounded Context)
        ├── 04-service-design.md           # Thiết kế danh mục dịch vụ chi tiết
        ├── 05-module-design.md            # Thiết kế cấu trúc module/dịch vụ
        ├── 06-api-design.md               # Danh mục và đặc tả hợp đồng API
        ├── 07-database-design.md          # Thiết kế thực thể (Entity) & Database
        ├── 08-event-design.md             # Danh mục và hợp đồng sự kiện (Event)
        ├── 09-sequence-design.md          # Thiết kế luồng xử lý chi tiết (Sequence Diagram)
        ├── 10-realtime-design.md          # Thiết kế giao thức thời gian thực (WebRTC, SignalR, Presence)
        ├── 11-security-design.md          # Thiết kế chi tiết xác thực, phân quyền & audit
        ├── 12-deployment-configuration.md # Cấu hình và chiến lược triển khai hạ tầng
        ├── 13-testing-design.md           # Thiết kế và kế hoạch kiểm thử hệ thống
        └── 14-traceability-matrix.md      # Ma trận truy vết yêu cầu (Requirement Traceability Matrix)
```

---

## Trạng thái triển khai tài liệu (Documentation Progress Status)

Dưới đây là bảng theo dõi tiến độ hoàn thiện của từng thư mục tài liệu trong dự án:

| Thư mục tài liệu | Trạng thái | Mức độ hoàn thiện | Ghi chú |
| :--- | :---: | :---: | :--- |
| **Business Requirement Document (BRD)** | ✅ Hoàn thành | 100% | Đặc tả đầy đủ yêu cầu nghiệp vụ cho 9 phân hệ |
| **Software Requirement Specification (SRS)** | ✅ Hoàn thành | 100% | Đã đóng phase Requirements & kiểm tra tính nhất quán |
| **Technical Requirement Document (TRD)** | ✅ Hoàn thành | 100% | Đã hoàn thành thiết kế kiến trúc đề xuất |
| **Solution Architecture Document (SAD)** | ✅ Hoàn thành | 100% | Đã hoàn thành tài liệu kiến trúc giải pháp |
| **Technical Design Document (TDD)** | ✅ Hoàn thành | 100% | Đã tích hợp sơ đồ Mermaid Sequence & Class trực quan |
| **User Stories & Use Cases** | ✅ Hoàn thành | 100% | Đã chốt đặc tả Use Cases và danh mục User Stories BDD |
| **Design & Process Workflows** | ✅ Hoàn thành | 100% | Đã hoàn thành sơ đồ BPMN & Wireframes |
| **Data Mapping** | ✅ Hoàn thành | 100% | Đã hoàn thành ERD & Chiến lược di chuyển dữ liệu |

