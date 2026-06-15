# 03. User Stories Catalog (Danh mục User Stories)

> **Mục đích:** Danh mục toàn bộ User Stories của dự án — đủ nhỏ để DEV estimate và pick vào sprint.
> **AC Format:** Theo chuẩn Given/When/Then trong 04_Acceptance_Criteria_Format_Standard.md
> **Tham chiếu UC:** 02_Use_Case_Specifications.md

---

## Tóm tắt danh sách

| Domain | Prefix | Số lượng | Section |
|:--|:--|:--|:--|
| Authentication & Session | AUTH | 5 | §1 |
| LMS — Quản lý lớp học | LMS | 5 | §2 |
| Meeting / WebRTC Session | MTG | 8 | §3 |
| Document Management | DOC | 4 | §4 |
| Attendance | ATT | 6 | §5 |
| Reporting & Export | RPT | 4 | §6 |
| Monitoring & Telemetry | MON | 6 | §7 |
| Network Diagnostics | NDX | 4 | §8 |
| **Tổng** | | **42** | |

---

## 1. Authentication & Session Management (US-AUTH)

### US-AUTH-001: Đăng nhập hệ thống

**Story:** Với tư cách là người dùng (Student/Teacher/Admin), tôi muốn đăng nhập bằng email và mật khẩu để truy cập vào hệ thống theo đúng vai trò của mình.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-AUTH-001 | **FR liên quan:** FR-AUTH-001

**Scenario 1: Đăng nhập thành công**
```
Given người dùng đang ở trang đăng nhập
  And tài khoản tồn tại và chưa bị khóa
When người dùng nhập đúng email và mật khẩu, nhấn "Đăng nhập"
Then hệ thống chuyển hướng về Dashboard tương ứng với vai trò
  And thời gian phản hồi < 500ms
```

**Scenario 2: Đăng nhập thất bại do sai mật khẩu**
```
Given người dùng đang ở trang đăng nhập
  And tài khoản chưa bị khóa
When người dùng nhập email hợp lệ nhưng sai mật khẩu
Then hệ thống hiển thị "Email hoặc mật khẩu không đúng"
  And trường mật khẩu bị xóa
  But hệ thống không tiết lộ email đó có tồn tại hay không
```

**Scenario 3: Đăng nhập thất bại do tài khoản bị khóa**
```
Given tài khoản đã đăng nhập sai ≥ 5 lần liên tiếp
When người dùng cố đăng nhập thêm
Then hệ thống hiển thị "Tài khoản tạm khóa. Thử lại sau 15 phút."
  And không xử lý thêm thông tin đăng nhập
```

---

### US-AUTH-002: Đăng xuất và thu hồi session

**Story:** Với tư cách là người dùng đã đăng nhập, tôi muốn đăng xuất khỏi hệ thống để đảm bảo tài khoản không bị truy cập trái phép sau khi tôi rời khỏi thiết bị.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-AUTH-001 | **FR liên quan:** FR-AUTH-002

**Scenario 1: Đăng xuất thủ công thành công**
```
Given người dùng đã đăng nhập và đang ở bất kỳ trang nào
When người dùng nhấn nút "Đăng xuất"
Then hệ thống vô hiệu hóa JWT token hiện tại
  And chuyển hướng về trang đăng nhập
  And xóa toàn bộ dữ liệu session trên trình duyệt
```

**Scenario 2: Session tự động hết hạn do không hoạt động**
```
Given người dùng đã đăng nhập nhưng không thực hiện hành động nào trong 30 phút
When thời gian timeout đạt ngưỡng cấu hình
Then hệ thống tự động vô hiệu hóa token
  And chuyển người dùng về trang đăng nhập
  And hiển thị thông báo "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."
```

---

### US-AUTH-003: Phát hiện đăng nhập đa thiết bị

**Story:** Với tư cách là người dùng đã đăng nhập, tôi muốn được cảnh báo khi tài khoản của mình đang được đăng nhập trên thiết bị khác để tôi có thể kiểm soát bảo mật tài khoản.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-AUTH-001 (AF-1) | **FR liên quan:** FR-AUTH-003

**Scenario 1: Phát hiện session mới trên thiết bị khác**
```
Given người dùng đang đăng nhập trên thiết bị A
When người dùng đăng nhập thành công trên thiết bị B
Then hệ thống hiển thị cảnh báo trên thiết bị B:
  "Tài khoản đang đăng nhập trên thiết bị khác. Tiếp tục sẽ đăng xuất thiết bị kia."
```

**Scenario 2: Xác nhận đăng nhập thiết bị mới**
```
Given hệ thống đang hiển thị cảnh báo đa thiết bị
When người dùng nhấn "Tiếp tục"
Then session trên thiết bị A bị thu hồi
  And người dùng đăng nhập thành công trên thiết bị B
```

---

### US-AUTH-004: Khóa tài khoản sau đăng nhập sai nhiều lần

**Story:** Với tư cách là Admin, tôi muốn hệ thống tự động khóa tài khoản sau nhiều lần đăng nhập sai để bảo vệ hệ thống khỏi tấn công brute-force.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-AUTH-001 (EF-2) | **FR liên quan:** FR-AUTH-004

**Scenario 1: Khóa tài khoản sau 5 lần sai**
```
Given tài khoản đã đăng nhập sai 4 lần liên tiếp
When người dùng nhập sai mật khẩu lần thứ 5
Then hệ thống khóa tài khoản trong 15 phút
  And gửi email cảnh báo đến địa chỉ email của tài khoản
  And ghi audit log với IP và timestamp
```

