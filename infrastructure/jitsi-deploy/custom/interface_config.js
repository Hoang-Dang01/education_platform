/* eslint-disable no-unused-vars, no-var, max-len */
/* eslint sort-keys: ["error", "asc", {"caseSensitive": false}] */

/**
 * interface_config.js — EduMeet Customized
 * Tùy chỉnh thương hiệu và giao diện cho nền tảng EduMeet
 */

var interfaceConfig = {
    // === EduMeet Branding ===
    APP_NAME: 'EduMeet',
    PROVIDER_NAME: 'EduMeet Platform',

    // Tắt watermark Jitsi, bật watermark riêng
    SHOW_JITSI_WATERMARK: false,
    SHOW_BRAND_WATERMARK: false,   // Đặt true nếu có logo riêng ở BRAND_WATERMARK_LINK
    BRAND_WATERMARK_LINK: '',

    // Tắt quảng cáo app di động Jitsi (chúng ta có app riêng)
    MOBILE_APP_PROMO: false,

    // Tắt trang quảng cáo khi kết thúc cuộc họp
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
    SHOW_POWERED_BY: false,

    // === Audio / Video ===
    AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
    AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',

    // Tự động ghim người chia sẻ màn hình
    AUTO_PIN_LATEST_SCREEN_SHARE: 'remote-only',

    // Nền tối mặc định (phù hợp dark theme EduMeet)
    DEFAULT_BACKGROUND: '#0a0f1a',

    // === Trang chào mừng ===
    DEFAULT_WELCOME_PAGE_LOGO_URL: 'images/watermark.svg',
    DISPLAY_WELCOME_FOOTER: false,
    DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
    DISPLAY_WELCOME_PAGE_CONTENT: false,
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,

    // Không tạo tên phòng ngẫu nhiên (người dùng nhập tên lớp)
    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,

    // === Hành vi phòng họp ===
    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
    DISABLE_PRESENCE_STATUS: false,
    DISABLE_TRANSCRIPTION_SUBTITLES: true,   // Tắt phụ đề (không cần cho lớp học)
    DISABLE_VIDEO_BACKGROUND: false,

    // Tắt tính năng gọi điện thoại (không cần cho trường học)
    ENABLE_DIAL_OUT: false,

    // Filmstrip (dải video thu nhỏ ở dưới)
    FILM_STRIP_MAX_HEIGHT: 120,
    VERTICAL_FILMSTRIP: true,

    // Ẩn nút mời thêm người khi đang học một mình
    HIDE_INVITE_MORE_HEADER: true,

    // === Ngôn ngữ ===
    LANG_DETECTION: true,   // Tự động phát hiện ngôn ngữ trình duyệt

    // === Tỷ lệ video ===
    LOCAL_THUMBNAIL_RATIO: 16 / 9,
    REMOTE_THUMBNAIL_RATIO: 16 / 9,
    MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
    VIDEO_LAYOUT_FIT: 'both',
    VIDEO_QUALITY_LABEL_DISABLED: false,

    // === Tính năng ===
    RECENT_LIST_ENABLED: false,  // Tắt danh sách phòng gần đây (bảo mật)

    // Cài đặt chỉ hiển thị mục cần thiết cho giáo viên/học sinh
    SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'sounds', 'more'],

    // Ẩn tính năng chia sẻ email/dial-in (không dùng trong trường học)
    // SHARING_FEATURES: ['url'],  // Chỉ cho phép chia sẻ qua URL

    // === Trình duyệt được hỗ trợ ===
    OPTIMAL_BROWSERS: ['chrome', 'chromium', 'firefox', 'electron', 'safari', 'webkit'],
    UNSUPPORTED_BROWSERS: [],

    // Màu sắc indicators
    POLICY_LOGO: null,

    // === Chrome Extension ===
    SHOW_CHROME_EXTENSION_BANNER: false,

    // === Hỗ trợ ===
    SUPPORT_URL: 'https://edumeet.vn/support',  // Thay bằng URL hỗ trợ của bạn

    // ==========================================
    // Không xóa dòng này — cần thiết cho JSON parser
    makeJsonParserHappy: 'even if last key had a trailing comma'
};

/* eslint-enable no-unused-vars, no-var, max-len */
