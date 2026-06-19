# 03. System Constraints (Ràng buộc hệ thống)

> Tài liệu này liệt kê các ràng buộc cứng của hệ thống — những quyết định đã được định sẵn và không thể thay đổi trong phạm vi dự án.
> DEV và Architect phải tuân theo các ràng buộc này trước khi lựa chọn giải pháp kỹ thuật.

---

## 1. Technology Constraints (Ràng buộc công nghệ)

### CON-TECH-001: WebRTC là giao thức bắt buộc cho truyền tải media

**Mô tả:** Toàn bộ tính năng âm thanh, hình ảnh và chia sẻ màn hình trong phòng học trực tuyến phải sử dụng giao thức WebRTC. Không được sử dụng nền tảng họp trực tuyến bên thứ ba (Zoom SDK, Teams SDK, Google Meet API) để thay thế.

**Lý do:** Hệ thống yêu cầu thu thập dữ liệu telemetry chi tiết từ WebRTC Statistics API (latency, packet loss, jitter, bitrate, FPS) để phục vụ giám sát chất lượng lớp học. Các SDK bên thứ ba không cung cấp mức độ truy cập dữ liệu này.

**Ảnh hưởng:**
- DEV phải tự tích hợp hoặc xây dựng WebRTC Media Server thay vì sử dụng SDK bên thứ ba.
- Hệ thống phụ thuộc vào mức độ hỗ trợ WebRTC của trình duyệt.
- Phải triển khai STUN/TURN Server để xử lý kết nối qua NAT/Firewall.

---

### CON-TECH-001A: Ưu tiên topo mạng kiểu SFU cho truyền tải Media

**Mô tả:** Topo kiến trúc truyền tải media của phòng học trực tuyến bắt buộc phải thiết kế theo mô hình SFU (Selective Forwarding Unit). Mô hình MCU (Multipoint Control Unit) chỉ được sử dụng hạn chế ở các tác vụ phụ trợ như gộp luồng để ghi hình (recording) hoặc chuyển mã (transcoding).

**Lý do:** Mô hình SFU chỉ chuyển tiếp luồng media mà không thực hiện giải mã/mã hóa lại trên server, giúp giảm tải CPU tối đa, tối ưu hóa độ trễ truyền dữ liệu và hỗ trợ khả năng scale-out hiệu quả hơn nhiều so với MCU khi chạy đồng thời nhiều phòng học.

**Ảnh hưởng:**
- Media Server lựa chọn (như mediasoup, Janus) phải được cấu hình chạy ở chế độ SFU.
- Client chịu trách nhiệm render nhiều luồng video cùng lúc. Backend không thực hiện gộp luồng video của các participant thành một luồng duy nhất để gửi đi.

---

### CON-TECH-002: Hỗ trợ trình duyệt — Browser Support Matrix

**Mô tả:** Hệ thống chỉ hỗ trợ các trình duyệt có WebRTC API đầy đủ. Internet Explorer không được hỗ trợ. Không hỗ trợ truy cập tính năng học trực tuyến (WebRTC) từ các trình duyệt nhúng dạng WebView trên thiết bị di động (như Android WebView hay iOS WKWebView) trừ khi các WebView này được kiểm thử và xác nhận tương thích hoàn toàn với các WebRTC API tiêu chuẩn.

| Trình duyệt | Phiên bản tối thiểu |
| :--- | :---: |
| Google Chrome | v100+ |
| Microsoft Edge | v100+ |
| Mozilla Firefox | v100+ |
| Apple Safari | v15+ |
| Internet Explorer | Không hỗ trợ |

**Lý do:** WebRTC Statistics API và các tính năng tiên tiến (getStats, Insertable Streams) chỉ ổn định từ các phân hệ trên. IE không có WebRTC. WebView di động thường bị giới hạn phần cứng hoặc bị lược bỏ một số WebRTC APIs của hệ điều hành.

**Ảnh hưởng:**
- QA loại IE khỏi test matrix.
- Nhóm phát triển ứng dụng di động phải xác thực khả năng tương thích WebRTC của WebView nhúng hoặc chuyển hướng sang sử dụng native WebRTC SDK của thiết bị.