**Scenario 2: Tự động mở khóa sau 15 phút**
```
Given tài khoản đang bị khóa
When đã qua 15 phút kể từ khi bị khóa
Then hệ thống tự động mở khóa tài khoản
  And đặt lại bộ đếm số lần đăng nhập sai về 0
```

---

### US-AUTH-005: Xem audit log đăng nhập (Admin)

**Story:** Với tư cách là Admin, tôi muốn xem lịch sử đăng nhập của tất cả tài khoản để phát hiện hành vi đáng ngờ và điều tra sự cố bảo mật.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-AUTH-001 | **FR liên quan:** FR-AUTH-005

**Scenario 1: Xem audit log thành công**
```
Given Admin đang ở trang Audit Log
When Admin lọc theo tài khoản và khoảng thời gian
Then hệ thống hiển thị danh sách: thời điểm đăng nhập, IP, thiết bị, kết quả (thành công/thất bại)
```

**Scenario 2: Không có dữ liệu trong khoảng thời gian chọn**
```
Given Admin đang ở trang Audit Log
When Admin chọn khoảng thời gian không có hoạt động nào
Then hệ thống hiển thị "Không có dữ liệu trong khoảng thời gian này"
  And không hiển thị bảng trống
```

---

## 2. LMS — Quản lý lớp học (US-LMS)

### US-LMS-001: Tạo khóa học mới

**Story:** Với tư cách là Teacher, tôi muốn tạo khóa học mới để tổ chức nội dung giảng dạy và quản lý học viên tham gia.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-LMS-001 | **FR liên quan:** FR-LMS-001

**Scenario 1: Tạo khóa học thành công**
```
Given Teacher đang ở trang quản lý khóa học
When Teacher điền đầy đủ thông tin (tên, mô tả, thời gian) và nhấn "Tạo khóa học"
Then hệ thống tạo khóa học với ID duy nhất
  And Teacher được gán là Instructor của khóa học
  And khóa học xuất hiện trong danh sách của Teacher
```

**Scenario 2: Tạo khóa học thiếu thông tin bắt buộc**
```
Given Teacher đang ở trang tạo khóa học
When Teacher bỏ trống trường "Tên khóa học" và nhấn "Tạo"
Then hệ thống hiển thị lỗi inline: "Tên khóa học không được để trống"
  And không tạo khóa học
```

---

### US-LMS-002: Thêm học viên vào lớp học

**Story:** Với tư cách là Teacher hoặc Admin, tôi muốn thêm học viên vào lớp học để họ có thể tham gia các buổi học và được điểm danh.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-LMS-001 | **FR liên quan:** FR-LMS-002

**Scenario 1: Thêm học viên thành công**
```
Given Teacher đang ở trang quản lý danh sách lớp học
When Teacher tìm kiếm và chọn học viên cần thêm, nhấn "Thêm"
Then học viên xuất hiện trong danh sách lớp với trạng thái "Active"
  And học viên nhận thông báo được thêm vào lớp
```

**Scenario 2: Thêm học viên không tồn tại trong hệ thống**
```
Given Teacher đang ở trang quản lý lớp học
When Teacher nhập email của học viên không tồn tại
Then hệ thống hiển thị "Không tìm thấy tài khoản với email này"
  And không thêm ai vào lớp
```

---

### US-LMS-003: Tạo lịch buổi học

**Story:** Với tư cách là Teacher, tôi muốn đặt lịch các buổi học để học viên biết thời gian và chuẩn bị trước.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-LMS-001 | **FR liên quan:** FR-LMS-003

**Scenario 1: Tạo lịch buổi học thành công**
```
Given Teacher đang ở trang quản lý lịch học của lớp
When Teacher chọn ngày giờ và nhập thời lượng, nhấn "Tạo buổi học"
Then buổi học được tạo với trạng thái "Scheduled"
  And học viên trong lớp nhận thông báo lịch học mới
```

**Scenario 2: Tạo lịch trùng với buổi học khác của Teacher**
```
Given Teacher đã có lịch dạy lớp A lúc 8:00–9:30 ngày 15/06
When Teacher tạo thêm lịch dạy lớp B lúc 8:30 ngày 15/06 (trùng giờ)
Then hệ thống hiển thị cảnh báo "Lịch dạy trùng với lớp A lúc 8:00–9:30"
  And cho phép Teacher xác nhận hoặc hủy bỏ
```

---

### US-LMS-004: Xem danh sách học viên đang online trong session

**Story:** Với tư cách là Teacher, tôi muốn xem danh sách học viên đang online trong buổi học để theo dõi sự tham gia và quản lý lớp hiệu quả.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-001 | **FR liên quan:** FR-LMS-004

**Scenario 1: Xem danh sách người tham gia real-time**
```
Given Teacher đang dạy trong phòng học với role Host
When Teacher xem panel danh sách người tham gia
Then hệ thống hiển thị danh sách học viên đang kết nối với trạng thái: 
  tên, camera on/off, mic on/off, trạng thái kết nối
  And danh sách cập nhật ngay khi có người vào/ra
```

---

### US-LMS-005: Cấu hình Feature Flag cho lớp học (Admin)

