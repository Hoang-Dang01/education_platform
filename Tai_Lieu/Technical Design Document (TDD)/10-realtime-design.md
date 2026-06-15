10.1 WebRTC Design
1. Purpose
Tài liệu này mô tả kiến trúc truyền thông thời gian thực của hệ thống sử dụng WebRTC.
Mục tiêu:
Hỗ trợ lớp học trực tuyến quy mô lớn.
Giảm độ trễ truyền thông.
Hỗ trợ Audio, Video và Screen Sharing.
Hỗ trợ Recording.
Hỗ trợ Metrics và Analytics.

2. Realtime Requirements
Functional Requirements
Audio Communication
Video Communication
Screen Sharing
Recording
Chat
Raise Hand
Breakout Room

Non-Functional Requirements
Concurrent Users
10,000+

Participants per Meeting
300+

Latency
< 300 ms

Availability
99.9%


3. Architecture Decision
Selected Topology
SFU


Alternatives Evaluated
Mesh
❌ O(n²)
❌ Không phù hợp >10 users.

MCU
❌ CPU rất cao.
❌ Chi phí lớn.

SFU
✔ Chi phí thấp.
✔ Độ trễ thấp.
✔ Hỗ trợ mở rộng.
✔ Phù hợp lớp học trực tuyến.

4. Realtime Architecture
Client
    ↓
Signaling Server
    ↓
WebRTC SFU
    ↓
Media Streams


5. Components
Web Client
Responsibilities:
Capture Media
WebRTC Peer Connection
Collect Metrics

Signaling Server
Responsibilities:
SDP Exchange
ICE Exchange
Authentication
Presence Synchronization

WebRTC SFU
Responsibilities:
Forward Media
Manage Participants
Recording Integration
Stream Subscription

TURN Server
Responsibilities:
NAT Traversal
Relay Media

STUN Server
Responsibilities:
Public Address Discovery

6. Media Flow
Publisher
      ↓
WebRTC SFU
      ↓
Subscribers


7. Connection Flow
Join Meeting
      ↓
Authenticate
      ↓
Signaling
      ↓
ICE Gathering
      ↓
DTLS Handshake
      ↓
Media Connected


8. Signaling Flow
Client
      ↓
Offer
      ↓
Signaling Server
      ↓
SFU
      ↓
Answer
      ↓
Client


9. ICE Flow
Host Candidate
      ↓
Server Reflexive Candidate
      ↓
Relay Candidate

Priority:
Host
↓
STUN
↓
TURN


10. Authentication
Authentication:
JWT

Authorization:
Meeting Membership Validation

Token:
Short-Lived

TTL:
5 Minutes


11. Media Types
Audio
Codec:
Opus


Video
Codec:
VP8
H264


Screen Sharing
Codec:
VP8
H264


12. Bandwidth Strategy
Audio
32-64 kbps


Video
300 kbps - 2 Mbps


Screen Sharing
500 kbps - 3 Mbps


13. Adaptive Quality
Collected Metrics:
RTT
Latency
Packet Loss
Jitter
FPS
Bitrate

Actions:
Reduce Resolution
Reduce Bitrate
Disable Video
Audio Only Mode


14. Simulcast
Profiles:
Low
Medium
High

Example:
180p
360p
720p


15. Reconnection Strategy
Connection Lost
      ↓
ICE Restart
      ↓
Rejoin
      ↓
Reuse Participant Session

Maximum Retry:
5 Attempts


16. Recording Integration
MeetingStarted
      ↓
Recording Service
      ↓
SFU Subscription
      ↓
Media Recording


17. Analytics Integration
Collected Every:
5 Seconds

Metrics:
Latency
RTT
Packet Loss
Jitter
FPS
Bitrate
Published:
EVT-040 MetricCollected


18. Failure Handling
SFU Unavailable
Action:
Reconnect


TURN Unavailable
Action:
Fallback Candidate


Signaling Lost
Action:
Reconnect WebSocket


19. Scaling Strategy
Client
      ↓
Load Balancer
      ↓
Signaling Cluster
      ↓
SFU Cluster


Horizontal Scaling
Signaling Server
SFU Nodes
TURN Servers

20. Capacity Planning
Single SFU Node
100-300 Participants


Cluster
10,000+ Users


21. Security
Protocols:
DTLS
SRTP
TLS

Encryption:
End-to-End Media Encryption Supported


22. Monitoring
Metrics:
Active Meetings
Active Participants
Packet Loss
CPU
Memory
Bandwidth
Reconnect Rate

23. Traceability
REQ-018 Join Meeting
      ↓
API-020 Join Meeting
      ↓
SRV-005 Meeting Service
      ↓
WebRTC Design
      ↓
TEST-040 Realtime Connectivity Test


24. Technology Decisions
Signaling
SignalR


Media Server
SFU


NAT Traversal
STUN + TURN


Recording
Server-Side Recording



