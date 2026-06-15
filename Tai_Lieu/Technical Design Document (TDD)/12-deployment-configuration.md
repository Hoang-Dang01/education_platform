# 12. Deployment Configuration (Cấu hình triển khai hạ tầng)

> **Mục đích:** Định nghĩa cấu hình và mô hình triển khai hạ tầng kỹ thuật — môi trường, containerization, CI/CD pipeline, environment variables, scaling, và health monitoring.
> **Tham chiếu:** SAD 09_Deployment_Architecture.md · TRD 03_Ke_Hoach_Trien_Khai.md · SRS NFR

---

## 12.1 Deployment Environments

| Môi trường | Mục đích | Branch | Trigger |
|:--|:--|:--|:--|
| **Development** | Dev local + unit test | `feature/*`, `develop` | Manual / push |
| **Staging** | Integration test, QA, UAT | `staging` | Merge to staging |
| **Production** | Live system | `main` / `master` | Manual approval sau staging pass |

**Nguyên tắc:** Production KHÔNG được deploy trực tiếp từ CI mà phải qua approval step tối thiểu 1 người review.

---

## 12.2 Container & Orchestration

### 12.2.1 Containerization

Mỗi service được đóng gói thành Docker image riêng:

```dockerfile
# Mẫu Dockerfile chuẩn cho .NET service
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ServiceName/ServiceName.csproj", "ServiceName/"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ServiceName.dll"]
```

### 12.2.2 Kubernetes Cluster Layout

```
k8s-cluster/
├── namespaces/
│   ├── education-prod          # Production workloads
│   ├── education-staging       # Staging workloads
│   └── monitoring              # Prometheus, Grafana, Alertmanager
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── lms-service/
│   ├── meeting-service/
│   ├── attendance-service/
│   ├── analytics-service/
│   ├── monitoring-service/
│   ├── diagnostics-service/
│   ├── recording-service/
│   ├── document-service/
│   ├── report-service/
│   └── notification-service/
├── infrastructure/
│   ├── api-gateway/            # NGINX Ingress / Kong
│   ├── postgresql/             # StatefulSet + PVC
│   ├── redis/                  # Redis Sentinel / Cluster
│   ├── rabbitmq/               # RabbitMQ Cluster Operator
│   └── signalr-backplane/      # Redis backplane cho SignalR
└── ingress/
    └── ingress.yaml            # TLS termination, routing rules
```

### 12.2.3 Resource Requests & Limits

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit | Replicas (Prod) |
|:--|:--|:--|:--|:--|:--|
| auth-service | 100m | 500m | 128Mi | 512Mi | 3 |
| user-service | 100m | 500m | 128Mi | 512Mi | 2 |
| lms-service | 200m | 1000m | 256Mi | 1Gi | 2 |
| meeting-service | 500m | 2000m | 512Mi | 2Gi | 3 |
| attendance-service | 200m | 1000m | 256Mi | 1Gi | 2 |
| analytics-service | 500m | 2000m | 512Mi | 2Gi | 2 |
| monitoring-service | 200m | 1000m | 256Mi | 1Gi | 2 |
| diagnostics-service | 200m | 1000m | 256Mi | 1Gi | 2 |
| recording-service | 500m | 2000m | 1Gi | 4Gi | 2 |
| notification-service | 100m | 500m | 128Mi | 512Mi | 2 |
| api-gateway | 200m | 1000m | 256Mi | 1Gi | 3 |

---

## 12.3 CI/CD Pipeline (GitHub Actions)

### 12.3.1 Pipeline Flow

```mermaid
flowchart LR
    PUSH["Push / PR"] --> LINT["Lint &\nCode Analysis"]
    LINT --> TEST["Unit Tests\n(xUnit / Jest)"]
    TEST --> BUILD["Build\nDocker Image"]
    BUILD --> SCAN["Security Scan\n(Trivy / Snyk)"]
    SCAN --> STAGING["Deploy to\nStaging"]
    STAGING --> E2E["E2E Tests\n(Playwright)"]
    E2E --> APPROVE["Manual\nApproval"]
    APPROVE --> PROD["Deploy to\nProduction"]
    PROD --> SMOKE["Smoke Tests\n& Health Check"]
```

