# 02. Non-Functional Requirements (Yêu cầu phi chức năng)

> Tài liệu này đặc tả các chỉ tiêu chất lượng của hệ thống.
> Mỗi NFR phải có chỉ số đo được (measurable metric), điều kiện đo và phương pháp verify.
> Mã định danh: `NFR-[CATEGORY]-[NUMBER]`

---

## 1. Performance Requirements (Hiệu năng)

### NFR-PERF-001: Response time API CRUD thông thường

**Category:** Performance

**Chỉ số:** 95th percentile (p95) response time của các API CRUD (LMS, User, Document) ≤ 500 ms.

**Điều kiện đo:** Dưới tải 500 concurrent users thực hiện các thao tác CRUD thông thường, database không có slow query.

**Cách verify:** Load test bằng k6 hoặc JMeter với 500 VU trong 10 phút. Kiểm tra p95 trong kết quả report.

---

### NFR-PERF-002: Response time API Realtime Telemetry

**Category:** Performance

**Chỉ số:** p95 response time của API nhận/đẩy dữ liệu telemetry ≤ 200 ms.

**Điều kiện đo:** Dưới tải 100 lớp học đồng thời, mỗi lớp có 30 người tham gia, chu kỳ gửi telemetry 5 giây/lần.

**Cách verify:** Load test với tải mô phỏng: 3.000 concurrent telemetry producers, đo p95 latency tại ingestion endpoint.

---

### NFR-PERF-003: Response time API Báo cáo

**Category:** Performance

**Chỉ số:** p95 response time của API truy vấn báo cáo ≤ 2.000 ms đối với dataset ≤ 10.000 records.

**Điều kiện đo:** Normal load (không phải peak), dataset báo cáo có 10.000 bản ghi, có index đầy đủ trên database.

**Cách verify:** Chạy query báo cáo lớn nhất (theo thiết kế) với EXPLAIN ANALYZE. Đo thời gian từ lúc gửi request đến khi nhận full response.

---

### NFR-PERF-004: Thời gian tham gia phòng học

**Category:** Performance

**Chỉ số:** Thời gian từ khi người dùng click "Tham gia lớp học" đến khi kết nối WebRTC thành công ≤ 5 giây (p95).

**Điều kiện đo:** Mạng người dùng ≥ 10 Mbps, latency đến server ≤ 100 ms, TURN server không bị bypass.

**Cách verify:** Đo end-to-end từ click đến ICE connection established trên 20 thiết bị test khác nhau.

---

### NFR-PERF-005: Throughput API tối thiểu

**Category:** Performance

**Chỉ số:** Hệ thống xử lý được tối thiểu 1.000 API requests/giây trên toàn cluster.

**Điều kiện đo:** Cluster đầy đủ (2+ application nodes), không có background job nặng đang chạy.

**Cách verify:** Load test với 1.000 RPS sustained trong 5 phút. Kiểm tra error rate < 0.1%.

---

### NFR-PERF-006: Thời gian xử lý tải lên tài liệu

**Category:** Performance

**Chỉ số:**
- PDF / Office (≤ 50 MB): Xử lý hoàn tất (upload + preprocessing) ≤ 15 giây.
- Video MP4 (≤ 500 MB): Xử lý hoàn tất ≤ 90 giây.
- Video MP4 (≤ 2 GB): Xử lý hoàn tất ≤ 10 phút.

**Điều kiện đo:** Kết nối upload ≥ 10 Mbps từ client, Object Storage không bị bottleneck.

**Cách verify:** Upload file có kích thước tối đa từng loại, đo thời gian từ lúc bắt đầu upload đến khi file sẵn sàng truy cập.

---

### NFR-PERF-007: Thời gian phát hiện và xử lý cảnh báo chất lượng

**Category:** Performance

**Chỉ số:** Kể từ khi một chỉ số kết nối vượt ngưỡng cảnh báo, hệ thống phát ra alert và hiển thị trên monitoring dashboard ≤ 10 giây.