---

### CON-TECH-003: SignalR cho đồng bộ trạng thái realtime

**Mô tả:** Việc đồng bộ trạng thái realtime (presence, sự kiện điểm danh, cảnh báo chất lượng) giữa server và client phải sử dụng SignalR (WebSocket với fallback Long Polling). Cấm sử dụng kết nối SignalR cho luồng thu thập dữ liệu giám sát kết nối (telemetry ingestion pipeline) từ client lên server.

**Lý do:** SignalR hoạt động hiệu quả cho việc đồng bộ trạng thái nhẹ và đẩy tin, nhưng không được thiết kế để chịu tải ingestion liên tục với tần suất cao (3.000+ client gửi telemetry mỗi 5 giây). Sử dụng SignalR cho telemetry ingestion sẽ gây nghẽn kết nối và quá tải tài nguyên server.

**Ảnh hưởng:**
- Không được thay thế SignalR bằng Socket.IO hoặc raw WebSocket cho presence/alerting.
- Luồng telemetry ingestion từ client gửi lên server phải sử dụng REST API (HTTP POST), gRPC streams, hoặc đẩy trực tiếp qua Message Queue Ingestion endpoint.

---

### CON-TECH-004: Object Storage bắt buộc cho tài liệu và bài giảng

**Mô tả:** Tài liệu học tập và bản ghi bài giảng phải được lưu trên Object Storage. Không được lưu trực tiếp trên filesystem của application server. URL truy cập file phải là Presigned URL có thời hạn hiệu lực tối đa ≤ 15 phút.

**Nền tảng được chấp nhận:** MinIO, Amazon S3, Azure Blob Storage hoặc các nền tảng tương thích S3 API.

**Lý do:** Application server là stateless và có thể được scale hoặc thay thế bất kỳ lúc nào. Lưu file trên filesystem sẽ gây mất dữ liệu khi node bị xóa. Việc giới hạn thời gian Presigned URL nhằm ngăn chặn việc rò rỉ link tải tài liệu ra bên ngoài.

**Ảnh hưởng:**
- DEV phải sử dụng S3-compatible client library.
- Đảm bảo tham số TTL (Time-To-Live) khi sinh Presigned URL từ backend luôn đặt giá trị ≤ 900 giây (15 phút).

---

### CON-TECH-005: Relational Database cho dữ liệu nghiệp vụ

**Mô tả:** Dữ liệu nghiệp vụ cốt lõi (người dùng, khóa học, lớp học, lịch học, điểm danh) phải lưu trong Relational Database. Trong đó, hệ quản trị cơ sở dữ liệu PostgreSQL (phiên bản 14 trở lên) là lựa chọn được ưu tiên khuyến nghị (preferred).

**RDBMS được chấp nhận:** PostgreSQL 14+, SQL Server 2019+.

**Lý do:** Dữ liệu này có quan hệ chặt chẽ, yêu cầu ACID transactions và cần đảm bảo tính toàn vẹn referential. PostgreSQL được ưu tiên nhờ sự hỗ trợ mạnh mẽ của kiểu dữ liệu JSONB (linh hoạt lưu cấu hình), TimescaleDB extension (cho dữ liệu telemetry) và tính năng partitioning bảng lớn (cho log điểm danh).

**Ảnh hưởng:** Không dùng NoSQL document store (MongoDB) cho dữ liệu nghiệp vụ chính. DEV và DevOps ưu tiên triển khai PostgreSQL cho môi trường sản phẩm.

---

### CON-TECH-006: Redis bắt buộc cho cache và realtime state

**Mô tả:** Trạng thái kết nối realtime (presence, session state, SignalR backplane) phải lưu trong Redis. Cấu hình bền vững hóa dữ liệu (persistence mode) của Redis bắt buộc phải kích hoạt chế độ AOF (Append Only File).

**Lý do:** In-memory state của application server sẽ mất khi restart hoặc scale-out. Redis cung cấp shared state cho toàn bộ cluster. Việc kích hoạt AOF giúp bảo vệ trạng thái phòng và kết nối của người dùng không bị mất mát hoàn toàn khi server Redis gặp sự cố đột ngột và restart lại.