**Story:** Với tư cách là Admin, tôi muốn bật/tắt các tính năng thực nghiệm cho từng lớp học để kiểm soát việc rollout tính năng mới mà không ảnh hưởng toàn hệ thống.

**Priority:** Nice to Have | **Story Points:** ___ | **UC liên quan:** UC-LMS-001 | **FR liên quan:** FR-LMS-005

**Scenario 1: Bật feature flag cho lớp học**
```
Given Admin đang ở trang cấu hình Feature Flags
When Admin bật flag "new-recording-ui" cho lớp học cụ thể
Then chỉ lớp học đó nhìn thấy giao diện ghi hình mới
  And các lớp khác không bị ảnh hưởng
```

---

## 3. Meeting / WebRTC Session (US-MTG)

### US-MTG-001: Tham gia phòng học với tư cách học viên

**Story:** Với tư cách là Student, tôi muốn tham gia phòng học trực tuyến để tham dự buổi học và được điểm danh tự động.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-001 | **FR liên quan:** FR-MTG-001

**Scenario 1: Tham gia phòng học thành công**
```
Given Student đã đăng nhập và phòng học đang hoạt động
  And Student có trong danh sách lớp học
When Student nhấn "Tham gia lớp học" và đồng ý với Consent Prompt ghi hình
Then Student kết nối WebRTC thành công trong vòng 5 giây
  And hệ thống ghi sự kiện JOIN với server-side timestamp
  And Student thấy được video/audio của Teacher và các học viên khác
```

**Scenario 2: Tham gia phòng học bị từ chối do không có trong danh sách**
```
Given Student đã đăng nhập
  And Student không có trong danh sách lớp học đó
When Student cố gắng vào phòng học
Then hệ thống hiển thị "Bạn không có quyền tham gia lớp học này"
  And không thiết lập kết nối WebRTC
```

**Scenario 3: WebRTC connection thất bại**
```
Given Student đã đồng ý với Consent Prompt
When ICE negotiation thất bại (ICE connection failed)
Then hệ thống tự động retry 3 lần, mỗi lần cách 2 giây
  And nếu vẫn thất bại, hiển thị "Không thể kết nối. Kiểm tra mạng và thử lại."
```

---

### US-MTG-002: Mở phòng học với tư cách giáo viên

**Story:** Với tư cách là Teacher, tôi muốn mở phòng học để học viên có thể tham gia buổi học trực tuyến.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-001 | **FR liên quan:** FR-MTG-002

**Scenario 1: Mở phòng học thành công**
```
Given Teacher đã đăng nhập và có lịch dạy trong ngày
When Teacher nhấn "Bắt đầu buổi học" từ trang lịch dạy
Then phòng học chuyển từ trạng thái "Scheduled" sang "In Progress"
  And Teacher vào phòng với role Host (quyền mute, lock, record)
  And học viên trong lớp nhận thông báo "Giáo viên đã mở phòng học"
```

**Scenario 2: Kết thúc buổi học**
```
Given Teacher đang dạy trong phòng học với role Host
When Teacher nhấn "Kết thúc buổi học" và xác nhận
Then tất cả người tham gia bị ngắt kết nối
  And phòng chuyển sang trạng thái "Completed"
  And điểm danh được tính toán và lưu cho tất cả học viên
```

---

### US-MTG-003: Chấp thuận/từ chối Consent Prompt ghi hình

**Story:** Với tư cách là Student, tôi muốn được thông báo rõ ràng về việc buổi học có ghi hình không trước khi tôi vào phòng để tôi quyết định có tham gia hay không.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-001 (step 3) | **FR liên quan:** FR-MTG-003

**Scenario 1: Học viên đồng ý ghi hình**
```
Given Student nhấn "Tham gia lớp học"
  And buổi học có tính năng ghi hình được bật
When hệ thống hiển thị Consent Prompt: "Buổi học này có thể được ghi hình. Bạn đồng ý?"
  And Student nhấn "Đồng ý"
Then hệ thống tiếp tục thiết lập kết nối WebRTC
  And ghi nhận thời điểm đồng ý của Student vào log
```

**Scenario 2: Học viên từ chối ghi hình**
```
Given hệ thống đang hiển thị Consent Prompt cho Student
When Student nhấn "Không đồng ý"
Then hệ thống không cho Student vào phòng học
  And hiển thị "Bạn cần đồng ý với điều khoản để tham gia lớp học."
  And Student có thể xem lại và đồng ý lại
```

---

### US-MTG-004: Bắt đầu ghi hình buổi học

**Story:** Với tư cách là Teacher, tôi muốn bắt đầu ghi hình buổi học để học viên vắng mặt có thể xem lại sau.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-002 | **FR liên quan:** FR-MTG-007

**Scenario 1: Bắt đầu ghi hình thành công**
```
Given Teacher đang dạy trong phòng học với role Host
  And quota storage của Teacher chưa đạt 10 GB
When Teacher nhấn "Bắt đầu ghi hình"
Then hệ thống bắt đầu capture audio/video
  And hiển thị thông báo "Đang ghi hình" cho tất cả người tham gia
  And icon REC màu đỏ hiển thị trên giao diện phòng học
```

**Scenario 2: Không thể ghi hình do đạt quota**
```
Given Teacher đang trong phòng học
  And quota storage đã đạt 10 GB
When Teacher nhấn "Bắt đầu ghi hình"
Then hệ thống hiển thị "Đã đạt giới hạn lưu trữ 10 GB. Xóa recording cũ để tiếp tục."
  And không bắt đầu ghi hình
```

