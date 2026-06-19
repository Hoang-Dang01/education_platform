# 7. Scalability Strategy
7.1. Mục tiêu
Scalability Strategy mô tả khả năng mở rộng của hệ thống khi số lượng người dùng, lớp học và dữ liệu tăng theo thời gian.
Mục tiêu của chiến lược mở rộng là:
Đảm bảo hiệu năng ổn định.
Hỗ trợ số lượng lớn người dùng đồng thời.
Tránh điểm nghẽn hệ thống (Bottleneck).
Tối ưu chi phí hạ tầng.
Hỗ trợ tăng trưởng dài hạn.

7.2. Nguyên tắc mở rộng
Kiến trúc được thiết kế theo hướng:
Horizontal Scaling
Ưu tiên mở rộng bằng cách bổ sung thêm máy chủ thay vì nâng cấp cấu hình máy chủ hiện có.
Ví dụ:
API Server 1
API Server 2
API Server 3
API Server 4


Stateless Services
Các dịch vụ Backend không lưu trạng thái cục bộ.
Trạng thái được lưu tại:
PostgreSQL
Redis
Kafka
Điều này cho phép:
Scale Out dễ dàng.
Triển khai Load Balancer.
Auto Scaling.

Event-Driven Architecture
Các dịch vụ giao tiếp thông qua Kafka thay vì gọi trực tiếp.
Lợi ích:
Giảm phụ thuộc.
Tăng khả năng chịu tải.
Dễ mở rộng độc lập.

7.3. Frontend Scalability
Frontend được triển khai dưới dạng Static Web Application.
CDN

↓

React Application

↓

User Browser


Khả năng mở rộng
Frontend gần như không phải điểm nghẽn của hệ thống.
Có thể sử dụng:
CloudFront
Cloudflare
Nginx
CDN nội bộ
để phục vụ hàng chục nghìn người dùng đồng thời.

7.4. API Layer Scalability
Kiến trúc
Load Balancer

      │

 ┌────┼────┐
 │    │    │

API  API  API

 1    2    3


Chiến lược
Mỗi API Server:
Hoạt động độc lập.
Không lưu Session cục bộ.
Chia sẻ Redis và PostgreSQL.

Mở rộng
Khi tải tăng:
3 Servers

↓

5 Servers

↓

10 Servers

không cần thay đổi mã nguồn.

7.5. Database Scalability
PostgreSQL
PostgreSQL được sử dụng cho dữ liệu nghiệp vụ.

Chiến lược
Primary Database
PostgreSQL Primary

Xử lý:
INSERT
UPDATE
DELETE

Read Replica
Replica 1
Replica 2
Replica 3

Xử lý:
Dashboard
Reporting
Query đọc

Lợi ích
Giảm tải cho Database chính.

7.6. Redis Scalability
Redis phục vụ:
Cache.
Session.
Realtime State.

Giai đoạn đầu
Single Redis


Khi mở rộng
Redis Cluster


Lợi ích
Tăng dung lượng bộ nhớ.
Tăng throughput.
Hỗ trợ High Availability.

7.7. LiveKit Scalability
Thành phần quan trọng nhất
LiveKit là nơi xử lý:
Audio.
Video.
Screen Share.
Recording.

Mô hình
LiveKit Node 1

LiveKit Node 2

LiveKit Node 3

LiveKit Node N


Chiến lược
Room được phân phối giữa các Node.
Ví dụ:
Node 1

Room A
Room B

Node 2

Room C
Room D


Khi tải tăng
Chỉ cần bổ sung thêm Node mới.
3 Nodes

↓

5 Nodes

↓

10 Nodes


Ưu điểm
Không ảnh hưởng tới các Room đang hoạt động.

7.8. Kafka Scalability
Kafka là Event Bus trung tâm.

Luồng dữ liệu
Meeting Events

Telemetry Events

Attendance Events


Chiến lược
Topic Partitioning
Telemetry Topic

Partition 1
Partition 2
Partition 3
Partition 4


Consumer Group
Analytics Worker 1

Analytics Worker 2

Analytics Worker 3


Lợi ích
Cho phép xử lý hàng triệu sự kiện mỗi ngày.

7.9. ClickHouse Scalability
ClickHouse lưu:
Telemetry Metrics.
Analytics Metrics.
Dashboard Data.

Giai đoạn đầu
Single Node


Khi dữ liệu tăng
Shard 1
Shard 2
Shard 3


Lợi ích
Tăng tốc truy vấn.
Hỗ trợ dữ liệu lớn.
Giữ hiệu năng Dashboard.

7.10. Object Storage Scalability
Lưu trữ:
Recording.
Video.
Tài liệu.

Mô hình
MinIO Cluster

hoặc

Amazon S3


Đặc điểm
Dung lượng có thể mở rộng gần như không giới hạn.

7.11. Monitoring Scalability
Prometheus
Thu thập Metrics từ:
API
PostgreSQL
Redis
Kafka
LiveKit

Grafana
Hiển thị Dashboard.

Khi hệ thống mở rộng
Có thể triển khai:
Prometheus Federation

để quản lý nhiều cụm hệ thống.

7.12. Capacity Growth Strategy
Giai đoạn 1 - Pilot
Quy mô
100 - 300 người dùng đồng thời

Hạ tầng
1 API Server

1 PostgreSQL

1 Redis

1 LiveKit Node


Giai đoạn 2 - Production
Quy mô
500 - 2.000 người dùng đồng thời

Hạ tầng
3 API Servers

1 PostgreSQL

2 Replica

1 Redis

3 LiveKit Nodes

Kafka Cluster


Giai đoạn 3 - Enterprise
Quy mô
5.000 - 10.000 người dùng đồng thời

Hạ tầng
Load Balancer

API Cluster

PostgreSQL HA

Redis Cluster

LiveKit Cluster

Kafka Cluster

ClickHouse Cluster

MinIO Cluster


7.13. Bottleneck Analysis
Các điểm nghẽn chính
LiveKit
Nguyên nhân:
Video traffic rất lớn.
Giải pháp:
Scale thêm LiveKit Node.

Recording
Nguyên nhân:
Video recording tiêu tốn CPU.
Giải pháp:
Recording Worker riêng.

ClickHouse
Nguyên nhân:
Truy vấn Dashboard lớn.
Giải pháp:
Sharding.
Materialized View.

Kafka
Nguyên nhân:
Telemetry quá nhiều.
Giải pháp:
Tăng Partition.

7.14. Kiến trúc mở rộng mục tiêu
Users

  │

  ▼

Load Balancer

  │

  ▼

API Cluster

  │

  ├──────── LMS
  ├──────── Meeting
  └──────── Analytics

                  │

                  ▼

            LiveKit Cluster

                  │

                  ▼

                Kafka

                  │

                  ▼

          Analytics Cluster

                  │

                  ▼

           ClickHouse Cluster

                  │

                  ▼

            Admin Dashboard


7.15. Kết luận
Kiến trúc được thiết kế theo hướng Horizontal Scaling và Event-Driven Architecture nhằm đảm bảo khả năng phục vụ từ vài trăm đến hàng chục nghìn người dùng đồng thời.
Mỗi thành phần quan trọng như API, LiveKit, Kafka, ClickHouse và Storage đều có khả năng mở rộng độc lập, giúp hệ thống duy trì hiệu năng ổn định khi quy mô đào tạo tăng trưởng trong tương lai.