**Ảnh hưởng:**
- Redis phải được deploy với mode high-availability (Redis Sentinel hoặc Redis Cluster) trên môi trường production.
- File cấu hình `redis.conf` phải đặt `appendonly yes`.

---

### CON-TECH-007: Containerization & Kubernetes Deployment bắt buộc

**Mô tả:** Toàn bộ các service của hệ thống phải được đóng gói bằng Docker và cấu hình sẵn sàng triển khai trên Kubernetes cluster bằng cách cung cấp Kubernetes Manifests hoặc Helm Charts tiêu chuẩn.

**Lý do:** Yêu cầu về khả năng scale linh hoạt, zero-downtime deployment, tự động phục hồi (self-healing) và quản lý môi trường nhất quán giữa dev/staging/production. Dockerfile đơn thuần chỉ đóng gói mã nguồn, không đủ để định nghĩa tài nguyên và cách vận hành trên cluster.

**Ảnh hưởng:**
- DEV phải cung cấp Dockerfile cho mỗi service.
- Nhóm DevOps/DEV phải cung cấp đầy đủ file cấu hình Kubernetes (YAML Deployment, Service, Ingress) hoặc cấu hình Helm Chart phục vụ cho việc deploy tự động. Không được phép deploy theo cách truyền thống.

---

### CON-TECH-008: Định dạng file được phép và bị cấm

**Mô tả:** Hệ thống chỉ chấp nhận upload các định dạng đã được phê duyệt.

| Được phép | Bị cấm (ví dụ) |
| :--- | :--- |
| PDF, DOCX, XLSX, PPTX | EXE, BAT, CMD |
| JPG, JPEG, PNG | DLL, APK, SH |
| MP4 | PS1, VBS, MSI |

**Lý do:** Bảo vệ hệ thống khỏi các file thực thi độc hại được upload dưới dạng tài liệu học tập.

**Ảnh hưởng:** Validation phải kiểm tra MIME type thực sự (magic bytes), không chỉ phần mở rộng tên file. DEV không được bypass bước này.

---

## 2. Infrastructure Constraints (Ràng buộc hạ tầng)

### CON-INFRA-001: Hỗ trợ triển khai On-Premises và Cloud (Không bị khóa nhà cung cấp)

**Mô tả:** Hệ thống phải có khả năng triển khai trên cả môi trường on-premises lẫn cloud (AWS, Azure, GCP) mà không cần thay đổi mã nguồn. Toàn bộ mã nguồn xử lý tương tác với Object Storage phải đi qua một lớp trừu tượng (Storage Abstraction Layer) thay vì tương tác trực tiếp với API của một nhà cung cấp cụ thể.

**Lý do:** Khách hàng mục tiêu bao gồm cả tổ chức giáo dục có chính sách dữ liệu nội bộ (yêu cầu on-premises) lẫn doanh nghiệp ưa cloud. Lớp trừu tượng lưu trữ ngăn chặn việc hệ thống bị khóa cứng vào dịch vụ của AWS, Azure hoặc GCP (Cloud vendor lock-in).

**Ảnh hưởng:**
- Tất cả cấu hình hạ tầng phải thông qua environment variables. Không hardcode cloud-specific endpoint trong mã nguồn.
- DEV phải sử dụng thư viện trừu tượng hóa lưu trữ (như AWS SDK tương thích S3 API, hoặc các library trừu tượng của .NET) để việc thay đổi driver lưu trữ chỉ cần chỉnh cấu hình hệ thống.

---

### CON-INFRA-002: Tối thiểu 2 node cho Application Server

**Mô tả:** Môi trường production phải có tối thiểu 2 application server node để đảm bảo High Availability.

**Lý do:** Đáp ứng yêu cầu SLA uptime ≥ 99.5%. Một node duy nhất tạo ra single point of failure.

**Ảnh hưởng:** Application phải stateless — không lưu session state trên local memory. Phải dùng Redis cho shared state.

---

### CON-INFRA-003: Media Server và TURN Server phải tách riêng khỏi Application Server

