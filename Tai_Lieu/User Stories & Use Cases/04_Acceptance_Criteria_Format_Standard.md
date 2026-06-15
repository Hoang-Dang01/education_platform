# 04. Acceptance Criteria Format Standard (Chuẩn tiêu chí nghiệm thu)

> **Mục đích:** Quy chuẩn duy nhất cho toàn team về cách viết Acceptance Criteria. Viết một lần, áp dụng mãi mãi.
> **Phạm vi áp dụng:** BA, Developer, QA — tất cả người tham gia viết hoặc review AC.

---

## 1. Tại sao cần chuẩn hóa AC

### 1.1. Vấn đề khi AC không nhất quán

Khi AC được viết tự do, không có chuẩn chung, các vấn đề thường gặp:

- **Không testable:** "Hệ thống phải phản hồi nhanh" — QA không biết nhanh là bao nhiêu ms.
- **Mơ hồ về actor:** "Khi đăng nhập thành công" — ai đăng nhập? Hệ thống tự động hay người dùng nhấn nút?
- **Chỉ có happy path:** DEV build theo happy path, QA không có kịch bản lỗi để test.
- **Nhồi nhiều hành vi:** Một scenario chứa 3-4 hành động — khi fail không biết bước nào sai.
- **Không traceability:** Không liên kết được AC với FR, không audit được sau deploy.

### 1.2. Lợi ích BDD Given/When/Then

Cú pháp **Given / When / Then** (BDD — Behavior-Driven Development) giải quyết các vấn đề trên:

| Vế | Trả lời câu hỏi | Ràng buộc bắt buộc |
|:--|:--|:--|
| **Given** | Hệ thống đang ở trạng thái nào? | Là trạng thái, không phải hành động |
| **When** | Actor làm gì? | Đúng 1 hành động duy nhất |
| **Then** | Kết quả quan sát được là gì? | Phải testable — có số liệu cụ thể nếu là performance |

---

## 2. Cú pháp chuẩn

### 2.1. Cấu trúc Given / When / Then

```
**Scenario [N]: [Tên mô tả hành vi — dùng động từ]**
Given [trạng thái ban đầu của hệ thống hoặc actor]
  And [điều kiện bổ sung nếu cần]
When [đúng 1 hành động của actor]
Then [kết quả quan sát được — cụ thể, testable]
  And [kết quả bổ sung nếu có]
  But [kết quả KHÔNG xảy ra — dùng để loại trừ]
```

### 2.2. Quy tắc viết từng vế

**Given — Trạng thái ban đầu:**
- Mô tả **trạng thái** (state), không phải hành động (action).
- Có thể có nhiều `And` nếu cần nhiều điều kiện tiền đề.
- Không bao giờ bắt đầu bằng động từ hành động:
  - ❌ `Given user clicks the login button`
  - ✅ `Given user is on the login page`

**When — Hành động của actor:**
- **Đúng 1 hành động duy nhất** của 1 actor.
- Nếu muốn viết "When A and B" — bắt buộc tách thành 2 scenario riêng.
- Chủ ngữ là actor cụ thể (Student / Teacher / Admin / System), không dùng "user" chung chung khi có nhiều loại actor.

**Then — Kết quả quan sát được:**
- Phải là kết quả **có thể quan sát và kiểm tra** được bởi QA.
- Ưu tiên có số liệu cụ thể: `< 300ms`, `hiển thị thông báo "X"`, `trạng thái chuyển thành Y`.
- Không dùng từ mơ hồ: ❌ `hoạt động tốt`, `hiển thị đúng`, `phản hồi nhanh`.

### 2.3. Các từ khóa mở rộng

| Từ khóa | Dùng khi nào |
|:--|:--|
| `And` | Thêm điều kiện/kết quả cùng loại (Given thêm Given, Then thêm Then) |
| `But` | Mô tả điều **không** xảy ra — dùng trong Then để loại trừ hành vi không mong muốn |

---

## 3. Phân loại scenario