**Điều kiện đo:** Telemetry pipeline hoạt động bình thường, không bị backlog.

**Cách verify:** Inject dữ liệu telemetry giả với giá trị vượt ngưỡng, đo thời gian đến khi alert xuất hiện trên dashboard.

---

### NFR-PERF-008: Thời gian xuất báo cáo lớn

**Category:** Performance

**Chỉ số:** Xuất báo cáo với 10.000 records sang định dạng Excel/CSV hoàn tất ≤ 30 giây.

**Điều kiện đo:** Chạy export job async (background), bao gồm cả thời gian query + generate file.

**Cách verify:** Tạo dataset 10.000 bản ghi điểm danh, trigger export, đo thời gian đến khi file download ready.

---

### NFR-PERF-009: Telemetry data ingestion rate

**Category:** Performance

**Chỉ số:** Hệ thống xử lý được ≥ 10.000 telemetry events/giây với tỷ lệ ghi nhận thành công (successful persistence) ≥ 99.99%.

**Điều kiện đo:** 100 lớp học × 100 người × 1 event/giây = 10.000 events/giây. Đây là tải peak tối đa theo thiết kế.

**Cách verify:** Stress test bằng cách inject 1.000.000 events với tốc độ 10.000 events/giây trong 100 giây liên tục. Kiểm tra số lượng bản ghi thực tế trong storage đạt ≥ 99.99% tổng số event gửi đi.

---

### NFR-PERF-010: Thời gian truyền tải thông báo (Notification Delivery Latency)

**Category:** Performance

**Chỉ số:** Thời gian từ lúc sự kiện phát sinh đến khi thông báo được gửi thành công đến client (in-app) hoặc cổng mail SMTP ≤ 5 giây (p95).

**Điều kiện đo:** Hoạt động bình thường dưới tải 2.000 kết nối SignalR đồng thời, hàng đợi thông báo không bị nghẽn.

**Cách verify:** Tạo sự kiện cập nhật buổi học, đo khoảng thời gian từ lúc API lưu thành công đến lúc client nhận được sự kiện SignalR thông báo (qua telemetry log).

---

## 2. Scalability Requirements (Khả năng mở rộng)

### NFR-SCAL-001: Số lớp học trực tuyến đồng thời

**Category:** Scalability

**Chỉ số:** Hệ thống phải hỗ trợ ≥ 100 lớp học trực tuyến diễn ra đồng thời.

**Điều kiện đo:** Mỗi lớp có trung bình 30 người tham gia, video 720p, audio 2 chiều.

**Cách verify:** Load test với 100 simulated WebRTC sessions đồng thời, kiểm tra Media Server CPU/RAM không vượt 80%.

---

### NFR-SCAL-002: Số người dùng kết nối đồng thời

**Category:** Scalability

**Chỉ số:** Hệ thống hỗ trợ ≥ 5.000 concurrent users (tổng cả SignalR connections + API calls).

**Điều kiện đo:** Phân bổ: 3.000 người đang trong lớp học, 2.000 người đang dùng LMS/báo cáo.

**Cách verify:** Load test với 5.000 concurrent connections, đo response time và error rate tổng thể.

---

### NFR-SCAL-003: Số người trong một lớp học

**Category:** Scalability

**Chỉ số:** Một phòng học trực tuyến hỗ trợ ≥ 100 người tham gia đồng thời.

**Điều kiện đo:** 100 người cùng bật video 720p trong một phòng, Media Server ở chế độ SFU.

**Cách verify:** Test với 100 simulated participants trong một room, kiểm tra chất lượng video và độ trễ.

---

### NFR-SCAL-004: Horizontal scaling

**Category:** Scalability

**Chỉ số:** Việc thêm application server node mới phải tăng tuyến tính throughput hệ thống (thêm 1 node = tăng ~80% capacity so với 1 node).

**Điều kiện đo:** Đo với 1 node, sau đó với 2 node cùng cấu hình, so sánh max RPS.

**Cách verify:** Load test trên 1 node đến saturation, sau đó thêm 1 node và load test lại, so sánh kết quả.

