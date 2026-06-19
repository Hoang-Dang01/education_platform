# 10. Phân hệ Chẩn đoán nguyên nhân sự cố (Network Diagnostics)

## 10.1. Mục tiêu
Phân hệ Chẩn đoán nguyên nhân sự cố có nhiệm vụ phân tích dữ liệu Telemetry và dữ liệu giám sát thời gian thực nhằm xác định nguyên nhân ảnh hưởng đến chất lượng lớp học trực tuyến.

Mục tiêu của phân hệ là hỗ trợ quản lý, giáo viên và bộ phận kỹ thuật nhanh chóng xác định phạm vi ảnh hưởng và nguồn gốc của sự cố để có biện pháp xử lý phù hợp.

## 10.2. Nguồn dữ liệu phân tích
Phân hệ sử dụng và tổng hợp dữ liệu theo thời gian thực hoặc sau buổi học từ các nguồn:
* Telemetry Metrics.
* Real-Time Monitoring.
* Attendance Events.
* Media Server Statistics.
* System Logs.

## 10.3. Phạm vi chẩn đoán
Hệ thống hỗ trợ xác định các nhóm nguyên nhân chính:
* **Lỗi phía giáo viên (Host Side):** Sự cố phát sinh từ thiết bị hoặc kết nối mạng của giáo viên.
* **Lỗi phía học viên (Participant Side):** Sự cố chỉ ảnh hưởng đến một hoặc một nhóm nhỏ học viên.
* **Lỗi hạ tầng hệ thống (Infrastructure Side):** Sự cố phát sinh từ Media Server, Network Gateway hoặc hạ tầng trung tâm.

## 10.4. Kịch bản chẩn đoán

### Trường hợp 1: Giáo viên gặp sự cố
* **Dấu hiệu:**
  * Packet Loss của giáo viên tăng cao.
  * Latency của giáo viên tăng bất thường.
  * Nhiều học viên đồng thời báo mất tiếng hoặc giật hình.
  * Chất lượng kết nối của học viên vẫn ổn định.
* **Kết luận sơ bộ:** Khả năng cao nguyên nhân xuất phát từ phía giáo viên.
* **Mức độ tin cậy:** Cao.

### Trường hợp 2: Học viên gặp sự cố
* **Dấu hiệu:**
  * Chỉ một hoặc một nhóm nhỏ học viên có Packet Loss cao.
  * Các học viên khác hoạt động bình thường.
  * Giáo viên không ghi nhận vấn đề kết nối.
* **Kết luận sơ bộ:** Nguyên nhân thuộc về phía học viên.
* **Mức độ tin cậy:** Cao.

### Trường hợp 3: Hạ tầng hệ thống gặp sự cố
* **Dấu hiệu:**
  * Nhiều lớp học đồng thời gặp hiện tượng giật hình hoặc mất tiếng.
  * Packet Loss tăng đồng loạt ở nhiều phòng học.
  * Media Server xuất hiện cảnh báo hoặc quá tải.
  * Nhiều kết nối bị ngắt trong cùng thời điểm.
* **Kết luận sơ bộ:** Khả năng cao sự cố thuộc về hạ tầng hệ thống hoặc mạng trung tâm.
* **Mức độ tin cậy:** Cao.

## 10.5. Luật phân tích sự cố
Hệ thống áp dụng tập luật (Rule Engine) để đánh giá nguyên nhân.

* **Rule 01:**
  * **Nếu:** Host Packet Loss > 5% VÀ Trên 50% học viên bị ảnh hưởng
  * **Kết luận:** Host Connection Issue.
* **Rule 02:**
  * **Nếu:** Chỉ một người có Packet Loss > 5% VÀ Các thành viên còn lại bình thường
  * **Kết luận:** Participant Connection Issue.
* **Rule 03:**
  * **Nếu:** Trên 30% lớp học đang hoạt động gặp cảnh báo trong cùng thời điểm
  * **Kết luận:** Infrastructure Issue.

## 10.6. Kết quả phân tích
Đối với mỗi sự cố, hệ thống cung cấp:
* **Thông tin nguyên nhân:** Loại sự cố, nguồn gốc sự cố, thời gian xảy ra và thời gian khắc phục.
* **Mức độ ảnh hưởng:** Minor, Moderate, Major, Critical.
* **Độ tin cậy:** Low, Medium, High.

## 10.7. Gợi ý xử lý
Hệ thống có thể đưa ra các khuyến nghị xử lý tương ứng:
* **Đối với học viên:** Kiểm tra kết nối mạng, chuyển sang mạng dây, hoặc tắt các ứng dụng sử dụng băng thông lớn.
* **Đối với giáo viên:** Kiểm tra thiết bị ghi hình, kiểm tra đường truyền Internet, hoặc giảm chất lượng video truyền tải.
* **Đối với quản trị viên:** Kiểm tra Media Server, kiểm tra hạ tầng mạng, hoặc kiểm tra tài nguyên hệ thống.

## 10.8. Vai trò trong hệ thống
Phân hệ Chẩn đoán nguyên nhân sự cố là tầng phân tích nghiệp vụ được xây dựng trên dữ liệu từ các phân hệ Monitoring và Telemetry.

Phân hệ này giúp chuyển đổi dữ liệu kỹ thuật thành thông tin có ý nghĩa đối với quản lý và bộ phận vận hành, từ đó rút ngắn thời gian xử lý sự cố và nâng cao chất lượng đào tạo trực tuyến.
