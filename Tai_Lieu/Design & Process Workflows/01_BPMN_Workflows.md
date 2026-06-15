# 01. BPMN Workflows (Sơ đồ luồng nghiệp vụ)

> **Mục đích:** Trực quan hóa 3 luồng nghiệp vụ chính — đủ để DEV hiểu thứ tự xử lý, phân chia trách nhiệm client/server, và các nhánh xử lý lỗi.
> **Tham chiếu:** UC-MTG-001 · UC-MTG-002 · UC-ATT-001 · UC-NDX-001 · BRD 04, 06, 10

---

## BPMN-001: Vòng đời lớp học trực tuyến

**Mô tả:** Toàn bộ flow từ khi Teacher mở phòng học đến khi kết thúc, bao gồm điểm danh, ghi hình, và transcode recording.

**UC liên quan:** UC-MTG-001, UC-MTG-002, UC-ATT-001

```mermaid
flowchart TD
    START([Teacher bắt đầu buổi học]) --> T_CREATE[Teacher tạo/mở phòng học\nGọi POST /meetings]
    T_CREATE --> ROOM_READY{Phòng tạo thành công?}
    ROOM_READY -->|Không| ERR1[Hiển thị lỗi\nLog error] --> END_FAIL([Kết thúc — thất bại])
    ROOM_READY -->|Có| SIGNALING[Meeting Service\ntạo Signaling Token]
    SIGNALING --> NOTIFY_S[Thông báo tới\nhọc viên trong lớp]

    NOTIFY_S --> S_JOIN[Student nhận thông báo\nvà click tham gia]
    S_JOIN --> AUTH_CHECK{Đã xác thực?}
    AUTH_CHECK -->|Không| LOGIN[Redirect đăng nhập] --> S_JOIN
    AUTH_CHECK -->|Có| CONSENT_CHECK{Phòng đang ghi hình?}
    CONSENT_CHECK -->|Có| CONSENT_PROMPT[Hiển thị Consent Prompt\nyêu cầu đồng ý ghi hình]
    CONSENT_PROMPT --> CONSENT_AGREE{Đồng ý?}
    CONSENT_AGREE -->|Không| DENY[Từ chối — không vào phòng\nHiển thị thông báo] --> END_DENY([Student không tham gia])
    CONSENT_AGREE -->|Có| WEBRTC
    CONSENT_CHECK -->|Không| WEBRTC[Kết nối WebRTC SFU\nICE negotiation]

    WEBRTC --> CONNECT_OK{Kết nối thành công?}
    CONNECT_OK -->|Không| RETRY{Thử lại < 3 lần?}
    RETRY -->|Có| WEBRTC
    RETRY -->|Không| ERR2[Hiển thị lỗi kết nối\nKhông ghi nhận điểm danh] --> END_CONN([Student không vào được])
    CONNECT_OK -->|Có| ATT_START[Attendance Service\nghi nhận sự kiện JOIN\nTimestamp server-side]

    ATT_START --> IN_SESSION[Buổi học diễn ra\nStudent & Teacher tương tác]

    IN_SESSION --> REC_TRIGGER{Teacher bật ghi hình?}
    REC_TRIGGER -->|Có| REC_START[Ghi hình bắt đầu\nREC badge hiển thị\nAll students nhận thông báo]
    REC_START --> IN_SESSION
    REC_TRIGGER -->|Không| IN_SESSION

    IN_SESSION --> END_TRIGGER{Teacher kết thúc buổi học?}
    END_TRIGGER -->|Không| IN_SESSION
    END_TRIGGER -->|Có| END_SESSION[Teacher nhấn End Session\nMeeting Service broadcast\nMeetingEnded event]

    END_SESSION --> ATT_CALC[Attendance Service\ntính tỷ lệ tham dự\ncho tất cả participants]
    ATT_CALC --> REC_CHECK{Có recording?}
    REC_CHECK -->|Có| REC_STOP[Dừng ghi hình\nUpload raw file → Storage]
    REC_STOP --> TRANSCODE[Transcode: MP4/H.264\n720p hoặc theo cấu hình]
    TRANSCODE --> HOT_STORAGE[Lưu vào Hot Storage\n0–30 ngày]
    HOT_STORAGE --> SAVE_REPORT
    REC_CHECK -->|Không| SAVE_REPORT[Lưu báo cáo điểm danh\nGửi thông báo kết thúc]
    SAVE_REPORT --> END_OK([Buổi học kết thúc — thành công])
```

---

## BPMN-002: Quy trình điểm danh tự động & Reconnect

**Mô tả:** Chi tiết server-side event ordering khi Student join, disconnect, và reconnect. Đây là luồng nhạy cảm nhất vì liên quan đến race condition và tính chính xác của dữ liệu điểm danh.

**UC liên quan:** UC-ATT-001  
**BRD tham chiếu:** 06_Diem_Danh.md §6.2–6.7