**Mô tả:** WebRTC Media Server (SFU) và TURN Server phải chạy trên các instance/hạ tầng riêng biệt, tách rời hoàn toàn khỏi API Application Server. Cấm triển khai TURN Server dùng chung tài nguyên vật lý với SFU Server trên môi trường Production.

**Lý do:** SFU và TURN Server tiêu thụ tài nguyên CPU và băng thông mạng cực kỳ lớn khi thực hiện chuyển tiếp luồng media qua NAT/Firewall. Tách biệt hạ tầng giúp tránh ảnh hưởng chéo làm treo API Server và tối ưu cấu hình băng thông mạng cho từng loại server (đặc biệt TURN Server cần băng thông truyền tải rất lớn).

**Ảnh hưởng:**
- Cần provision infrastructure riêng biệt cho SFU Server và TURN Server (băng thông ≥ 1 Gbps per node).
- Cấu hình định tuyến cuộc gọi (routing) và candidate gathering phải trỏ đúng địa chỉ IP riêng biệt của từng cụm server.

---

## 3. Integration Constraints (Ràng buộc tích hợp)

### CON-INTG-001: API chuẩn RESTful với OpenAPI documentation

**Mô tả:** Toàn bộ API nội bộ và API công khai phải tuân theo chuẩn RESTful. Tài liệu API phải được tạo tự động theo chuẩn OpenAPI 3.0 (Swagger).

**Lý do:** Đảm bảo khả năng tích hợp với các hệ thống bên ngoài trong tương lai và tạo điều kiện cho team Frontend/Mobile phát triển song song.

**Ảnh hưởng:** DEV phải annotate API với OpenAPI spec. API schema là hợp đồng — không được thay đổi breaking changes mà không có version migration plan.

---

### CON-INTG-002: Email notification qua SMTP

**Mô tả:** Toàn bộ tính năng gửi thông báo qua email phải sử dụng giao thức SMTP. Cấu hình SMTP server (host, port, credential) phải có thể thay đổi qua environment variable.

**Lý do:** Linh hoạt cho các đơn vị triển khai có mail server nội bộ khác nhau.

**Ảnh hưởng:** Không hardcode địa chỉ SMTP cụ thể trong mã nguồn.

---

### CON-INTG-003: Không phụ thuộc nền tảng họp bên thứ ba

**Mô tả:** Hệ thống không được phụ thuộc vào Zoom API, Microsoft Teams API, Google Meet API hoặc bất kỳ nền tảng video conferencing bên thứ ba nào.

**Lý do:** Phụ thuộc bên thứ ba tạo rủi ro về chi phí license, thay đổi API không kiểm soát được, và giới hạn khả năng tùy chỉnh tính năng giám sát telemetry.

**Ảnh hưởng:** 100% tính năng học trực tuyến phải được xây dựng nội bộ dựa trên WebRTC.

---

### CON-INTG-004: Khả năng tương thích tích hợp Webhook

**Mô tả:** Hệ thống phải cung cấp cơ chế đăng ký và gửi sự kiện Webhook (HTTP POST payload JSON) đến các hệ thống quản trị đào tạo hoặc ERP của bên thứ ba khi phát sinh các cột mốc nghiệp vụ chính.

**Lý do:** Đảm bảo hệ thống có khả năng tích hợp và đồng bộ dữ liệu tự động với các hệ thống quản lý học tập (LMS), nhân sự (HRM) bên ngoài mà không cần bên thứ ba phải liên tục gọi API truy vấn (pull model).

**Ảnh hưởng:**
- Hệ thống phải định nghĩa và hỗ trợ tối thiểu các sự kiện webhook sau: `session.started` (buổi học bắt đầu), `session.ended` (buổi học kết thúc), `attendance.completed` (điểm danh xong), `recording.ready` (bản ghi ghi hình đã sẵn sàng), `quality.alert` (cảnh báo chất lượng phát sinh).
- Hỗ trợ cơ chế bảo mật chữ ký số (Webhook Signature) để bên thứ ba xác thực dữ liệu gửi từ hệ thống.

---

