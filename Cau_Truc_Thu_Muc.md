# Cấu trúc thư mục dự án (Project Directory Structure)

Dưới đây là sơ đồ cấu trúc cây thư mục toàn bộ dự án **Education Platform** (Jitsi Meet-based):

```text
education-platform/
├── README.md                              # Giới thiệu dự án và hướng dẫn chung
├── Cau_Truc_Thu_Muc.md                    # Sơ đồ cấu trúc cây thư mục của dự án (file này)
├── system_map.md                          # Bản đồ kiến trúc hệ thống (Entry Point nhanh cho AI)
│
├── jitsi-meet/                            # Nền tảng Jitsi Meet (Fork & Extend)
│   ├── react/features/                    # Feature modules (thêm custom education modules ở đây)
│   ├── config.js                          # Cấu hình client-side
│   ├── interface_config.js                # Cấu hình giao diện & branding
│   ├── css/                               # SCSS stylesheets
│   ├── modules/                           # Legacy modules & APIs
│   ├── lang/                              # Translations
│   └── ...                                # (Xem chi tiết tại jitsi-meet/README.md)
│
├── Ke_Hoach_Trien_Khai/                   # Kế hoạch triển khai dự án
│   └── README.md                          # Roadmap 5 phases (Setup → Features → LMS → Analytics → Recording)
│
└── Tai_Lieu/                              # Thư mục chứa tài liệu dự án
    └── Business Requirement Document (BRD)/ # Tài liệu yêu cầu nghiệp vụ (BRD)
        ├── README.md                      # Mục lục tài liệu BRD
        ├── 01_Tong_Quan/                  # Tổng quan dự án & Người dùng
        │   ├── 01_Muc_Tieu_Du_An.md       # 1. Mục tiêu dự án
        │   └── 02_Phan_Loai_Nguoi_Dung.md # 2. Phân loại người dùng
        ├── 02_Phan_He_Nghiep_Vu/          # Các phân hệ chức năng
        │   ├── 03_LMS.md                  # 3. Phân hệ LMS
        │   ├── 04_Hoc_Truc_Tuyen.md       # 4. Phân hệ Học trực tuyến
        │   ├── 05_Tai_Lieu.md             # 5. Phân hệ Tài liệu
        │   ├── 06_Diem_Danh.md            # 6. Phân hệ Điểm danh
        │   └── 11_Bao_Cao_Xuat_Du_Lieu.md # 11. Phân hệ Báo cáo và Xuất dữ liệu
        ├── 03_Giam_Sat_Telemetry/         # Giám sát và phân tích mạng
        │   ├── 07_Giam_Sat_Thoi_Gian_Thuc.md      # 7. Giám sát thời gian thực
        │   ├── 08_Telemetry_Network_Analytics.md   # 8. Telemetry & Network Analytics
        │   ├── 09_Giam_Sat_Nguoi_Dung.md           # 9. Giám sát người dùng
        │   └── 10_Chan_Doan_Su_Co.md               # 10. Chẩn đoán nguyên nhân sự cố
        └── 04_Ket_Luan/                   # Kết luận
            └── 12_Ket_Luan.md             # 12. Kết luận
```

---

## Trạng thái triển khai (Progress Status)

| Thành phần | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Business Requirement Document (BRD)** | ✅ Hoàn thành | Đặc tả nghiệp vụ 9 phân hệ — giữ nguyên |
| **Jitsi Meet (Core Platform)** | 📦 Sẵn sàng | Source code có sẵn, cần deploy & customize |
| **Ke_Hoach_Trien_Khai** | 🔄 Phase 0 | Roadmap 5 phases — Fork & Extend Jitsi Meet |
