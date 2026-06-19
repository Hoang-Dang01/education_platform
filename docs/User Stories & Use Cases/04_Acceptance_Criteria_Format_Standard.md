# 04. Acceptance Criteria Format Standard (Chuẩn tiêu chí nghiệm thu)

## 4.1. Quy chuẩn viết Acceptance Criteria (AC)
Tất cả User Story trong dự án phải được viết AC theo cấu trúc chuẩn **Given / When / Then**:

```text
Scenario: [Tên kịch bản kiểm thử]
  Given [Bối cảnh / Điều kiện tiền đề]
  When [Hành động của người dùng hoặc hệ thống]
  Then [Kết quả mong đợi]
```

## 4.2. Ví dụ áp dụng
```text
Scenario: Điểm danh tự động thành công khi học viên tham gia đủ thời gian
  Given Lớp học đang diễn ra và học viên A đã tham gia phòng học trực tuyến
  When Học viên A ở lại trong phòng học lớn hơn 80% thời lượng buổi học
  Then Hệ thống tự động đánh dấu trạng thái điểm danh của học viên A là 'Present'
```
