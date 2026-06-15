# THIẾT KẾ KỸ THUẬT NỀN TẢNG ĐÀO TẠO TRỰC TUYẾN (ZOOM EDUCATION PLATFORM)
## Technical Design Document (TDD)

Tài liệu thiết kế kỹ thuật này dành cho Architects, Tech Leads, Developers và QA để trả lời câu hỏi: **Hệ thống được thiết kế chi tiết như thế nào?**

Hệ thống được thiết kế theo hướng phân rã từ trên xuống (Top-Down):  
**Tổng quan → Domain → Bounded Context → Service → Module → API → Database → Event → Sequence → Implementation & Testing**

Tất cả các tài liệu được liên kết và đảm bảo tính truy vết (Traceability Matrix) xuyên suốt.

### Mục lục tài liệu (Table of Contents)

#### 01. Chỉ mục & Tổng quan (Index & Overview)
* [00. Document Index](00-document-index.md) — Định nghĩa cấu trúc tài liệu, quy ước định danh và cơ chế truy vết.
* [01. System Overview](01-system-overview.md) — Tổng quan hệ thống, bài toán nghiệp vụ, phạm vi và mục tiêu phi chức năng.

#### 02. Phân rã nghiệp vụ & Miền (Decomposition & Domain)
* [02. Domain Decomposition](02-domain-decomposition.md) — Phân rã các miền nghiệp vụ (Domain Map) của hệ thống.
* [03. Bounded Context Design](03-bounded-context-design.md) — Thiết kế ngữ cảnh giới hạn (Bounded Context) và cách tích hợp giữa chúng.

#### 03. Thiết kế Dịch vụ & Module (Service & Module Design)
* [04. Service Design](04-service-design.md) — Thiết kế danh mục dịch vụ (Service Catalog), ma trận trách nhiệm và phụ thuộc.
* [05. Module Design](05-module-design.md) — Kiến trúc chuẩn cho dịch vụ (Standard Layered Architecture, Folder Structure).

#### 04. Thiết kế Chi tiết & Hợp đồng dữ liệu (Detailed & Contract Design)
* [06. API Design](06-api-design.md) — Danh mục API và Đặc tả hợp đồng API (API Contract Specification).
* [07. Database Design](07-database-design.md) — Thiết kế Entity, Aggregate, Database Tables và vòng đời dữ liệu.
* [08. Event Design](08-event-design.md) — Thiết kế Event Catalog, Event Contract và cấu trúc hàng đợi sự kiện.

#### 05. Luồng xử lý & Luồng thời gian thực (Sequence & Realtime Design)
* [09. Sequence Design](09-sequence-design.md) — Biểu đồ tuần tự chi tiết cho các luồng: Join Meeting, Điểm danh, Analytics, Ghi hình.
* [10. Realtime Design](10-realtime-design.md) — Thiết kế chi tiết cho kết nối thời gian thực WebRTC, SignalR và Đồng bộ trạng thái hiện diện (Presence).

#### 06. An ninh & Hạ tầng (Security & Infrastructure)
* [11. Security Design](11-security-design.md) — Thiết kế xác thực (Authentication), phân quyền (Authorization) và ghi vết bảo mật (Audit).
* [12. Deployment Configuration](12-deployment-configuration.md) — Cấu hình và mô hình triển khai hạ tầng kỹ thuật.

#### 07. Kiểm thử & Truy vết (Testing & Traceability)
* [13. Testing Design](13-testing-design.md) — Chiến lược kiểm thử Unit Test, Integration Test và Performance Test.
* [14. Traceability Matrix](14-traceability-matrix.md) — Ma trận truy vết Requirement (RTM) và chuỗi liên kết toàn vẹn (Enterprise Traceability Chain).

---
Xem thêm chi tiết [Cấu trúc cây thư mục toàn dự án](../../Cau_Truc_Thu_Muc.md).