---

### US-MTG-005: Cảnh báo quota storage sắp đầy

**Story:** Với tư cách là Teacher, tôi muốn nhận cảnh báo khi storage sắp đầy để tôi có thể xóa recording cũ trước khi mất khả năng ghi hình.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-002 (AF-1) | **FR liên quan:** FR-MTG-009

**Scenario 1: Cảnh báo khi storage > 80%**
```
Given Teacher đang trong phòng học
  And Teacher đã sử dụng hơn 8 GB / 10 GB (> 80%)
When Teacher nhấn "Bắt đầu ghi hình"
Then hệ thống hiển thị cảnh báo: "Bạn đã dùng 8.2 GB / 10 GB. Cân nhắc xóa recording cũ."
  And Teacher vẫn có thể tiếp tục ghi hình
```

---

### US-MTG-006: Xem lại recording sau buổi học

**Story:** Với tư cách là Teacher hoặc Student, tôi muốn xem lại recording buổi học để ôn tập hoặc kiểm tra nội dung đã giảng.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-002 | **FR liên quan:** FR-MTG-011

**Scenario 1: Xem recording thành công**
```
Given người dùng đã đăng nhập
  And buổi học đã kết thúc và recording đã được xử lý xong (< 24h)
When người dùng chọn recording từ danh sách buổi học
Then hệ thống phát video trực tuyến (streaming) từ Storage Service
  And người dùng có thể tua, dừng, điều chỉnh âm lượng
```

**Scenario 2: Recording đang được xử lý (chưa available)**
```
Given buổi học vừa kết thúc (< 1 giờ trước)
When người dùng cố gắng xem recording
Then hệ thống hiển thị "Recording đang được xử lý. Vui lòng thử lại sau."
  And hiển thị thời gian ước tính còn lại
```

---

### US-MTG-007: Kiểm soát microphone học viên (Teacher)

**Story:** Với tư cách là Teacher, tôi muốn có khả năng tắt microphone của học viên cụ thể để duy trì trật tự trong lớp học.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-001 | **FR liên quan:** FR-MTG-005

**Scenario 1: Teacher tắt mic của học viên**
```
Given Teacher đang dạy trong phòng với role Host
  And học viên A đang bật microphone gây ồn
When Teacher nhấn icon mic bên cạnh tên học viên A và chọn "Tắt mic"
Then microphone của học viên A bị tắt ngay lập tức
  And học viên A nhận thông báo "Giáo viên đã tắt microphone của bạn"
```

---

### US-MTG-008: Học viên kết nối lại sau khi mất kết nối

**Story:** Với tư cách là Student, tôi muốn hệ thống tự động hỗ trợ tôi kết nối lại sau khi mất mạng để tôi không bị mất điểm danh và có thể tiếp tục buổi học.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MTG-001, UC-ATT-001 (AF-1) | **FR liên quan:** FR-MTG-006

**Scenario 1: Tự động reconnect thành công**
```
Given Student đang trong phòng học và đột ngột mất kết nối (DISCONNECT)
When kết nối mạng được khôi phục trong vòng 60 giây
Then hệ thống tự động thiết lập lại kết nối WebRTC
  And ghi sự kiện RECONNECT với timestamp server-side
  And Student tiếp tục tham gia lớp học không cần thao tác thêm
```

**Scenario 2: Thời gian mất kết nối không được tính vào điểm danh**
```
Given Student đã DISCONNECT lúc 08:20 và RECONNECT lúc 08:30
When Teacher hoặc Admin xem báo cáo điểm danh của buổi học
Then hệ thống hiển thị thời gian tham gia thực tế = tổng thời gian kết nối hợp lệ
  But khoảng 08:20–08:30 (mất kết nối) không được tính vào tổng
```

---

## 4. Document Management (US-DOC)

### US-DOC-001: Upload tài liệu giảng dạy

**Story:** Với tư cách là Teacher, tôi muốn upload tài liệu giảng dạy lên lớp học để học viên có thể truy cập trước và sau buổi học.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-DOC-001 | **FR liên quan:** FR-DOC-001

**Scenario 1: Upload tài liệu thành công**
```
Given Teacher đang ở trang quản lý tài liệu của lớp học
  And file cần upload là PDF, kích thước 15 MB (≤ 500 MB)
When Teacher chọn file và nhấn "Upload"
Then file được upload và xuất hiện trong danh sách tài liệu lớp
  And hiển thị tên file, kích thước, ngày upload
```

**Scenario 2: Upload file định dạng không được phép**
```
Given Teacher đang ở trang upload tài liệu
When Teacher chọn file có định dạng .exe và nhấn "Upload"
Then hệ thống hiển thị "Định dạng .exe không được hỗ trợ. Chỉ chấp nhận: PDF, DOCX, PPTX, MP4."
  And không upload file
```

**Scenario 3: Upload file vượt giới hạn kích thước**
```
Given Teacher đang ở trang upload tài liệu
When Teacher chọn file PDF có kích thước 600 MB (> 500 MB)
Then hệ thống hiển thị "File vượt giới hạn 500 MB. Vui lòng nén hoặc chia nhỏ file."
  And không upload file
```

---

### US-DOC-002: Tải tài liệu bảo mật (Student)