## 4. Regulatory & Legal Constraints (Ràng buộc pháp lý)

### CON-LEGAL-001: Bảo vệ dữ liệu cá nhân người dùng

**Mô tả:** Dữ liệu cá nhân của học viên và giáo viên (họ tên, email, địa chỉ IP) phải được bảo vệ theo quy định Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân của Việt Nam.

**Lý do:** Tuân thủ quy định pháp luật hiện hành. Vi phạm có thể dẫn đến xử phạt hành chính.

**Ảnh hưởng:**
- Người dùng phải được thông báo về việc thu thập dữ liệu khi đăng ký.
- Địa chỉ IP chỉ được lưu khi có chính sách bảo mật được phê duyệt.
- Phải có cơ chế xóa tài khoản và dữ liệu cá nhân khi có yêu cầu.

---

### CON-LEGAL-002: Giới hạn lưu trữ dữ liệu học tập

**Mô tả:** Dữ liệu điểm danh, telemetry và bản ghi bài giảng phải được lưu trữ theo chính sách retention do đơn vị vận hành quy định, không lưu vô thời hạn.

**Lý do:** Tránh tích lũy dữ liệu cá nhân không cần thiết (data minimization principle).

**Ảnh hưởng:** Hệ thống cần có cơ chế tự động xóa dữ liệu quá hạn (data purge policy) có thể cấu hình.

---

### CON-LEGAL-003: License thư viện mã nguồn mở

**Mô tả:** Tất cả thư viện open-source được sử dụng trong dự án phải có license tương thích với mục đích thương mại (MIT, Apache 2.0, BSD). Không sử dụng thư viện có license GPL nếu không có kế hoạch tuân thủ rõ ràng.

**Lý do:** Tránh rủi ro pháp lý khi phân phối sản phẩm thương mại.

**Ảnh hưởng:** DEV phải kiểm tra license của mọi dependency trước khi thêm vào dự án. Phải duy trì danh sách SBOM (Software Bill of Materials).

---

### CON-LEGAL-004: Yêu cầu hiển thị biểu mẫu chấp thuận ghi hình (Recording Consent)

**Mô tả:** Hệ thống bắt buộc phải hiển thị biểu mẫu yêu cầu chấp thuận (Consent Prompt) và nhận được xác nhận từ người tham gia trước khi cho phép họ kết nối vào phòng học có kích hoạt chế độ ghi hình.

**Lý do:** Tuân thủ các quy định pháp lý về bảo vệ quyền riêng tư cá nhân và ghi hình hội thoại (theo quy định của Luật Việt Nam và quốc tế GDPR).

**Ảnh hưởng:**
- Thiết kế giao diện Client phải hiển thị popup thông báo "Buổi học này sẽ được ghi hình lại. Bạn có đồng ý tham gia?".
- Nếu người dùng chọn "Không đồng ý", hệ thống không cho phép họ tham gia phòng học trực tuyến và chuyển hướng về trang chủ lớp học.
- Trạng thái đồng ý (consent state) của người dùng được lưu vào metadata phiên điểm danh.

---

## 5. Project Constraints (Ràng buộc dự án)

### CON-PROJ-001: API-first development

**Mô tả:** Backend API phải được thiết kế và định nghĩa (OpenAPI spec) trước khi Frontend bắt đầu implementation. Không được để Frontend phụ thuộc vào API chưa có spec.

**Lý do:** Cho phép Frontend và Backend phát triển song song dựa trên contract đã thống nhất, giảm số lần blocked giữa các team.

**Ảnh hưởng:** API design review là bước bắt buộc trước khi bắt đầu sprint implement.

---

### CON-PROJ-002: Thiết kế hệ thống phân rã theo Bounded Contexts

**Mô tả:** Hệ thống phải được thiết kế và triển khai phân rã rõ ràng theo các ngữ cảnh giới hạn (Bounded Contexts) độc lập được định nghĩa trong tài liệu thiết kế. Hệ thống có thể bắt đầu xây dựng dưới dạng cấu trúc Monolith Module (Modular Monolith) ở giai đoạn đầu để tối ưu tốc độ phát triển và giảm độ phức tạp vận hành của MVP, nhưng bắt buộc phải đảm bảo khả năng tách rời độc lập (decomposable) thành các Microservices riêng biệt mà không phải viết lại logic cốt lõi.