### 12.3.2 GitHub Actions Workflow chuẩn

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [develop, staging, main]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: dotnet test --collect:"XPlat Code Coverage"
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build & Push Docker Image
        run: |
          docker build -t $IMAGE_TAG .
          docker push $IMAGE_TAG

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    environment: staging
    steps:
      - name: Deploy to Staging
        run: kubectl set image deployment/$SERVICE $SERVICE=$IMAGE_TAG -n education-staging

  deploy-prod:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production  # Requires manual approval
    steps:
      - name: Deploy to Production
        run: kubectl set image deployment/$SERVICE $SERVICE=$IMAGE_TAG -n education-prod
      - name: Wait for rollout
        run: kubectl rollout status deployment/$SERVICE -n education-prod --timeout=5m
```

---

## 12.4 Environment Variables & Secret Management

### 12.4.1 Nguyên tắc

- **KHÔNG hardcode** bất kỳ secret nào trong code hoặc Docker image
- Dùng **Kubernetes Secrets** cho dữ liệu nhạy cảm (DB password, JWT secret key)
- Dùng **ConfigMap** cho cấu hình không nhạy cảm (feature flags, timeout values)
- Production: dùng **HashiCorp Vault** hoặc **AWS Secrets Manager** làm nguồn gốc

### 12.4.2 Danh sách biến môi trường theo service

**Auth Service:**

| Biến | Loại | Mô tả | Ví dụ |
|:--|:--|:--|:--|
| `JWT_SECRET_KEY` | Secret | Khóa ký JWT access token | (32+ ký tự random) |
| `JWT_REFRESH_SECRET_KEY` | Secret | Khóa ký JWT refresh token | (32+ ký tự random) |
| `JWT_ACCESS_TOKEN_TTL` | Config | Thời gian hết hạn access token | `3600` (giây) |
| `JWT_REFRESH_TOKEN_TTL` | Config | Thời gian hết hạn refresh token | `2592000` (30 ngày) |
| `BCRYPT_COST_FACTOR` | Config | Work factor bcrypt | `12` |
| `DB_CONNECTION_STRING` | Secret | Connection string PostgreSQL | `postgres://user:pass@host/db` |
| `REDIS_CONNECTION_STRING` | Secret | Redis session store | `redis://:pass@host:6379` |
| `MAX_LOGIN_ATTEMPTS` | Config | Số lần thử đăng nhập tối đa | `5` |
| `LOCKOUT_DURATION_MINUTES` | Config | Thời gian khóa sau khi sai nhiều lần | `15` |

**Meeting Service:**

| Biến | Loại | Mô tả | Ví dụ |
|:--|:--|:--|:--|
| `SFU_SERVER_URL` | Config | WebRTC SFU endpoint | `wss://sfu.example.com` |
| `SFU_API_KEY` | Secret | API key để tạo room trên SFU | |
| `SIGNALING_TOKEN_TTL` | Config | TTL của signaling token | `3600` |
| `RECORDING_QUOTA_GB` | Config | Quota ghi hình mỗi Teacher/Room | `10` |
| `RECONNECT_TIMEOUT_SECONDS` | Config | Thời gian chờ reconnect | `30` |
| `MB_CONNECTION_STRING` | Secret | RabbitMQ connection | `amqp://user:pass@host` |

**Attendance Service:**

| Biến | Loại | Mô tả | Ví dụ |
|:--|:--|:--|:--|
| `DB_CONNECTION_STRING` | Secret | PostgreSQL | |
| `MB_CONNECTION_STRING` | Secret | RabbitMQ | |
| `ATTENDANCE_THRESHOLD_PERCENT` | Config | Ngưỡng tỷ lệ tham dự tối thiểu | `75` |
| `RECONNECT_GRACE_PERIOD_SECONDS` | Config | Grace period trước khi ghi disconnect | `30` |

**Analytics / Monitoring Service:**

| Biến | Loại | Mô tả | Ví dụ |
|:--|:--|:--|:--|
| `TELEMETRY_COLLECTION_INTERVAL_SECONDS` | Config | Tần suất thu thập metric | `5` |
| `PACKET_LOSS_POOR_THRESHOLD` | Config | Ngưỡng Poor Packet Loss | `5` (%) |
| `LATENCY_POOR_THRESHOLD_MS` | Config | Ngưỡng Poor Latency | `300` (ms) |
| `JITTER_POOR_THRESHOLD_MS` | Config | Ngưỡng Poor Jitter | `30` (ms) |
| `ALERT_COOLDOWN_SECONDS` | Config | Thời gian nghỉ giữa các alert | `60` |
| `TIMESERIES_DB_CONNECTION` | Secret | InfluxDB / TimescaleDB | |