```mermaid
flowchart TD
    START([Student tham gia phòng]) --> WEBRTC_OK{WebRTC kết nối?}
    WEBRTC_OK -->|Không| ERR_CONNECT[Log lỗi kết nối\nKhông tạo attendance record] --> END_ERR([Kết thúc — không điểm danh])
    WEBRTC_OK -->|Có| EVT_JOIN[Attendance Service nhận\nParticipantJoined event\nGhi timestamp JOIN — server-side]

    EVT_JOIN --> TRACK[Bắt đầu tích lũy\nthời gian có mặt]
    TRACK --> DISCONNECT{Mất kết nối?}

    DISCONNECT -->|Không| MEETING_END{Buổi học kết thúc?}
    MEETING_END -->|Không| DISCONNECT
    MEETING_END -->|Có| CALC_FINAL[Tính tỷ lệ tham dự:\ntổng_thời_gian / meeting_duration × 100%]
    CALC_FINAL --> SAVE[Lưu kết quả\nAttendanceRecord] --> END_OK([Kết thúc — điểm danh hoàn tất])

    DISCONNECT -->|Có| EVT_DISC[Attendance Service nhận\nParticipantDisconnected event\nDừng tích lũy — ghi timestamp DISCONNECT]
    EVT_DISC --> RECONNECT_WAIT{Reconnect trong\n30 giây?}

    RECONNECT_WAIT -->|Có| EVT_REJOIN[Attendance Service nhận\nParticipantRejoined event\nTiếp tục tích lũy — ghi timestamp RECONNECT]
    EVT_REJOIN --> TRACK

    RECONNECT_WAIT -->|Không — timeout| PERM_DISC[Ghi nhận khoảng vắng mặt\nKhông tính vào thời gian có mặt]
    PERM_DISC --> STILL_ATTEND{Student vào lại\ntrước khi kết thúc?}
    STILL_ATTEND -->|Có| EVT_REJOIN
    STILL_ATTEND -->|Không| CALC_PARTIAL[Tính tỷ lệ dựa trên\ncác khoảng đã kết nối\ntổng_khoảng_connected / duration × 100%]
    CALC_PARTIAL --> SAVE
```

**Công thức tính điểm danh:**
```
attendance_rate = (Σ connected_intervals) / meeting_duration × 100

Ví dụ:
  Meeting: 60 phút
  Khoảng 1: 0–20 phút (JOIN → DISCONNECT) = 20 phút
  Khoảng 2: 25–60 phút (RECONNECT → LEAVE) = 35 phút
  → attendance_rate = (20 + 35) / 60 × 100 = 91.7%
```

---

## BPMN-003: Quy trình chẩn đoán sự cố mạng

**Mô tả:** Từ khi metric vượt ngưỡng đến khi Admin nhận được kết quả chẩn đoán, bao gồm Rule Engine và fallback.

**UC liên quan:** UC-MON-001, UC-NDX-001  
**BRD tham chiếu:** 07_Giam_Sat_Thoi_Gian_Thuc.md, 10_Chan_Doan_Su_Co.md

```mermaid
flowchart TD
    START([Client gửi telemetry\nmỗi 5 giây]) --> COLLECT[Monitoring Service\ntiếp nhận metrics:\nPacket Loss, Latency, Jitter]
    COLLECT --> THRESHOLD{Metric vượt\nngưỡng cảnh báo?}
    THRESHOLD -->|Không| STORE[Lưu vào time-series DB\nCập nhật dashboard] --> START
    THRESHOLD -->|Có| ALERT_LEVEL{Mức độ cảnh báo?}

    ALERT_LEVEL -->|Warning| WARN_LOG[Ghi log Warning\nHiển thị trên dashboard\nkhông push notification]
    WARN_LOG --> STORE

    ALERT_LEVEL -->|Major hoặc Critical| RAISE_ALERT[publish AlertRaised event\n→ Message Broker]
    RAISE_ALERT --> DIAG_CONSUME[Diagnostics Service\nconsume AlertRaised]

    DIAG_CONSUME --> FETCH_DATA[Fetch toàn bộ telemetry\ncủa session từ DB]
    FETCH_DATA --> RULE1{Rule 01:\nHost Packet Loss > 5%\nVÀ > 50% users bị ảnh hưởng?}

    RULE1 -->|Có| DIAG_HOST[Kết luận: Host Issue\nConfidence: High\nSuggestion: Kiểm tra kết nối của Teacher]
    DIAG_HOST --> LOG_INCIDENT

    RULE1 -->|Không| RULE2{Rule 02:\nChỉ 1 user có\nPacket Loss > 5%?}
    RULE2 -->|Có| DIAG_PART[Kết luận: Participant Issue\nConfidence: High\nSuggestion: Kiểm tra kết nối của học viên đó]
    DIAG_PART --> LOG_INCIDENT

    RULE2 -->|Không| RULE3{Rule 03:\n> 30% phòng học\nalert đồng thời?}
    RULE3 -->|Có| DIAG_INFRA[Kết luận: Infrastructure Issue\nConfidence: High\nSuggestion: Kiểm tra SFU / mạng backbone]
    DIAG_INFRA --> LOG_INCIDENT

    RULE3 -->|Không| FALLBACK[Kết luận: Unidentified\nConfidence: Low\nTạo ManualInvestigation task]
    FALLBACK --> LOG_INCIDENT

    LOG_INCIDENT[Ghi incident_log\nvào DB:\ntype, severity, confidence, suggestion]
    LOG_INCIDENT --> SEVERITY{severity =\nMajor hoặc Critical?}

    SEVERITY -->|Có| PUSH_ADMIN[Gửi Push Notification\ncho Admin]
    PUSH_ADMIN --> ADMIN_VIEW
    SEVERITY -->|Không — Warning| DASHBOARD_ONLY[Cập nhật dashboard\nkhông push]
    DASHBOARD_ONLY --> END_MON([Chờ vòng telemetry tiếp theo])

    ADMIN_VIEW[Admin xem GET /diagnostics/sessionId\nNhận: type, severity, confidence, suggestion]
    ADMIN_VIEW --> ADMIN_ACT{Admin hành động?}
    ADMIN_ACT -->|Xác nhận & đóng| RESOLVE[Đánh dấu incident = Resolved] --> END_MON
    ADMIN_ACT -->|Điều tra thêm| MANUAL[Admin thao tác thủ công\nDrill-down chi tiết user metrics] --> RESOLVE
```