**Lý do:** Tránh việc rơi vào cái bẫy thiết kế hệ thống phân tán quá phức tạp ngay từ đầu (premature overengineering) khi quy mô tải chưa lớn, đồng thời vẫn đảm bảo tính linh hoạt để scale độc lập các dịch vụ (như Telemetry Ingestion hay Media Server) trong tương lai.

**Ảnh hưởng:**
- Các domain module (LMS, Attendance, Telemetry) phải giao tiếp với nhau qua các interface được định nghĩa rõ ràng hoặc qua Event Bus.
- Nghiêm cấm việc viết các câu truy vấn JOIN trực tiếp qua database schema của module khác. Mỗi module phải làm chủ dữ liệu của riêng nó.

---

## 6. Operational Constraints (Ràng buộc vận hành)

### CON-OPS-001: Maintenance Window

**Mô tả:** Bảo trì hệ thống định kỳ (nếu cần downtime) chỉ được thực hiện ngoài giờ học: 22:00 – 06:00 hàng ngày. Tổng thời gian downtime có kế hoạch không vượt quá 4 giờ/tháng.

**Lý do:** Đảm bảo không gián đoạn hoạt động giảng dạy trong giờ cao điểm (7:00 – 22:00).

**Ảnh hưởng:** Mọi kế hoạch deploy lớn hoặc database migration phải được lên lịch vào maintenance window và thông báo trước tối thiểu 24 giờ.

---

### CON-OPS-002: Zero-downtime deployment bắt buộc

**Mô tả:** Việc cập nhật phiên bản hệ thống phải thực hiện theo phương thức zero-downtime (rolling update hoặc blue-green deployment). Không được phép deploy kiểu "tắt service, copy file, khởi động lại".

**Lý do:** Các lớp học đang diễn ra không được bị gián đoạn do quá trình deploy.

**Ảnh hưởng:** Cần có CI/CD pipeline hỗ trợ rolling update. DEV phải xử lý backward compatibility khi thay đổi database schema (không drop column trực tiếp).

---

### CON-OPS-003: Cấu hình vận hành phải thay đổi được mà không cần deploy

**Mô tả:** Các tham số nghiệp vụ sau phải có thể thay đổi qua giao diện quản trị hoặc environment variable mà không cần build lại hoặc deploy lại:

- Ngưỡng cảnh báo: Latency, Packet Loss, Jitter.
- Ngưỡng điểm danh Đạt/Không đạt.
- Giới hạn kích thước file upload.
- Chu kỳ thu thập telemetry.
- Lịch gửi báo cáo tự động.

**Lý do:** Các đơn vị triển khai khác nhau có chính sách vận hành khác nhau. Thay đổi tham số không phải là lý do để release phiên bản mới.

**Ảnh hưởng:** DEV không được hardcode các giá trị này trong mã nguồn.

---

### CON-OPS-004: Hỗ trợ cơ chế Bật/Tắt tính năng động (Feature Flags)

**Mô tả:** Các tính năng hệ thống quan trọng và mới triển khai (ví dụ: chế độ ghi hình buổi học, tính năng tự động chẩn đoán sự cố, hiển thị biểu đồ telemetry) phải được kiểm soát thông qua cấu hình Feature Flags, cho phép bật/tắt động mà không cần redeploy mã nguồn.

**Lý do:** Đảm bảo khả năng thử nghiệm tính năng mới an toàn trên môi trường production (canary releases), giảm thiểu rủi ro khi phát sinh lỗi nghiêm trọng và linh hoạt tùy biến tính năng theo từng phân khúc khách hàng.

**Ảnh hưởng:**
- DEV phải cài đặt thư viện quản lý Feature Flags (như LaunchDarkly, Unleash hoặc tự xây dựng cấu hình DB/Redis toggles).
- Các điều kiện rẽ nhánh logic nghiệp vụ lớn phải đi qua bước check trạng thái Feature Flag trước khi thực thi.