**Recording Service:**

| Biến | Loại | Mô tả | Ví dụ |
|:--|:--|:--|:--|
| `STORAGE_BUCKET_NAME` | Config | Tên bucket Object Storage | `edu-recordings-prod` |
| `STORAGE_ENDPOINT` | Config | S3-compatible endpoint | `https://s3.example.com` |
| `STORAGE_ACCESS_KEY` | Secret | Access key | |
| `STORAGE_SECRET_KEY` | Secret | Secret key | |
| `PRESIGNED_URL_TTL_SECONDS` | Config | TTL Presigned URL download | `900` (15 phút) |
| `RECORDING_HOT_STORAGE_DAYS` | Config | Ngày lưu Hot Storage | `30` |
| `RECORDING_COLD_STORAGE_DAYS` | Config | Ngày lưu Cold Storage | `180` |
| `TRANSCODE_OUTPUT_FORMAT` | Config | Format output | `mp4` |
| `TRANSCODE_VIDEO_CODEC` | Config | Video codec | `h264` |

---

## 12.5 Scaling Strategy

### 12.5.1 Horizontal Pod Autoscaler (HPA)

```yaml
# Ví dụ HPA cho Meeting Service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: meeting-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: meeting-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

| Service | Min Replicas | Max Replicas | Scale Trigger |
|:--|:--|:--|:--|
| api-gateway | 3 | 10 | CPU > 70% |
| meeting-service | 3 | 20 | CPU > 70% hoặc active rooms > 50/pod |
| attendance-service | 2 | 10 | Queue depth > 1000 |
| analytics-service | 2 | 10 | CPU > 70% |
| auth-service | 3 | 8 | CPU > 70% |

### 12.5.2 Database Scaling

| Component | Strategy | Config |
|:--|:--|:--|
| PostgreSQL | Primary + 2 Read Replicas | Replication lag monitor |
| Redis | Redis Sentinel (1 primary, 2 replicas) | Auto failover |
| RabbitMQ | 3-node cluster | Quorum queues, replication factor = 3 |

---

## 12.6 Health Check & Readiness Probe

Mỗi service phải implement 2 endpoint:

| Endpoint | Mục đích | Response |
|:--|:--|:--|
| `GET /health/live` | Liveness probe — service còn sống không | `200 OK {"status":"alive"}` |
| `GET /health/ready` | Readiness probe — service sẵn sàng nhận traffic chưa | `200 OK {"status":"ready", "db":"ok", "cache":"ok"}` |

```yaml
# K8s probe config
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 3
```

---

## 12.7 Rollback Strategy

| Kịch bản | Hành động | Thời gian mục tiêu |
|:--|:--|:--|
| Pod crash sau deploy | K8s tự rollback về ReplicaSet trước | < 2 phút (tự động) |
| Deploy lỗi phát hiện qua smoke test | `kubectl rollout undo deployment/<name>` | < 5 phút |
| Lỗi nghiêm trọng trên Production | Rollback + thông báo stakeholder + post-mortem | < 10 phút |
| Database migration lỗi | Chạy migration rollback script, restore từ snapshot | < 30 phút |

**Điều kiện tự động rollback:** Smoke test thất bại → pipeline trigger `kubectl rollout undo` và gửi alert Slack.

---

## 12.8 Monitoring & Observability

| Tool | Mục đích |
|:--|:--|
| **Prometheus** | Thu thập metrics từ tất cả service (CPU, Memory, Request rate, Error rate) |
| **Grafana** | Dashboard visualization |
| **Alertmanager** | Routing alert → Slack / Email |
| **Jaeger / Zipkin** | Distributed tracing (trace request qua nhiều service) |
| **ELK Stack** | Centralized logging (Elasticsearch + Logstash + Kibana) |

**Key metrics cần monitor:**

| Metric | Ngưỡng cảnh báo | Action |
|:--|:--|:--|
| API Error Rate | > 1% trong 5 phút | Alert on-call |
| API P95 Latency | > 500ms | Alert |
| Pod Restart Count | > 3 lần / giờ | Alert + investigate |
| Database Connection Pool | > 80% | Alert |
| RabbitMQ Queue Depth | > 10,000 messages | Alert |
| Disk Usage | > 80% | Alert |