**Story:** Với tư cách là Student, tôi muốn tải tài liệu học tập từ lớp học để học ngoại tuyến, nhưng đường link tải cần giới hạn thời gian để bảo vệ nội dung bản quyền.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-DOC-001 | **FR liên quan:** FR-DOC-003

**Scenario 1: Tải tài liệu thành công trong thời hạn**
```
Given Student đang ở trang tài liệu lớp học
  And Student có trong danh sách lớp
When Student nhấn "Tải xuống" trên tài liệu
Then hệ thống tạo Presigned URL có hiệu lực 15 phút
  And trình duyệt bắt đầu tải file
```

**Scenario 2: Presigned URL hết hạn**
```
Given Student đã nhận được link tải nhưng để quá 15 phút
When Student cố gắng dùng link cũ để tải
Then hệ thống trả lỗi "Link tải đã hết hạn"
  And Student cần request lại link mới từ trang tài liệu
```

---

### US-DOC-003: Xóa tài liệu (Teacher)

**Story:** Với tư cách là Teacher, tôi muốn xóa tài liệu đã upload để dọn dẹp nội dung lỗi thời hoặc sai sót.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-DOC-001 | **FR liên quan:** FR-DOC-004

**Scenario 1: Xóa tài liệu thành công**
```
Given Teacher đang xem danh sách tài liệu của lớp học
When Teacher nhấn "Xóa" trên tài liệu cần xóa và xác nhận
Then tài liệu bị xóa khỏi danh sách và khỏi storage
  And học viên không còn thấy tài liệu đó nữa
```

**Scenario 2: Xóa tài liệu đang được học viên tải**
```
Given một học viên đang tải tài liệu A (đang có active Presigned URL)
When Teacher xóa tài liệu A
Then file bị đánh dấu deleted — không còn hiển thị cho học viên mới
  And active download của học viên đang tải vẫn hoàn thành (không bị ngắt)
```

---

### US-DOC-004: Quản lý danh sách tài liệu lớp học

**Story:** Với tư cách là Teacher, tôi muốn xem và sắp xếp danh sách tài liệu của lớp học để học viên dễ tìm kiếm và truy cập.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-DOC-001 | **FR liên quan:** FR-DOC-002

**Scenario 1: Xem và sắp xếp danh sách tài liệu**
```
Given Teacher đang ở trang quản lý tài liệu lớp
When Teacher sắp xếp danh sách theo ngày upload (mới nhất lên trước)
Then danh sách tài liệu hiển thị theo thứ tự mới nhất → cũ nhất
  And mỗi tài liệu hiển thị: tên file, định dạng, kích thước, ngày upload, số lượt tải
```

---

## 5. Attendance (US-ATT)

### US-ATT-001: Điểm danh tự động khi tham gia lớp

**Story:** Với tư cách là Student, tôi muốn được điểm danh tự động khi tham gia phòng học để không cần thực hiện thao tác điểm danh thủ công.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-ATT-001 | **FR liên quan:** FR-ATT-001

**Scenario 1: Điểm danh tự động ghi nhận JOIN**
```
Given lớp học đang diễn ra
  And Student kết nối WebRTC thành công
When hệ thống nhận sự kiện JOIN
Then sự kiện JOIN được ghi vào attendance log với server-side timestamp trong vòng 100ms
  And Dashboard của Teacher cập nhật real-time: Student A đã tham gia
```

**Scenario 2: Ghi nhận LEAVE khi học viên rời phòng**
```
Given Student đang trong phòng học và đã có sự kiện JOIN được ghi
When Student nhấn "Rời phòng" hoặc đóng tab
Then hệ thống ghi sự kiện LEAVE với server-side timestamp
  And thời gian tham gia khoảng đó = timestamp LEAVE − timestamp JOIN
```

---

### US-ATT-002: Xử lý điểm danh khi học viên reconnect

**Story:** Với tư cách là Student, tôi muốn hệ thống ghi nhận chính xác thời gian tham gia thực tế kể cả khi tôi bị mất kết nối và reconnect, để điểm danh phản ánh đúng sự tham gia của tôi.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-ATT-001 (AF-1) | **FR liên quan:** FR-ATT-002

**Scenario 1: Tính đúng thời gian sau DISCONNECT–RECONNECT**
```
Given Student JOIN lúc 08:00, DISCONNECT lúc 08:20, RECONNECT lúc 08:30
When buổi học kết thúc lúc 09:00 (tổng 60 phút)
Then thời gian tham gia thực tế = 20 phút (08:00–08:20) + 30 phút (08:30–09:00) = 50 phút
  And tỷ lệ tham dự = 50/60 = 83.3%
  But 10 phút mất kết nối (08:20–08:30) không được tính
```

---

### US-ATT-003: Xem lịch sử điểm danh cá nhân (Student)

**Story:** Với tư cách là Student, tôi muốn xem lịch sử điểm danh của bản thân theo từng buổi học để tự theo dõi tỷ lệ tham dự.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-ATT-001 | **FR liên quan:** FR-ATT-005

**Scenario 1: Xem lịch sử điểm danh thành công**
```
Given Student đã đăng nhập và đang ở trang "Lịch sử điểm danh"
When Student chọn lớp học và khoảng thời gian cần xem
Then hệ thống hiển thị danh sách buổi học:
  tên buổi, ngày giờ, thời gian tham gia, tỷ lệ điểm danh (%)
```

