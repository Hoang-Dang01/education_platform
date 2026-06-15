# 4. Đánh giá độ phức tạp hệ thống

> **Mục đích:** Đánh giá mức độ phức tạp kỹ thuật của từng phân hệ để hỗ trợ ước lượng thời gian, nguồn lực và xác định rủi ro.
> **Tham chiếu:** TRD 03_Ke_Hoach_Trien_Khai.md · TDD 04-service-design.md

---

## 4.1 Mục tiêu

Đánh giá này nhằm hỗ trợ:

- Ước lượng thời gian phát triển từng phân hệ
- Ước lượng nguồn lực cần thiết (nhân lực, hạ tầng)
- Xác định các khu vực có rủi ro kỹ thuật cao cần chú trọng kiểm thử

---

## 4.2 Bảng đánh giá tổng quan

| Phân hệ | Độ khó | Ghi chú |
|:--|:--|:--|
| User Management | Thấp | CRUD + RBAC tiêu chuẩn |
| LMS | Trung bình | Nghiệp vụ rõ ràng, không realtime |
| File Management | Trung bình | Upload/Download + Presigned URL |
| Meeting System | Khó | WebRTC, realtime, phụ thuộc SFU |
| Recording System | Khó | Lưu trữ lớn, vòng đời Hot/Cold |
| Attendance Engine | Khó | Xử lý event DISCONNECT/RECONNECT |
| Monitoring Dashboard | Khó | Realtime update, nhiều kết nối đồng thời |
| Telemetry Analytics | Rất khó | Volume cao, tần suất cập nhật lớn |
| Network Diagnostics | Rất khó | Rule Engine, phân tích đa chiều |
| Reporting | Trung bình | Truy vấn tổng hợp, tối ưu query |

---

## 4.3 Chi tiết đánh giá

### User Management — Độ khó: Thấp

**Lý do:**
- Bao gồm các chức năng phổ biến: đăng nhập, phân quyền RBAC, CRUD người dùng.
- Có nhiều thư viện và giải pháp sẵn có (ASP.NET Identity, JWT).

---

### LMS — Độ khó: Trung bình

**Lý do:**
- Quản lý khóa học, lớp học, lịch học, danh sách học viên.
- Nghiệp vụ tương đối rõ ràng, không yêu cầu xử lý thời gian thực.
- Phức tạp ở phần phân quyền data-scope (Teacher chỉ thấy lớp mình).

---

### File Management — Độ khó: Trung bình

**Lý do:**
- Chủ yếu liên quan đến Upload, Download, phân quyền truy cập và lưu trữ tài liệu.
- Có thể sử dụng MinIO hoặc S3-compatible với Presigned URL.
- Cần validation magic bytes để tránh upload file độc hại.

---

### Meeting System — Độ khó: Khó

**Lý do:**
- Bao gồm WebRTC, audio, video, screen sharing, participant management.
- Yêu cầu xử lý thời gian thực và phụ thuộc vào SFU (Media Server).
- Signaling, ICE negotiation, reconnect logic tăng độ phức tạp đáng kể.

---

### Recording System — Độ khó: Khó

**Lý do:**
- Ghi hình nhiều luồng video đồng thời.
- Lưu trữ dung lượng lớn, cần transcode sang MP4/H.264.
- Quản lý vòng đời: Hot Storage (0–30 ngày) → Cold Storage (31–180 ngày) → Auto-delete.

---

### Attendance Engine — Độ khó: Khó

**Lý do:**
- Không chỉ ghi JOIN và LEAVE đơn giản.
- Cần xử lý: DISCONNECT, RECONNECT, mất mạng tạm thời, trùng lặp sự kiện.
- Tính toán thời gian học chính xác với server-side timestamp ordering.

---

### Monitoring Dashboard — Độ khó: Khó

**Lý do:**
- Dữ liệu cập nhật realtime ≤ 5 giây/lần.
- Dashboard trực quan với nhiều chỉ số đồng thời.
- Phải xử lý số lượng lớn kết nối SignalR đồng thời.

---

### Telemetry Analytics — Độ khó: Rất khó

**Lý do:**
- Thu thập và xử lý: Latency, Packet Loss, Jitter, RTT, FPS, Bitrate từ toàn bộ participants.
- Khối lượng dữ liệu lớn (mỗi 5 giây/participant), tần suất cập nhật cao.
- Yêu cầu lưu trữ tối ưu (time-series database, aggregation).
- **Đây là một trong những phân hệ phức tạp nhất của dự án.**

---

### Network Diagnostics — Độ khó: Rất khó

**Lý do:**
- Phân tích dữ liệu telemetry để xác định nguyên nhân sự cố.
- Rule Engine với nhiều luật (Host Issue, Participant Issue, Infrastructure Issue, SFU Overload, ISP Routing, v.v.).
- Đánh giá phạm vi ảnh hưởng và hỗ trợ ra quyết định.
- Về lâu dài có thể phát triển thành hệ thống phân tích nâng cao (ML-based).

---

### Reporting — Độ khó: Trung bình

**Lý do:**
- Dựa trên dữ liệu đã được tổng hợp từ các phân hệ khác.
- Độ phức tạp chủ yếu nằm ở tối ưu truy vấn dữ liệu và xây dựng các template báo cáo.

---

## 4.4 Các khu vực rủi ro kỹ thuật cao

| Nhóm | Thành phần | Rủi ro chính |
|:--|:--|:--|
| **Real-Time Communication** | WebRTC · SFU · Screen Sharing · Recording | Network edge cases, SFU scalability |
| **Telemetry Processing** | Collector · Message Broker · Analytics Engine | Volume, latency, data loss |
| **Diagnostics Engine** | Rule Engine · Root Cause Analysis · Alert | Rule conflict, false positives |

---

## 4.5 Kết luận

Mặc dù hệ thống bao gồm nhiều phân hệ khác nhau, phần lớn độ phức tạp kỹ thuật tập trung vào ba khu vực:

| Phân hệ | Vai trò chiến lược |
|:--|:--|
| **Meeting System** | Nền tảng trải nghiệm học tập — không thể fail |
| **Telemetry Analytics** | Nguồn dữ liệu cho toàn bộ monitoring/diagnostics |
| **Network Diagnostics** | Khả năng cạnh tranh và khác biệt so với nền tảng thông thường |

Ba phân hệ này quyết định khả năng cạnh tranh và sự khác biệt của nền tảng so với các hệ thống đào tạo trực tuyến thông thường.
