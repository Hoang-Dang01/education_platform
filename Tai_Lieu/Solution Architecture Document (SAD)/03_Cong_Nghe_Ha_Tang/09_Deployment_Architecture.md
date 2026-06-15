# 9. Deployment Architecture
9.1. Mục tiêu triển khai
Deployment Architecture mô tả cách các thành phần của hệ thống được triển khai trên hạ tầng thực tế, bao gồm:
Các máy chủ và dịch vụ triển khai.
Mối quan hệ giữa các thành phần.
Luồng giao tiếp mạng.
Khả năng mở rộng và chịu lỗi.
Yêu cầu về bảo mật và giám sát.
Kiến trúc được thiết kế theo hướng Cloud-Native và Microservices, hỗ trợ mở rộng linh hoạt và đáp ứng số lượng lớn người dùng đồng thời.

9.2. Tổng quan kiến trúc triển khai
Hệ thống bao gồm các nhóm thành phần chính:
Client Layer
Web Browser
Mobile Application (Future)
Administrator Portal
Edge Layer
Load Balancer
Reverse Proxy
CDN
Application Layer
API Gateway
Authentication Service
User Service
Course Service
Class Service
Attendance Service
Notification Service
Analytics Service
Monitoring Service
Realtime Communication Layer
Signaling Server
WebRTC Media Server (SFU)
Recording Service
Data Layer
PostgreSQL
Redis
Object Storage
Message Broker
Observability Layer
Metrics Collector
Logging Service
Dashboard Service
Alert Manager

9.3. Deployment Topology
Internet Zone
Users truy cập hệ thống thông qua HTTPS.
DMZ Layer
Load Balancer
Reverse Proxy
WAF (Optional)
Application Cluster
Triển khai các microservice dưới dạng container.
Mỗi service có thể mở rộng theo chiều ngang (Horizontal Scaling).
Media Cluster
Triển khai:
WebRTC SFU
Recording Service
Media Processing Service
Các thành phần này được tách riêng khỏi Business Services để giảm tải hệ thống.
Data Cluster
PostgreSQL Primary
PostgreSQL Replica
Redis Cluster
Object Storage
Monitoring Cluster
Metrics Database
Dashboard Server
Log Aggregator
Alert Service

9.4. High Availability
Hệ thống hỗ trợ:
Horizontal Scaling.
Load Balancing.
Service Redundancy.
Database Replication.
Automatic Restart.
Health Check.
Failover Mechanism.
Mục tiêu:
Không có Single Point of Failure.
Hỗ trợ số lượng lớn người dùng đồng thời.
Đảm bảo tính sẵn sàng cao.

9.5. Security Architecture
Authentication
JWT Authentication
Refresh Token
RBAC
Communication Security
HTTPS/TLS
Secure WebSocket
WebRTC DTLS-SRTP
Data Security
Password Hashing
Database Backup
Encryption at Rest
Infrastructure Security
Firewall
Rate Limiting
Audit Logging

9.6. Monitoring and Observability
Hệ thống theo dõi:
Infrastructure Metrics
CPU
Memory
Disk
Network
Application Metrics
Request Rate
Response Time
Error Rate
Realtime Metrics
Latency
Packet Loss
Jitter
RTT
FPS
Bitrate
Business Metrics
Active Classes
Active Users
Attendance Rate
Completion Rate

9.7. Future Deployment Strategy
Trong tương lai hệ thống có thể triển khai trên:
Kubernetes Cluster
Multi-Region Deployment
Auto Scaling
Disaster Recovery Site
Multi-Cloud Architecture
Edge Media Server
Kiến trúc triển khai được thiết kế đủ linh hoạt để đáp ứng nhu cầu mở rộng của các trung tâm đào tạo, doanh nghiệp và tổ chức giáo dục quy mô lớn.