10.2 SignalR Design
1. Purpose
Tài liệu này mô tả kiến trúc Realtime Messaging của hệ thống sử dụng SignalR.
Mục tiêu:
Hỗ trợ Signaling cho WebRTC.
Hỗ trợ Chat thời gian thực.
Đồng bộ trạng thái cuộc họp.
Đồng bộ Presence.
Hỗ trợ Notification thời gian thực.

2. Responsibilities
SignalR chịu trách nhiệm:
Signaling
Chat
Presence
Raise Hand
Meeting State
Participant State
Realtime Notification

SignalR không chịu trách nhiệm:
Audio Streaming
Video Streaming
Screen Media Transport


3. Architecture
Client
   ↓
Load Balancer
   ↓
SignalR Cluster
   ↓
Redis Backplane
   ↓
Application Services


4. Components
Client
Responsibilities:
WebSocket Connection
Receive Events
Send Commands

SignalR Hub
Responsibilities:
Connection Management
Group Management
Message Routing

Redis Backplane
Responsibilities:
Multi-node Synchronization
Pub/Sub
Scale-Out Support

Meeting Service
Responsibilities:
Meeting State
Participant State

5. Hub Design
MeetingHub
Responsibilities:
JoinMeeting
LeaveMeeting
ParticipantState
MeetingState


ChatHub
Responsibilities:
SendMessage
ReceiveMessage
Typing
MessageHistory


NotificationHub
Responsibilities:
SystemNotification
Alert
Announcement


6. Connection Lifecycle
Connect
    ↓
Authenticate
    ↓
Join Groups
    ↓
Realtime Communication
    ↓
Disconnect


7. Authentication
Authentication:
JWT

Transport:
WebSocket

Token Flow:
Client
    ↓
JWT
    ↓
SignalR Hub
    ↓
ClaimsPrincipal


8. Connection Flow
STEP-001
Client:
Connect MeetingHub


STEP-002
SignalR:
Validate:
JWT
Meeting Membership
User Status

STEP-003
Create:
Connection Context


STEP-004
Join:
meeting:{meetingId}
user:{userId}


STEP-005
Broadcast:
ParticipantConnected


9. Group Design
Meeting Group
meeting:{meetingId}


User Group
user:{userId}


Class Group
class:{classId}


Admin Group
administrators


10. Signaling Messages
Offer
{
  "type": "offer",
  "sdp": "..."
}


Answer
{
  "type": "answer",
  "sdp": "..."
}


ICE Candidate
{
  "type": "candidate",
  "candidate": {}
}


11. Chat Messages
SendMessage
{
  "meetingId": "uuid",
  "message": "Hello"
}


ReceiveMessage
{
  "messageId": "uuid",
  "userId": "uuid",
  "message": "Hello",
  "createdAt": "timestamp"
}


12. Raise Hand
Command:
{
  "meetingId": "uuid",
  "raised": true
}

Broadcast:
{
  "userId": "uuid",
  "raised": true
}


13. Presence Synchronization
Events:
ParticipantConnected
ParticipantDisconnected
ParticipantReconnected


14. Meeting State Events
MeetingStarted
MeetingEnded
ScreenShareStarted
ScreenShareStopped
RecordingStarted
RecordingStopped


15. Notification Events
Announcement
Alert
AttendanceCompleted
RecordingReady


16. Reconnection Strategy
Disconnected
      ↓
Retry
      ↓
Reconnect
      ↓
Rejoin Groups
      ↓
Synchronize State


Retry Schedule
0 sec
2 sec
10 sec
30 sec


17. Message Ordering
Ordering được đảm bảo:
Per Connection
Per Group

Không đảm bảo:
Cross Group
Cross Service


18. Reliability
Delivery:
At Least Once


Idempotency:
messageId


19. Scaling Strategy
Load Balancer
      ↓
SignalR Node 1
SignalR Node 2
SignalR Node 3
      ↓
Redis Backplane


20. Performance Requirements
Connection Establishment:
< 500 ms


Broadcast:
< 100 ms


Presence Update:
< 1 second


21. Failure Scenarios
Redis Unavailable
Action:
Degraded Mode


SignalR Node Failure
Action:
Reconnect


Connection Lost
Action:
Automatic Retry


22. Monitoring
Metrics:
Active Connections
Messages Per Second
Broadcast Latency
Reconnect Rate
Failed Connections
Logs:
Connection Created
Connection Closed
Group Joined
Message Broadcast
Tracing:
Client
     ↓
SignalR
     ↓
Meeting Service


23. Security
Authentication:
JWT

Authorization:
Meeting Membership
Role Validation

Transport:
TLS

Rate Limiting:
Messages Per Minute


24. Traceability
REQ-018 Join Meeting
      ↓
API-020 Join Meeting
      ↓
SRV-005 Meeting Service
      ↓
SignalR Design
      ↓
TEST-045 Realtime Messaging Test