**Scenario 2: Xem chi tiết sự kiện của một buổi học**
```
Given Student đang xem danh sách lịch sử điểm danh
When Student nhấn vào một buổi học cụ thể
Then hệ thống hiển thị chi tiết: 
  thời điểm JOIN, các DISCONNECT và RECONNECT (nếu có), thời điểm LEAVE
  And tổng thời gian kết nối hợp lệ và tỷ lệ tham dự
```

**Scenario 3: Không có dữ liệu trong khoảng thời gian chọn**
```
Given Student đang ở trang lịch sử điểm danh
When Student chọn khoảng thời gian không có buổi học nào
Then hệ thống hiển thị "Không có dữ liệu điểm danh trong khoảng thời gian này"
  And không hiển thị bảng trống
```

---

### US-ATT-004: Xem điểm danh lớp học theo buổi (Teacher)

**Story:** Với tư cách là Teacher, tôi muốn xem tình hình điểm danh của lớp học theo từng buổi để đánh giá mức độ tham gia của học viên.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-ATT-001 | **FR liên quan:** FR-ATT-004

**Scenario 1: Xem điểm danh buổi học vừa kết thúc**
```
Given Teacher đang ở trang quản lý lớp học
When Teacher chọn "Điểm danh" của buổi học đã kết thúc
Then hệ thống hiển thị danh sách học viên với:
  trạng thái (Đạt/Không đạt), tỷ lệ tham dự (%), thời gian vào/ra, số lần mất kết nối
```

---

### US-ATT-005: Điểm danh real-time trong session (Teacher Dashboard)

**Story:** Với tư cách là Teacher, tôi muốn theo dõi điểm danh real-time trong buổi học đang diễn ra để biết học viên nào đang có mặt.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-ATT-001 | **FR liên quan:** FR-ATT-003

**Scenario 1: Dashboard cập nhật real-time khi học viên vào**
```
Given Teacher đang dạy trong phòng học
When học viên mới kết nối WebRTC và sự kiện JOIN được ghi
Then Dashboard của Teacher cập nhật danh sách: thêm học viên vừa vào
  And thời gian cập nhật < 2 giây sau khi nhận sự kiện JOIN
```

---

### US-ATT-006: Xuất báo cáo điểm danh theo lớp (Teacher/Admin)

**Story:** Với tư cách là Teacher hoặc Admin, tôi muốn xuất báo cáo điểm danh của lớp học ra file để nộp hoặc lưu trữ theo quy định.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-RPT-001 | **FR liên quan:** FR-ATT-006

**Scenario 1: Xuất báo cáo điểm danh thành công**
```
Given Teacher đang ở trang báo cáo điểm danh
When Teacher chọn lớp, khoảng thời gian và định dạng "Excel", nhấn "Xuất"
Then hệ thống tạo file Excel với đầy đủ dữ liệu điểm danh
  And file download tự động bắt đầu trong vòng 5 giây
```

**Scenario 2: Xuất báo cáo khi không có dữ liệu**
```
Given Teacher chọn khoảng thời gian không có buổi học nào
When Teacher nhấn "Xuất"
Then hệ thống hiển thị "Không có dữ liệu để xuất trong khoảng thời gian này"
  And không tạo file trống
```

---

## 6. Reporting & Export (US-RPT)

### US-RPT-001: Xuất báo cáo tổng hợp điểm danh (Admin)

**Story:** Với tư cách là Admin, tôi muốn xuất báo cáo tổng hợp điểm danh theo khoảng thời gian cho toàn bộ hệ thống để phục vụ báo cáo quản lý.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-RPT-001 | **FR liên quan:** FR-RPT-001

**Scenario 1: Xuất báo cáo tổng hợp thành công**
```
Given Admin đang ở trang báo cáo
When Admin chọn khoảng thời gian (01/06–15/06), chọn định dạng PDF, nhấn "Xuất"
Then hệ thống tổng hợp dữ liệu tất cả lớp học trong khoảng thời gian
  And tạo file PDF với bảng tổng hợp: lớp học, buổi học, tỷ lệ điểm danh trung bình
  And download bắt đầu trong vòng 10 giây
```

---

### US-RPT-002: Xem báo cáo chất lượng kết nối lớp học (Admin)

**Story:** Với tư cách là Admin, tôi muốn xem báo cáo chất lượng kết nối của từng lớp học để đánh giá hiệu quả hạ tầng và phát hiện vấn đề hệ thống.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-MON-001 | **FR liên quan:** FR-RPT-003

**Scenario 1: Xem báo cáo chất lượng kết nối sau buổi học**
```
Given buổi học đã kết thúc
When Admin xem báo cáo chất lượng của buổi học đó
Then hệ thống hiển thị: tỷ lệ % học viên ở từng mức kết nối (Excellent/Good/Poor/Critical)
  And biểu đồ time-series Packet Loss và Latency trung bình của lớp
  And danh sách các alert đã xảy ra trong buổi học
```

---

### US-RPT-003: Tìm kiếm và lọc báo cáo điểm danh theo học viên

**Story:** Với tư cách là Admin hoặc Teacher, tôi muốn tìm kiếm dữ liệu điểm danh của một học viên cụ thể trên nhiều lớp học để theo dõi toàn diện lịch học của học viên đó.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-RPT-001 | **FR liên quan:** FR-RPT-004

