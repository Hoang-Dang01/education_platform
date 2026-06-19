# Nền tảng Đào tạo Trực tuyến (Education Platform)

Dự án xây dựng nền tảng đào tạo trực tuyến tích hợp, dựa trên **Jitsi Meet** (open-source), phục vụ tổ chức và quản lý hoạt động đào tạo cho trung tâm đào tạo, doanh nghiệp và tổ chức giáo dục.

## Chiến lược kỹ thuật

Sử dụng **Jitsi Meet** làm nền tảng cốt lõi — fork & extend trực tiếp, thêm các tính năng giáo dục thông qua custom modules trong `react/features/`.

### Jitsi Meet cung cấp sẵn
- ✅ Video/Audio conferencing (WebRTC)
- ✅ Chat, Reactions, Polls
- ✅ Screen Sharing
- ✅ Virtual Backgrounds
- ✅ Raise Hand
- ✅ Recording & Livestream (Jibri)
- ✅ Mobile apps (iOS, Android)
- ✅ External API (iframe embedding)

### Tính năng giáo dục cần phát triển thêm
- 🔄 Điểm danh tự động (Auto Attendance)
- 🔄 Quản lý lớp học (Class Management)
- 🔄 Teacher Controls nâng cao
- 🔄 LMS Integration (Khóa học, Tài liệu)
- 🔄 Monitoring & Analytics Dashboard
- 🔄 Báo cáo học tập & Export

## Cấu trúc dự án

```text
education-platform/
├── jitsi-meet/              # Nền tảng Jitsi Meet (Fork & Extend)
├── Ke_Hoach_Trien_Khai/     # Kế hoạch triển khai (Roadmap 5 phases)
└── Tai_Lieu/
    └── Business Requirement Document (BRD)/  # Yêu cầu nghiệp vụ
```

## Tài liệu

1. **[Business Requirement Document (BRD)](Tai_Lieu/Business%20Requirement%20Document%20(BRD)/README.md)**
   - Đặc tả yêu cầu nghiệp vụ cho 9 phân hệ chức năng
   - Trả lời: **Hệ thống cần làm gì?**

2. **[Kế hoạch Triển khai](Ke_Hoach_Trien_Khai/README.md)**
   - Roadmap 5 phases: Setup → Features → LMS → Analytics → Recording
   - Trả lời: **Triển khai như thế nào?**

3. **[Jitsi Meet](jitsi-meet/README.md)** | **[Development Guide](jitsi-meet/CLAUDE.md)**
   - Source code nền tảng & hướng dẫn phát triển

---
Chi tiết cấu trúc thư mục: [Cau_Truc_Thu_Muc.md](Cau_Truc_Thu_Muc.md) | Bản đồ kiến trúc: [system_map.md](system_map.md)