### 3.1. Happy path (Luồng thành công)
Kịch bản actor thực hiện đúng luồng, hệ thống trả về kết quả mong đợi.
- **Bắt buộc** có ít nhất 1 scenario loại này cho mỗi User Story.

### 3.2. Alternate path (Luồng thay thế)
Kịch bản hợp lệ nhưng khác luồng chính — hệ thống vẫn xử lý được nhưng theo hướng khác.
- **Ví dụ:** Học viên reconnect sau khi mất kết nối → hệ thống ghi nhận 2 khoảng thời gian riêng biệt.

### 3.3. Error path (Luồng lỗi / ngoại lệ)
Kịch bản actor nhập sai, hệ thống gặp lỗi, hoặc điều kiện không thỏa mãn.
- **Bắt buộc** có ít nhất 1 scenario loại này cho mỗi User Story.
- Hệ thống luôn phải có hành vi xác định khi gặp lỗi — không được "crash silently".

---

## 4. Ví dụ minh họa theo domain

### 4.1. Ví dụ: Authentication

**Scenario 1: Đăng nhập thành công**
```
Given người dùng đang ở trang đăng nhập
  And tài khoản với email "teacher@school.edu" tồn tại trong hệ thống và chưa bị khóa
When người dùng nhập đúng email và mật khẩu, nhấn nút "Đăng nhập"
Then hệ thống chuyển hướng về Dashboard tương ứng với vai trò của người dùng
  And thời gian phản hồi < 500ms
  And một JWT token hợp lệ được lưu vào session
```

**Scenario 2: Đăng nhập thất bại do sai mật khẩu**
```
Given người dùng đang ở trang đăng nhập
  And tài khoản chưa bị khóa
When người dùng nhập email hợp lệ nhưng mật khẩu sai, nhấn "Đăng nhập"
Then hệ thống hiển thị thông báo "Email hoặc mật khẩu không đúng"
  And trường mật khẩu bị xóa, trường email giữ nguyên
  But hệ thống không tiết lộ tài khoản đó có tồn tại hay không
```

**Scenario 3: Tài khoản bị khóa sau 5 lần sai liên tiếp**
```
Given tài khoản đã đăng nhập sai 4 lần liên tiếp
When người dùng nhập sai mật khẩu lần thứ 5
Then hệ thống khóa tài khoản trong 15 phút
  And hiển thị thông báo "Tài khoản tạm khóa. Thử lại sau 15 phút."
  And gửi email cảnh báo đến địa chỉ email đã đăng ký
```

### 4.2. Ví dụ: WebRTC Session

**Scenario 1: Tham gia phòng học thành công**
```
Given học viên đã đăng nhập
  And phòng học đang hoạt động (Teacher đã mở phòng)
  And học viên có trong danh sách lớp học
When học viên nhấn nút "Tham gia lớp học"
Then học viên kết nối WebRTC thành công trong vòng 5 giây
  And hệ thống hiển thị Consent Prompt về việc ghi hình trước khi vào phòng
  And danh sách người tham gia trên Dashboard của Teacher cập nhật tên học viên
```

**Scenario 2: Tham gia phòng thất bại do WebRTC lỗi**
```
Given học viên đã đăng nhập
  And phòng học đang hoạt động
When WebRTC ICE negotiation thất bại (ICE connection failed)
Then hệ thống hiển thị thông báo "Không thể kết nối. Vui lòng thử lại."
  And tự động thử kết nối lại tối đa 3 lần, mỗi lần cách nhau 2 giây
  And nếu vẫn thất bại sau 3 lần, hiển thị nút "Liên hệ hỗ trợ"
```

### 4.3. Ví dụ: Điểm danh

**Scenario 1: Ghi nhận điểm danh khi tham gia**
```
Given lớp học đang diễn ra
  And học viên đã kết nối WebRTC thành công
When hệ thống nhận sự kiện JOIN từ phía học viên
Then hệ thống ghi nhận sự kiện JOIN với timestamp server-side trong vòng 100ms
  And Dashboard của giáo viên cập nhật trạng thái điểm danh real-time
```

