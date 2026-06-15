# 3. Kế hoạch triển khai hệ thống

> **Mục đích:** Mô tả lộ trình phát triển và triển khai hệ thống theo từng giai đoạn (phased rollout).
> **Tham chiếu:** TDD 12-deployment-configuration.md · SAD 09_Deployment_Architecture.md

---

## 3.1 Nguyên tắc triển khai

Hệ thống được phát triển theo từng giai đoạn nhằm:

- Giảm rủi ro triển khai
- Đưa vào sử dụng sớm để thu thập phản hồi thực tế
- Từng bước hoàn thiện các chức năng nâng cao

> **Quy tắc:** Mỗi giai đoạn phải tạo ra một phiên bản có thể vận hành thực tế — không có giai đoạn "chỉ nội bộ".

---

## 3.2 Tổng quan lộ trình

| Giai đoạn | Tên | Trọng tâm |
|:--|:--|:--|
| Phase 1 | Nền tảng đào tạo trực tuyến cơ bản (MVP) | LMS + Meeting cơ bản + Điểm danh JOIN/LEAVE |
| Phase 2 | Hoàn thiện trải nghiệm lớp học | Tương tác nâng cao + Tài liệu + Reconnect |
| Phase 3 | Quản lý đào tạo và lưu trữ nội dung | Recording + Attendance Engine + Reporting |
| Phase 4 | Monitoring & Analytics | Dashboard giám sát + Telemetry |
| Phase 5 | Diagnostics & Intelligent Operations | Rule Engine + Alert + Root Cause Analysis |

---

## 3.3 Chi tiết từng giai đoạn

### Phase 1 — Nền tảng đào tạo trực tuyến cơ bản (MVP)

**Mục tiêu:** Xây dựng phiên bản đầu tiên có khả năng tổ chức lớp học trực tuyến và quản lý đào tạo cơ bản.

| Nhóm chức năng | Tính năng |
|:--|:--|
| **LMS** | Đăng nhập · Quản lý người dùng · Quản lý khóa học · Quản lý lớp học · Quản lý lịch học |
| **Meeting** | Tạo phòng học · Tham gia phòng học · Camera · Microphone · Danh sách người tham gia |
| **Attendance** | Ghi sự kiện JOIN · Ghi sự kiện LEAVE · Tính thời gian tham gia cơ bản |

**Kết quả:** Hệ thống có thể triển khai lớp học trực tuyến thực tế.

---

### Phase 2 — Hoàn thiện trải nghiệm lớp học

**Mục tiêu:** Nâng cao khả năng tương tác giữa giáo viên và học viên.

| Nhóm chức năng | Tính năng |
|:--|:--|
| **Meeting** | Screen Sharing · Chat công khai · Chat cá nhân · Raise Hand · Teacher Control · Mute / Unmute |
| **Tài liệu** | Upload tài liệu · Chia sẻ tài liệu · Tải tài liệu |
| **Attendance** | Ghi sự kiện DISCONNECT · RECONNECT · Tính toán thời gian học chính xác |

**Kết quả:** Đạt mức tương đương các nền tảng họp trực tuyến phổ biến.

---

### Phase 3 — Quản lý đào tạo và lưu trữ nội dung

**Mục tiêu:** Bổ sung các chức năng phục vụ vận hành đào tạo lâu dài.

| Nhóm chức năng | Tính năng |
|:--|:--|
| **Recording** | Ghi hình buổi học · Lưu trữ Recording · Xem lại Recording |
| **Attendance Engine** | Thống kê điểm danh · Tỷ lệ tham gia · Đánh giá hoàn thành buổi học |
| **Reporting** | Báo cáo học viên · Báo cáo lớp học · Xuất Excel / CSV / PDF |

**Kết quả:** Hệ thống đáp ứng đầy đủ nhu cầu đào tạo và quản lý học tập.

---

### Phase 4 — Monitoring & Analytics

**Mục tiêu:** Xây dựng khả năng giám sát và phân tích chất lượng lớp học theo thời gian thực.

| Nhóm chức năng | Tính năng |
|:--|:--|
| **Monitoring** | Dashboard tổng quan · Dashboard lớp học · Dashboard người dùng |
| **Telemetry** | Thu thập Latency · Packet Loss · Jitter · RTT · FPS · Bitrate |
| **Analytics** | Phân tích chất lượng kết nối · Lưu trữ dữ liệu Telemetry · Dashboard Analytics |

**Kết quả:** Quản lý có thể giám sát toàn bộ hệ thống theo thời gian thực.

---

### Phase 5 — Diagnostics & Intelligent Operations

**Mục tiêu:** Tự động phát hiện và chẩn đoán nguyên nhân sự cố.

| Nhóm chức năng | Tính năng |
|:--|:--|
| **Diagnostics Engine** | Host Side Analysis · Participant Side Analysis · Infrastructure Analysis |
| **Alert System** | Cảnh báo thời gian thực · Cảnh báo chất lượng lớp học · Cảnh báo hệ thống |
| **Root Cause Analysis** | Phân tích nguyên nhân sự cố · Đề xuất hướng xử lý |

**Kết quả:** Tạo ra khả năng giám sát và vận hành vượt trội so với các nền tảng họp trực tuyến thông thường.

---

## 3.4 Kết luận

Sau khi hoàn thành toàn bộ 5 giai đoạn, hệ thống sẽ cung cấp:

| Thành phần | Mô tả |
|:--|:--|
| Nền tảng LMS | Quản lý đào tạo tập trung |
| Online Learning | Hệ thống học trực tuyến WebRTC |
| Auto Attendance | Điểm danh tự động, tính toán chính xác |
| Recording | Ghi hình và phát lại bài giảng |
| Realtime Monitoring | Giám sát hệ thống theo thời gian thực |
| Network Analytics | Phân tích chất lượng kết nối |
| Diagnostics | Chẩn đoán nguyên nhân sự cố |
| Reporting | Báo cáo và thống kê tập trung |

Đây là một nền tảng đào tạo trực tuyến tích hợp — kết hợp LMS, Video Conference và Analytics Platform trên cùng một hệ thống.
