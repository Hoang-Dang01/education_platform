01. System Overview
1.1 Purpose
Hệ thống được xây dựng nhằm cung cấp một nền tảng đào tạo trực tuyến toàn diện, kết hợp giữa:
Learning Management System (LMS)
Video Conference Platform
Realtime Monitoring Platform
Learning Analytics Platform
Hệ thống cho phép các tổ chức giáo dục, trung tâm đào tạo và doanh nghiệp quản lý tập trung toàn bộ quá trình đào tạo trực tuyến trên một nền tảng thống nhất.

1.2 Problem Statement
Các nền tảng hiện nay thường tồn tại các vấn đề:
LMS và Video Conference tách biệt.
Không có khả năng theo dõi chất lượng lớp học theo thời gian thực.
Điểm danh thủ công.
Không xác định được nguyên nhân gây sự cố.
Thiếu dữ liệu phân tích vận hành.
Hệ thống được đề xuất nhằm giải quyết các vấn đề trên thông qua một nền tảng tích hợp.

1.3 Business Goals
GOAL-001
Quản lý tập trung toàn bộ hoạt động đào tạo.
GOAL-002
Hỗ trợ tổ chức lớp học trực tuyến quy mô lớn.
GOAL-003
Tự động hóa quy trình điểm danh.
GOAL-004
Giám sát chất lượng lớp học theo thời gian thực.
GOAL-005
Phân tích dữ liệu học tập và vận hành.
GOAL-006
Cung cấp khả năng mở rộng và tích hợp trong tương lai.

1.4 System Scope
In Scope
User Management
Course Management
Class Management
Online Meeting
Attendance
Realtime Monitoring
Analytics
Recording
Notification

Out of Scope
Payment Gateway
HR Management
Accounting
Student Recruitment
Physical Classroom Management

1.5 Core Features
FTR-001
Authentication & Authorization
FTR-002
User Management
FTR-003
Course Management
FTR-004
Class Management
FTR-005
Meeting Management
FTR-006
Attendance Management
FTR-007
Realtime Monitoring
FTR-008
Learning Analytics
FTR-009
Recording Management
FTR-010
Notification Management

1.6 Stakeholders
Actor
Responsibility
Administrator
System Administration
Training Manager
Training Management
Instructor
Teaching
Student
Learning
Operations Team
Monitoring
System Administrator
Infrastructure
Developer
System Development


1.7 Non-Functional Objectives
Availability
99.9%
Scalability
10,000+ concurrent users.
Security
JWT + RBAC + TLS.
Performance
API Response < 500ms.
Reliability
No Single Point of Failure.

1.8 High-Level Architecture
Presentation Layer
        ↓
API Gateway
        ↓
Business Services
        ↓
Realtime Services
        ↓
Data Services
        ↓
Analytics & Monitoring


1.9 Success Criteria
Hỗ trợ học trực tuyến thời gian thực.
Tự động điểm danh.
Giám sát chất lượng lớp học.
Phân tích dữ liệu vận hành.
Hỗ trợ mở rộng trong tương lai.