**Scenario 2: Tính tỷ lệ điểm danh sau khi reconnect**
```
Given học viên đã tham gia lớp từ 08:00 (đã có sự kiện JOIN)
  And học viên bị mất kết nối lúc 08:20 (DISCONNECT được ghi nhận)
When học viên kết nối lại lúc 08:30 (RECONNECT)
Then hệ thống ghi nhận 2 khoảng thời gian riêng biệt: [08:00–08:20] và [08:30–...]
  And tỷ lệ điểm danh được tính từ tổng thời gian kết nối hợp lệ
  But khoảng thời gian mất kết nối 08:20–08:30 không được tính vào tổng
```

### 4.4. Ví dụ: Telemetry alert

**Scenario 1: Hệ thống phát cảnh báo kết nối kém**
```
Given học viên đang trong phòng học với trạng thái kết nối "Good"
When Packet Loss của học viên vượt ngưỡng 5% trong 30 giây liên tục
Then hệ thống chuyển trạng thái kết nối của học viên sang "Poor"
  And hiển thị icon cảnh báo màu cam trên giao diện học viên đó
  And Admin Dashboard cập nhật trạng thái trong vòng 5 giây
```

---

## 5. Các lỗi thường gặp khi viết AC

### 5.1. AC quá chung chung (không testable)

| Loại lỗi | ❌ AC tệ | ✅ AC tốt |
|:--|:--|:--|
| Không có ngưỡng | "Hệ thống phải phản hồi nhanh" | "Then response time < 300ms tại 95th percentile" |
| Thông báo mơ hồ | "Hiển thị thông báo lỗi" | "Then hiển thị: 'Kết nối thất bại. Vui lòng kiểm tra mạng.'" |
| Kết quả không rõ | "Điểm danh được ghi nhận chính xác" | "Then sự kiện JOIN được ghi vào log trong vòng 100ms" |

### 5.2. Nhồi nhiều hành vi vào một scenario

| ❌ AC tệ | ✅ AC tốt |
|:--|:--|
| "When user logs in and joins room and starts recording" | Tách thành 3 scenario: login / join room / start recording |
| "When teacher creates class and assigns students and sends invitation" | Tách thành 3 scenario riêng biệt |

### 5.3. Thiếu error path

| ❌ Chỉ có happy path | ✅ Thêm error path |
|:--|:--|
| Given valid credentials → When login → Then success | Thêm: Given invalid password → When login → Then error message + lockout logic |

### 5.4. Given là hành động (không phải trạng thái)

| ❌ AC tệ | ✅ AC tốt |
|:--|:--|
| "Given user clicks the login button" | "Given user is on the login page" |
| "Given admin navigates to monitoring dashboard" | "Given admin is on the monitoring dashboard" |

---

## 6. Checklist tự kiểm tra trước khi submit AC

Trước khi submit User Story cho review, BA/DEV/QA tự kiểm tra:

- [ ] **Given** mô tả trạng thái (state), không phải hành động (action)
- [ ] **When** chỉ có đúng 1 hành động của 1 actor duy nhất
- [ ] **Then** có thể quan sát và kiểm tra được — không dùng từ mơ hồ
- [ ] Có ít nhất 1 **happy path** và 1 **error path** cho mỗi User Story
- [ ] Tên scenario dùng **động từ** mô tả hành vi ("Đăng nhập thành công", không phải "Trường hợp 1")
- [ ] Không có từ mơ hồ trong Then: "hoạt động tốt", "hiển thị đúng", "phản hồi nhanh"
- [ ] Nếu Then có số liệu performance — đã tham chiếu NFR tương ứng trong SRS
- [ ] Mỗi scenario chỉ kiểm tra **1 hành vi duy nhất**
- [ ] AC đã được pair review với QA để đảm bảo testable ngay từ khi viết