10.3 Presence Design
1. Purpose
Tài liệu này mô tả kiến trúc quản lý trạng thái hiện diện (Presence) của người dùng trong hệ thống.
Mục tiêu:
Theo dõi trạng thái Online/Offline.
Đồng bộ Participant List.
Hỗ trợ Reconnection.
Hỗ trợ Multi-Device.
Hỗ trợ Attendance và Analytics.

2. Definition
Presence là trạng thái thời gian thực của một người dùng trong hệ thống.
Ví dụ:
Online
Offline
Connecting
Disconnected
Reconnecting
Away


3. Presence Architecture
Client
   ↓
SignalR
   ↓
Presence Service
   ↓
Redis
   ↓
Meeting Service


4. Components
Client
Responsibilities:
Connection State
Heartbeat
Reconnect

SignalR Hub
Responsibilities:
Connection Tracking
Presence Broadcast

Presence Service
Responsibilities:
State Management
Presence Synchronization
Connection Aggregation

Redis
Responsibilities:
Distributed State
Pub/Sub
Scale-Out

5. Presence States
User Presence
ONLINE
OFFLINE
AWAY
BUSY


Meeting Presence
CONNECTING
CONNECTED
DISCONNECTED
RECONNECTING
LEFT


Media Presence
MIC_ON
MIC_OFF
CAMERA_ON
CAMERA_OFF
SCREEN_SHARING


6. Presence Entity
ENT-023 Presence
Attributes:
presenceId
userId
meetingId
connectionId
deviceId
status
lastSeen
createdAt
updatedAt


7. Connection Model
User
 └── Device
      └── Connection

Ví dụ:
User
 ├── Laptop
 ├── Mobile
 └── Tablet


8. Multi-Connection Support
Một User có thể có:
1..N Connections

Ví dụ:
Browser Tab 1
Browser Tab 2
Mobile App

User chỉ được xem là:
OFFLINE

khi tất cả connections đều đóng.

9. Presence Flow
Connect
Client
      ↓
SignalR
      ↓
Presence Service
      ↓
Redis
      ↓
Broadcast


Disconnect
Client Disconnected
      ↓
Grace Period
      ↓
Presence Update


Reconnect
Reconnect
      ↓
Reuse Presence
      ↓
Broadcast


10. Heartbeat
Interval:
15 seconds

Timeout:
45 seconds


11. Presence Events
Published:
ParticipantConnected
ParticipantDisconnected
ParticipantReconnected
PresenceUpdated


Consumed:
MeetingStarted
MeetingEnded
ParticipantJoined
ParticipantLeft


12. Presence Cache Model
Redis Keys:
presence:user:{userId}
presence:meeting:{meetingId}
connection:{connectionId}


Example:
presence:user:1001
presence:meeting:2001
connection:abc123


13. Meeting Participant List
Meeting
 └── Participants
      ├── Online
      ├── Offline
      ├── Reconnecting
      └── Left


14. Raise Hand State
User
 └── raisedHand

State:
TRUE
FALSE

Broadcast:
RaiseHandUpdated


15. Device State
Tracked:
cameraEnabled
microphoneEnabled
screenSharing
networkType
deviceType


16. Failure Handling
Browser Closed
Heartbeat Timeout
      ↓
Offline


Network Lost
Disconnected
      ↓
Grace Period
      ↓
Reconnecting


SignalR Node Failure
Reconnect
      ↓
Restore Presence


17. Grace Period Strategy
Grace Period:
30 seconds

Trong khoảng thời gian này:
Không đánh dấu Offline.
Không kết thúc Attendance.


18. Presence and Attendance Integration
Connected
      ↓
Attendance Started

Disconnected
      ↓
Grace Period

Offline
      ↓
Attendance Updated


19. Presence and Analytics Integration
Collected Metrics:
Online Users
Concurrent Users
Reconnect Rate
Session Duration
Published:
EVT-040 MetricCollected


20. Scaling Strategy
SignalR Node 1
SignalR Node 2
SignalR Node 3
        ↓
Redis Backplane
        ↓
Presence Cache


21. Performance Requirements
Presence Update:
< 100 ms


Participant List Refresh:
< 1 second


Heartbeat Processing:
< 50 ms


22. Monitoring
Metrics:
Active Connections
Active Users
Presence Updates/sec
Reconnect Rate
Heartbeat Timeout Count
Logs:
User Connected
User Disconnected
User Reconnected
Presence Updated
Tracing:
Client
     ↓
SignalR
     ↓
Presence Service
     ↓
Redis


23. Security
Authorization:
Meeting Membership


Privacy:
Only Meeting Participants
can view Presence.


Rate Limiting:
Heartbeat Protection


24. Traceability
REQ-019 Presence Management
      ↓
UC-030 Presence Flow
      ↓
SRV-005 Meeting Service
      ↓
Presence Design
      ↓
TEST-050 Presence Test


25. State Machine
CONNECTING
      ↓
CONNECTED
      ↓
DISCONNECTED
      ↓
RECONNECTING
      ↓
CONNECTED

or

DISCONNECTED
      ↓
OFFLINE