---

### NFR-SCAL-005: Khả năng mở rộng Object Storage

**Category:** Scalability

**Chỉ số:** Hệ thống Object Storage phải hỗ trợ mở rộng dung lượng lưu trữ ≥ 50 TB mà không làm gián đoạn dịch vụ tải lên/tải xuống tài liệu và bản ghi.

**Điều kiện đo:** Dung lượng lưu trữ hiện tại đạt 90% giới hạn, thực hiện scale-out/scale-up storage cluster trực tiếp (MinIO cluster hoặc cloud storage bucket expansion).

**Cách verify:** Chạy tải test upload liên tục, thực hiện thêm ổ đĩa hoặc node lưu trữ mới vào cluster và kiểm tra 0% lỗi upload/download xảy ra trong quá trình mở rộng.

---

## 3. Availability & Reliability (Sẵn sàng và Độ tin cậy)

### NFR-AVAIL-001: Uptime SLA

**Category:** Availability

**Chỉ số:** Uptime hệ thống ≥ 99.5% mỗi tháng (tương đương ≤ 3.6 giờ downtime/tháng, bao gồm cả downtime ngoài kế hoạch).

**Điều kiện đo:** Tính từ tổng thời gian trong tháng trừ đi planned maintenance window đã thông báo.

**Cách verify:** Theo dõi qua monitoring system (Uptime Robot, Prometheus Alertmanager). Review báo cáo uptime hàng tháng.

---

### NFR-AVAIL-002: Uptime giờ học chính

**Category:** Availability

**Chỉ số:** Uptime trong khung giờ 7:00 – 22:00 hàng ngày ≥ 99.9% (tương đương ≤ 45 phút downtime ngoài kế hoạch/tháng).

**Điều kiện đo:** Chỉ tính downtime không có kế hoạch trong khung giờ học.

**Cách verify:** Alert phải kích hoạt trong vòng 2 phút khi service down. Review incident log hàng tháng.

---

### NFR-AVAIL-003: RTO (Recovery Time Objective)

**Category:** Reliability

**Chỉ số:** Sau sự cố nghiêm trọng, hệ thống phải được khôi phục hoạt động hoàn toàn trong ≤ 30 phút.

**Điều kiện đo:** Sự cố nghiêm trọng = toàn bộ service không phản hồi. Tính từ lúc alert kích hoạt đến lúc hệ thống hoạt động bình thường.

**Cách verify:** DR drill tối thiểu 1 lần/quý. Đo thời gian từ incident detection đến recovery.

---

### NFR-AVAIL-004: RPO (Recovery Point Objective)

**Category:** Reliability

**Chỉ số:** Trong trường hợp mất dữ liệu, lượng dữ liệu bị mất tối đa ≤ 1 giờ (dữ liệu cũ hơn 1 giờ phải được khôi phục được).

**Điều kiện đo:** Database backup chạy tự động hàng ngày. Transaction log backup mỗi 1 giờ.

**Cách verify:** Restore drill từ backup, xác nhận dữ liệu trong 1 giờ cuối trước sự cố vẫn còn nguyên.

---

### NFR-AVAIL-005: Tự động reconnect WebRTC

**Category:** Reliability

**Chỉ số:** Khi người dùng bị mất kết nối WebRTC tạm thời (network blip < 30 giây), hệ thống phải tự động reconnect mà không cần người dùng thao tác thủ công.

**Điều kiện đo:** Mô phỏng ngắt kết nối mạng 5–20 giây, sau đó khôi phục.

**Cách verify:** Test ngắt network adapter trong 10 giây, xác nhận client tự reconnect thành công trong ≤ 30 giây.

---

### NFR-AVAIL-006: Không mất dữ liệu điểm danh khi service restart

**Category:** Reliability

**Chỉ số:** Dữ liệu sự kiện điểm danh (JOIN/LEAVE/DISCONNECT/RECONNECT) không được mất khi có sự cố đơn điểm ở bất kỳ service nào.