**Scenario 1: Tìm kiếm điểm danh theo học viên**
```
Given Admin đang ở trang báo cáo
When Admin nhập tên hoặc email của học viên cần tra cứu
Then hệ thống hiển thị tất cả buổi học của học viên đó:
  lớp học, ngày giờ, tỷ lệ điểm danh, trạng thái đạt/không đạt
```

---

### US-RPT-004: Xuất báo cáo điểm danh theo định dạng CSV

**Story:** Với tư cách là Admin, tôi muốn xuất dữ liệu điểm danh dạng CSV để import vào hệ thống quản lý học tập bên ngoài hoặc xử lý bằng Excel.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-RPT-001 | **FR liên quan:** FR-RPT-002

**Scenario 1: Xuất CSV thành công**
```
Given Admin chọn bộ lọc và định dạng xuất "CSV"
When Admin nhấn "Xuất"
Then hệ thống tạo file CSV với header row và dữ liệu đúng encoding UTF-8
  And file có thể mở trực tiếp bằng Excel mà không bị lỗi ký tự tiếng Việt
```

---

## 7. Monitoring & Telemetry (US-MON)

### US-MON-001: Xem tổng quan Dashboard giám sát (Admin)

**Story:** Với tư cách là Admin, tôi muốn xem Dashboard tổng quan về trạng thái toàn bộ hệ thống trong thời gian thực để nhanh chóng phát hiện sự cố đang xảy ra.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MON-001 | **FR liên quan:** FR-MON-001

**Scenario 1: Xem Dashboard tổng quan**
```
Given Admin đã đăng nhập và mở Monitoring Dashboard
When Dashboard load xong
Then hệ thống hiển thị real-time:
  số lớp đang diễn ra, số Teacher online, số Student online,
  số kết nối đang hoạt động, số cảnh báo đang active
  And dữ liệu cập nhật mỗi 5 giây
```

**Scenario 2: Dashboard mất kết nối với data source**
```
Given Admin đang xem Dashboard
When kết nối giữa Dashboard và backend bị gián đoạn > 10 giây
Then hệ thống hiển thị banner cảnh báo "Mất kết nối — dữ liệu có thể không cập nhật"
  And thử kết nối lại tự động
```

---

### US-MON-002: Xem chất lượng kết nối của từng người tham gia

**Story:** Với tư cách là Admin, tôi muốn xem chỉ số chất lượng kết nối (Latency, Packet Loss, Jitter) của từng người tham gia trong một lớp học đang diễn ra để xác định ai đang gặp vấn đề mạng.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MON-001 | **FR liên quan:** FR-MON-003

**Scenario 1: Xem metric của một user cụ thể (drill-down)**
```
Given Admin đang xem danh sách người tham gia của lớp học A
When Admin nhấn vào tên của học viên B
Then hệ thống hiển thị:
  Latency hiện tại (ms), Packet Loss (%), Jitter (ms), Bitrate (Kbps)
  And biểu đồ time-series của các metric trong 5 phút gần nhất
  And thông tin thiết bị: loại thiết bị, OS, trình duyệt, loại mạng
```

---

### US-MON-003: Nhận cảnh báo khi chất lượng kết nối xuống dưới ngưỡng

**Story:** Với tư cách là Admin, tôi muốn nhận cảnh báo tự động khi chất lượng kết nối của người tham gia xuống dưới ngưỡng cấu hình để tôi có thể can thiệp kịp thời.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MON-001 (EF-1) | **FR liên quan:** FR-MON-004

**Scenario 1: Cảnh báo Packet Loss vượt ngưỡng**
```
Given Admin đang xem Monitoring Dashboard
  And học viên A đang ở mức "Good"
When Packet Loss của học viên A vượt 5% trong 30 giây liên tục
Then trạng thái học viên A chuyển sang "Poor" (màu cam)
  And số cảnh báo active trên Dashboard tăng lên 1
  And alert chi tiết xuất hiện trong panel cảnh báo
```

**Scenario 2: Nhiều user cùng lúc xuống mức Critical**
```
Given nhiều học viên trong cùng lớp học cùng xuống mức "Critical"
When số lượng user Critical ≥ 30% tổng người tham gia
Then hệ thống tự động trigger UC-NDX-001 để chẩn đoán nguyên nhân
  And Admin nhận notification ưu tiên cao
```

---

### US-MON-004: Xem trạng thái kết nối của Teacher trong session

**Story:** Với tư cách là Admin, tôi muốn theo dõi riêng chất lượng kết nối của giáo viên trong mỗi lớp học vì sự cố phía giáo viên ảnh hưởng toàn lớp.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-MON-001 | **FR liên quan:** FR-MON-002

**Scenario 1: Phát hiện Teacher có Packet Loss cao**
```
Given Admin đang theo dõi lớp học A
When Packet Loss của Teacher vượt 5%
Then hệ thống highlight Teacher trong danh sách người tham gia với màu cảnh báo
  And hiển thị label "HOST — Poor Connection"
  And nếu > 50% học viên đồng thời bị ảnh hưởng: trigger Rule 01 của chẩn đoán
```

---

### US-MON-005: Xem lịch sử telemetry sau buổi học

**Story:** Với tư cách là Admin, tôi muốn xem lại lịch sử dữ liệu telemetry của một buổi học đã kết thúc để phân tích sự cố và cải thiện hạ tầng.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-MON-001 | **FR liên quan:** FR-MON-006

