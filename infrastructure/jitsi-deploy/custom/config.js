/* eslint-disable no-unused-vars, no-var */
/**
 * config.js — EduMeet Self-Hosted Configuration
 * 
 * File này được mount vào Docker container thay cho config mặc định.
 * Thay YOUR_SERVER_IP bằng IP thật của server trước khi deploy.
 * 
 * Được tạo từ jitsi-meet/config.js template (source code clone sẵn).
 */

/* global __webpack_public_path__ */
/* eslint-disable no-unused-vars, no-var */

var subdir = '';
var subdomain = '';
var enableJaaS = false;

var config = {
    // =====================================================
    // Kết nối XMPP — trỏ về server nội bộ Docker
    // =====================================================
    hosts: {
        domain: 'meet.edumeet.local',
        muc: 'conference.meet.edumeet.local',
        focus: 'focus.meet.edumeet.local',
    },

    bosh: '/http-bind',
    websocket: '/xmpp-websocket',

    clientNode: 'http://jitsi.org/jitsimeet',

    // =====================================================
    // Cấu hình Audio/Video
    // =====================================================
    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,

    // Độ phân giải mặc định (720p là đủ cho lớp học online)
    resolution: 720,

    // Mọi người sau người thứ 10 bắt đầu muted
    startAudioMuted: 15,
    startVideoMuted: 15,

    // =====================================================
    // Cấu hình P2P (Peer-to-Peer)
    // Tắt P2P → mọi luồng đều qua JVB để giáo viên kiểm soát được
    // =====================================================
    p2p: {
        enabled: false,  // Tắt P2P — tất cả qua JVB server của mình
    },

    // =====================================================
    // Cấu hình kết nối Stats
    // Dựa vào BRD: ping < 100ms = excellent, > 300ms = critical
    // =====================================================
    channelLastN: -1,  // Không giới hạn số người xem video

    // =====================================================
    // Tắt các tính năng không cần cho môi trường học đường
    // =====================================================
    disableReactions: false,
    disablePolls: false,      // Bật tính năng Poll (hữu ích cho giáo viên)
    disableChat: false,       // Chat cần thiết

    // Tắt tích hợp lịch bên ngoài
    enableCalendarIntegration: false,

    // =====================================================
    // Bảo mật
    // =====================================================
    // Mọi phòng đều yêu cầu tên hiển thị
    requireDisplayName: true,

    // =====================================================
    // Giao diện
    // =====================================================
    // Mặc định ngôn ngữ tiếng Việt (vì đã có main-vi.json)
    defaultLanguage: 'vi',

    // Tắt trang welcome (người dùng đã vào từ EduMeet app)
    welcomePage: {
        disabled: false,
    },

    // Tắt trang prejoin (lobby) — EduMeet app đã có màn hình chờ riêng
    prejoinConfig: {
        enabled: false,
    },

    // =====================================================
    // Toolbar — Chỉ hiện các nút cần thiết cho lớp học
    // =====================================================
    toolbarButtons: [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',          // Chia sẻ màn hình
        'chat',             // Chat
        'raisehand',        // Giơ tay
        'participants-pane',// Danh sách học sinh
        'tileview',         // Chế độ xem lưới
        'filmstrip',
        'fullscreen',
        'hangup',           // Rời phòng
        'settings',
        // Không có: 'invite', 'livestreaming', 'recording', 'stats', 'shortcuts'
    ],

    // =====================================================
    // Kiểm tra sức khỏe JVB (Jicofo)
    // =====================================================
    jicofo: {
        conferenceRequestUrl: undefined,
    },

    // =====================================================
    // Logging — chỉ log lỗi trong production
    // =====================================================
    logging: {
        defaultLogLevel: 'error',
    },

    // =====================================================
    // Bridge channel — dùng WebSocket thay SCTP cho ổn định hơn
    // =====================================================
    bridgeChannel: {
        preferSctp: false,
    },

    // =====================================================
    // Cấu hình hiệu năng video
    // =====================================================
    videoQuality: {
        codecPreferenceOrder: ['VP9', 'VP8', 'H264'],
    },

    // =====================================================
    // Connection stats thresholds — theo BRD EduMeet
    // excellent: ping < 100ms, good: < 200ms, poor: < 300ms, critical: > 300ms
    // =====================================================

    // Tên người dùng mặc định khi chưa nhập
    defaultLocalDisplayName: 'Học viên',
    defaultRemoteDisplayName: 'Học viên',

    makeJsonParserHappy: 'even if last key had a trailing comma'
};