**Điều kiện đo:** Dữ liệu được persist vào message queue có durable storage trước khi xử lý.

**Cách verify:** Kill attendance service đột ngột, restart, xác nhận không có event bị mất trong database.

---

### NFR-AVAIL-007: MTTD (Mean Time to Detect)

**Category:** Reliability

**Chỉ số:** Thời gian trung bình để hệ thống phát hiện sự cố nghiêm trọng (service down, error rate > 5%) ≤ 2 phút.

**Điều kiện đo:** Alerting system đang hoạt động bình thường với scrape interval 30 giây.

**Cách verify:** Inject lỗi giả (kill service), đo thời gian từ lúc kill đến khi alert gửi đến đội on-call.

---

### NFR-AVAIL-008: Độ tin cậy của hàng đợi tin nhắn (Queue Durability)

**Category:** Reliability

**Chỉ số:** Hệ thống Message Queue (RabbitMQ/Kafka) phải duy trì tính sẵn sàng cao với replication factor ≥ 3 cho các queues quan trọng (điểm danh, thông báo, telemetry).

**Điều kiện đo:** Hoạt động dưới tải 10.000 telemetry events/giây, thực hiện kill đột ngột 1 broker node trong cluster.

**Cách verify:** Sử dụng công cụ quản trị hàng đợi để xác nhận cấu hình replication factor = 3, kill 1 node trong quá trình chạy test và xác nhận không xảy ra mất mát dữ liệu hoặc gián đoạn luồng xử lý.

---

### NFR-AVAIL-009: Tỷ lệ xử lý gửi lại thông báo thành công (Notification Retry SLO)

**Category:** Reliability

**Chỉ số:** Tỷ lệ gửi lại thành công của các thông báo quan trọng bị lỗi kết nối ban đầu đạt ≥ 99% sau 3 lần thử lại (retry).

**Điều kiện đo:** Hệ thống gặp lỗi mất kết nối SMTP/Push service tạm thời dưới 30 phút.

**Cách verify:** Giả lập lỗi ngắt kết nối cổng SMTP trong 10 phút để kích hoạt retry queue, khôi phục kết nối và kiểm tra tỷ lệ gửi thành công của các thông báo bị nghẽn trong log.

---

## 4. Security Requirements (Bảo mật)

### NFR-SEC-001: Xác thực JWT với thời hạn token

**Category:** Security

**Chỉ số:** Access token có thời hạn ≤ 1 giờ. Refresh token có thời hạn ≤ 7 ngày. Cả hai phải được ký bằng thuật toán RS256 hoặc ES256.

**Điều kiện đo:** Kiểm tra JWT payload và signature trong mọi API call.

**Cách verify:** Unit test kiểm tra token expiry. Integration test thử dùng expired token — phải trả về HTTP 401.

---

### NFR-SEC-002: Mật khẩu được hash an toàn

**Category:** Security

**Chỉ số:** Mật khẩu người dùng phải được hash với BCrypt (work factor ≥ 12) hoặc Argon2id. Không lưu plaintext hoặc MD5/SHA-1.

**Điều kiện đo:** Kiểm tra trực tiếp giá trị lưu trong database.

**Cách verify:** Security review: query database, xác nhận không có plaintext password. Kiểm tra work factor của BCrypt hash.

---

### NFR-SEC-003: Toàn bộ giao tiếp qua HTTPS/TLS

**Category:** Security

**Chỉ số:** 100% request/response giữa client và server phải qua HTTPS với TLS 1.2 trở lên. Không hỗ trợ TLS 1.0/1.1. HTTP redirect thành HTTPS tự động.

**Điều kiện đo:** Toàn bộ môi trường (dev/staging/production).

**Cách verify:** SSL Labs test đạt grade A trở lên. Kiểm tra HSTS header hiện diện. Confirm HTTP bị redirect 301 sang HTTPS.

---

### NFR-SEC-004: Mã hóa luồng WebRTC

**Category:** Security