**Scenario 1: Xem telemetry lịch sử thành công**
```
Given buổi học đã kết thúc
When Admin chọn xem telemetry lịch sử của buổi học đó
Then hệ thống hiển thị time-series chart của toàn buổi học:
  Latency, Packet Loss, Jitter trung bình theo từng phút
  And danh sách tất cả alert đã xảy ra kèm timestamp
```

---

### US-MON-006: Cấu hình ngưỡng cảnh báo (Admin)

**Story:** Với tư cách là Admin, tôi muốn cấu hình ngưỡng cảnh báo cho các metric telemetry để điều chỉnh phù hợp với điều kiện mạng của từng đơn vị đào tạo.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-MON-001 | **FR liên quan:** FR-MON-007

**Scenario 1: Thay đổi ngưỡng Packet Loss Warning**
```
Given Admin đang ở trang cấu hình ngưỡng cảnh báo
When Admin thay đổi ngưỡng Packet Loss Warning từ 3% lên 5% và nhấn "Lưu"
Then ngưỡng mới được áp dụng cho tất cả session mới
  And các session đang diễn ra áp dụng ngưỡng mới trong vòng 30 giây
  And hệ thống ghi audit log thay đổi cấu hình
```

---

## 8. Network Diagnostics (US-NDX)

### US-NDX-001: Xem kết quả chẩn đoán sự cố tự động

**Story:** Với tư cách là Admin, tôi muốn xem kết quả chẩn đoán sự cố tự động để biết nguyên nhân và hành động xử lý cần thực hiện mà không cần phân tích thủ công raw data.

**Priority:** Must Have | **Story Points:** ___ | **UC liên quan:** UC-NDX-001 | **FR liên quan:** FR-NDX-001

**Scenario 1: Xem kết quả chẩn đoán do hệ thống trigger**
```
Given hệ thống đã tự động chạy chẩn đoán sau khi phát hiện sự cố
When Admin mở panel "Sự cố gần đây"
Then hệ thống hiển thị kết quả:
  loại sự cố (Host/Participant/Infrastructure), mức ảnh hưởng (Minor/Moderate/Major/Critical),
  mức tin cậy (Low/Medium/High), và gợi ý xử lý cụ thể
```

**Scenario 2: Không xác định được nguyên nhân (fallback)**
```
Given hệ thống đã chạy Rule Engine nhưng không rule nào match
When Admin xem kết quả chẩn đoán
Then hệ thống hiển thị "Không xác định được nguyên nhân — Cần điều tra thêm"
  And đính kèm raw telemetry data để Admin phân tích thủ công
  And tạo task "Manual Investigation" trong incident queue
```

---

### US-NDX-002: Trigger chẩn đoán thủ công cho session cụ thể

**Story:** Với tư cách là Admin, tôi muốn chủ động trigger chẩn đoán cho một session bất kỳ (không cần chờ alert) để điều tra proactively.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-NDX-001 (AF-1) | **FR liên quan:** FR-NDX-002

**Scenario 1: Trigger chẩn đoán thủ công thành công**
```
Given Admin đang xem chi tiết một lớp học đang diễn ra
When Admin nhấn "Chẩn đoán ngay"
Then hệ thống thu thập dữ liệu telemetry hiện tại và chạy Rule Engine
  And trả kết quả chẩn đoán trong vòng 10 giây
```

---

### US-NDX-003: Override kết quả chẩn đoán tự động

**Story:** Với tư cách là Admin, tôi muốn ghi đè kết quả chẩn đoán tự động bằng phân tích của mình khi tôi biết rõ nguyên nhân thực sự mà hệ thống chưa phát hiện được.

**Priority:** Nice to Have | **Story Points:** ___ | **UC liên quan:** UC-NDX-001 (AF-2) | **FR liên quan:** FR-NDX-003

**Scenario 1: Override kết quả chẩn đoán**
```
Given Admin đang xem kết quả chẩn đoán tự động của sự cố
When Admin nhấn "Ghi đè kết quả", nhập nguyên nhân thực và nhấn "Lưu"
Then hệ thống lưu cả kết quả tự động và kết quả override trong incident log
  And hiển thị rõ: "Kết quả tự động: X" và "Kết quả override bởi Admin: Y"
  And ghi audit log với timestamp và tên Admin
```

---

### US-NDX-004: Xem lịch sử sự cố và chẩn đoán

**Story:** Với tư cách là Admin, tôi muốn xem lịch sử các sự cố và kết quả chẩn đoán trước đây để phân tích xu hướng và cải thiện hạ tầng.

**Priority:** Should Have | **Story Points:** ___ | **UC liên quan:** UC-NDX-001 | **FR liên quan:** FR-NDX-004

**Scenario 1: Xem danh sách sự cố theo khoảng thời gian**
```
Given Admin đang ở trang lịch sử sự cố
When Admin lọc theo khoảng thời gian (01/06–15/06) và loại sự cố "Infrastructure"
Then hệ thống hiển thị danh sách sự cố phù hợp:
  thời điểm xảy ra, loại, lớp học bị ảnh hưởng, kết quả chẩn đoán, trạng thái xử lý
```

**Scenario 2: Không có sự cố trong khoảng thời gian chọn**
```
Given Admin lọc theo khoảng thời gian không có sự cố nào
When danh sách được tải về
Then hệ thống hiển thị "Không có sự cố nào trong khoảng thời gian này"
  And không hiển thị bảng trống
```