**Chỉ số:** Toàn bộ luồng âm thanh và hình ảnh WebRTC phải được mã hóa bằng DTLS-SRTP. Không cho phép unencrypted media streams.

**Điều kiện đo:** Capture network traffic và kiểm tra media frames.

**Cách verify:** Dùng Wireshark capture trong phòng học, xác nhận toàn bộ RTP packets được encrypt (SRTP).

---

### NFR-SEC-005: Rate Limiting chống brute-force

**Category:** Security

**Chỉ số:**
- API đăng nhập: tối đa 10 lần thất bại trong 5 phút/IP — sau đó block 15 phút.
- API thông thường: tối đa 200 requests/phút/user.
- API upload file: tối đa 10 requests/phút/user.

**Điều kiện đo:** Áp dụng cho tất cả môi trường có kết nối internet.

**Cách verify:** Test script gửi 11 login requests sai liên tiếp, xác nhận request thứ 11 nhận HTTP 429. Kiểm tra header `Retry-After`.

---

### NFR-SEC-006: Audit Log đầy đủ cho hành động quan trọng

**Category:** Security

**Chỉ số:** 100% các hành động sau phải có audit log: đăng nhập/đăng xuất, thay đổi quyền, tạo/xóa user, upload/download tài liệu, tạo/hủy lớp học.

**Điều kiện đo:** Thực hiện từng hành động và kiểm tra audit log ngay sau đó.

**Cách verify:** Functional test: thực hiện mỗi action, query audit log table, xác nhận entry tồn tại với đầy đủ trường (timestamp, user_id, action, resource_id, ip_address).

---

### NFR-SEC-007: Phân quyền RBAC chặt chẽ

**Category:** Security

**Chỉ số:** 0% API endpoint bị bỏ quên authorization check. Student không được truy cập bất kỳ endpoint nào của Admin/Manager. Teacher chỉ truy cập dữ liệu lớp học được phân công.

**Điều kiện đo:** Test với token của từng role.

**Cách verify:** Security test: dùng Student token gọi tất cả Admin API — phải nhận HTTP 403 tất cả. Dùng Teacher token gọi API lớp học không được phân công — phải nhận HTTP 403.

---

### NFR-SEC-008: Kiểm tra file upload chống malware

**Category:** Security

**Chỉ số:** 100% file upload phải qua bước kiểm tra MIME type thực sự (magic bytes) và kiểm tra định dạng bị cấm trước khi lưu vào Object Storage.

**Điều kiện đo:** Upload file EXE đổi tên thành PDF, upload file ZIP đổi tên thành DOCX.

**Cách verify:** Functional test: upload file EXE rename thành .pdf — phải bị từ chối HTTP 422. Upload file hợp lệ — phải thành công.

---

### NFR-SEC-009: Thời hạn hiệu lực của URL tải xuống (Presigned URL Expiry)

**Category:** Security

**Chỉ số:** 100% URL tải tài liệu học tập và bản ghi ghi hình (Presigned URLs) được sinh ra từ hệ thống phải có thời hạn hiệu lực ≤ 15 phút.

**Điều kiện đo:** Trạng thái hệ thống đang hoạt động bình thường, người dùng yêu cầu tải file.

**Cách verify:** Lấy URL tải xuống của một file, đợi 16 phút, thử thực hiện yêu cầu GET lên URL đó và kiểm tra kết quả trả về mã lỗi HTTP 403 Forbidden / Expired từ Object Storage.

---

### NFR-SEC-010: Quản lý thông tin mật (Secrets Management)

**Category:** Security

**Chỉ số:** 0% các thông tin cấu hình nhạy cảm (database passwords, API keys, JWT sign keys, SMTP credentials) được lưu trực tiếp dưới dạng bản rõ (plaintext) trong mã nguồn hoặc các file cấu hình đẩy lên repository.

**Điều kiện đo:** Quá trình build và deploy CI/CD trong toàn dự án.

**Cách verify:** Sử dụng công cụ quét bảo mật tự động (như GitGuardian hoặc Trufflehog) quét toàn bộ repository để xác nhận không phát hiện thông tin nhạy cảm. Xác nhận cấu hình nạp từ Environment Variables hoặc Secrets Manager (Vault/KMS).

---

## 5. Usability Requirements (Khả năng sử dụng)

### NFR-USAB-001: Thời gian tải trang đầu tiên

**Category:** Usability

**Chỉ số:** First Contentful Paint (FCP) ≤ 3 giây trên kết nối 10 Mbps.

**Điều kiện đo:** Đo bằng Lighthouse hoặc WebPageTest trên Chrome, không có browser cache, kết nối 10 Mbps simulated.

**Cách verify:** Lighthouse CI tích hợp vào pipeline, fail build nếu FCP > 3 giây.

---

### NFR-USAB-002: Mobile browser support

**Category:** Usability

**Chỉ số:** Tính năng xem lịch học, xem tài liệu, xem báo cáo phải hoạt động đúng trên mobile browser (Chrome/Safari trên iOS và Android).

**Điều kiện đo:** Tính năng học trực tuyến (WebRTC) trên mobile là best-effort do giới hạn hardware — không phải yêu cầu cứng.

**Cách verify:** Manual test trên iPhone 12+ (Safari) và Android 10+ (Chrome). Chụp screenshot xác nhận layout responsive.

---

### NFR-USAB-003: Thông báo lỗi rõ ràng

**Category:** Usability

**Chỉ số:** 100% lỗi người dùng (validation error, permission denied, file quá lớn) phải hiển thị thông báo tiếng Việt rõ ràng, không hiển thị stack trace hoặc error code kỹ thuật ra UI.

**Điều kiện đo:** Test tất cả validation case.

**Cách verify:** Test từng error case, xác nhận message hiển thị là tiếng Việt, không chứa exception message.

---

## 6. Maintainability & Observability (Khả năng bảo trì)

### NFR-MAINT-001: Structured logging

**Category:** Maintainability

**Chỉ số:** 100% log output phải theo định dạng JSON có cấu trúc với các trường bắt buộc: `timestamp`, `level`, `service`, `traceId`, `message`.

**Điều kiện đo:** Kiểm tra log output trên tất cả service.

**Cách verify:** Chạy service, kiểm tra log output có thể parse bằng `jq` hoặc query được trên Kibana/Grafana Loki.

---

### NFR-MAINT-002: Distributed Tracing coverage

**Category:** Maintainability

**Chỉ số:** ≥ 90% API requests phải có trace ID xuyên suốt toàn bộ chuỗi microservices liên quan.

**Điều kiện đo:** Trace phải lan từ API Gateway đến tất cả downstream services được gọi.

**Cách verify:** Gọi một API phức tạp (tạo lịch học), kiểm tra Jaeger/Zipkin trace hiển thị đầy đủ span của các service liên quan.

---

### NFR-MAINT-003: Health Check endpoint

**Category:** Maintainability

**Chỉ số:** Mỗi service phải expose endpoint `/health` trả về HTTP 200 khi healthy và HTTP 503 khi không healthy. Response time của health check ≤ 100 ms.

**Điều kiện đo:** Kiểm tra khi service healthy và khi database connection bị đứt.

**Cách verify:** Unit test endpoint `/health`. Integration test: đứt database connection, xác nhận `/health` trả về 503.

---

### NFR-MAINT-004: Monitoring coverage

**Category:** Maintainability

**Chỉ số:** Toàn bộ các chỉ số sau phải được monitor với alerting: CPU > 80% sustained 5 phút, RAM > 85%, disk > 85%, error rate > 1%, p95 latency > 1 giây.

**Điều kiện đo:** Monitoring stack (Prometheus + Grafana hoặc tương đương) đã được cấu hình.

**Cách verify:** Inject CPU spike, xác nhận alert được gửi trong ≤ 5 phút.

---

### NFR-MAINT-005: Khôi phục phiên bản trước khi deploy lỗi (Deployment Rollback SLO)

**Category:** Maintainability

**Chỉ số:** Thời gian để thực hiện rollback hệ thống về phiên bản ổn định trước đó khi xảy ra sự cố deploy phiên bản mới ≤ 10 phút.

**Điều kiện đo:** Hệ thống vừa deploy phiên bản mới bị lỗi nghiêm trọng, kích hoạt lệnh rollback từ CI/CD pipeline.

**Cách verify:** Tiến hành diễn tập rollback (Rollback drill), đo thời gian từ khi kích hoạt lệnh rollback trên CI/CD đến khi toàn bộ traffic chuyển hướng an toàn về phiên bản cũ và hoạt động bình thường.

---

## 7. Compliance & Data Retention (Tuân thủ & Lưu trữ dữ liệu)

### NFR-COMP-001: Thời gian lưu trữ dữ liệu telemetry

**Category:** Compliance

**Chỉ số:** Dữ liệu telemetry chi tiết (raw metrics 5 giây) được lưu ≤ 90 ngày. Dữ liệu telemetry tổng hợp (30 phút aggregate) được lưu ≤ 1 năm. Sau thời hạn phải được xóa tự động.

**Điều kiện đo:** Cấu hình data retention policy trên storage.

**Cách verify:** Kiểm tra data retention policy được cấu hình đúng trên TimescaleDB/InfluxDB. Verify record cũ hơn 90 ngày bị xóa tự động.

---

### NFR-COMP-002: Thời gian lưu trữ audit log

**Category:** Compliance

**Chỉ số:** Audit log phải được lưu trữ tối thiểu 1 năm và không thể bị xóa bởi user thông thường.

**Điều kiện đo:** Test xóa audit log bằng tài khoản Admin thông thường.

**Cách verify:** Thử xóa audit log record qua API/UI với Admin account — phải bị từ chối. Kiểm tra record cũ 12 tháng vẫn còn trong hệ thống.

---

### NFR-COMP-003: Xóa dữ liệu cá nhân theo yêu cầu

**Category:** Compliance

**Chỉ số:** Khi có yêu cầu xóa tài khoản hợp lệ, toàn bộ thông tin định danh cá nhân (PII) phải được xóa hoặc anonymize trong ≤ 30 ngày.

**Điều kiện đo:** Áp dụng cho tất cả bảng chứa PII: users, attendance records, telemetry events.

**Cách verify:** Tạo request xóa tài khoản, kiểm tra sau 30 ngày tất cả PII đã được xóa hoặc thay bằng placeholder anonymized.

---

### NFR-COMP-004: Mã hóa dữ liệu sao lưu (Backup Encryption at Rest)

**Category:** Compliance

**Chỉ số:** 100% các bản sao lưu database (backups) lưu trữ trên disk/cloud storage phải được mã hóa bằng thuật toán AES-256 trước khi lưu.

**Điều kiện đo:** Quá trình chạy backup tự động hàng ngày.

**Cách verify:** Lấy file backup thô, thử đọc bằng công cụ khôi phục tiêu chuẩn mà không cung cấp khóa giải mã, xác nhận không đọc được dữ liệu. Kiểm tra log backup xác nhận tiến trình encrypt được gọi thành công.

---

### NFR-COMP-005: Lưu trữ và tự động xóa bản ghi học trực tuyến (Recording Retention Policy)

**Category:** Compliance

**Chỉ số:** Các bản ghi hình buổi học (recordings) được lưu trữ tối đa 180 ngày (theo [FR-MTG-010](01_Functional_Requirements.md#fr-mtg-010)) và phải tự động bị xóa vĩnh viễn sau mốc thời gian này.

**Điều kiện đo:** Tiến trình dọn dẹp chạy định kỳ hàng ngày (Cron job/Storage Lifecycle rules).

**Cách verify:** Tạo bản ghi thử nghiệm, sửa timestamp tạo file thành ngày cũ hơn 180 ngày trước, đợi tiến trình dọn dẹp chạy qua và kiểm tra xác nhận file đã bị xóa vĩnh viễn trên Object Storage.
