/**
 * THU THẬP THÔNG TIN THIẾT BỊ & MẠNG (client-side)
 *
 * Đọc từ trình duyệt tại thời điểm tham gia phòng (BRD 7.6). Đây là dữ liệu
 * KHÔNG có trong WebRTC stats nên phải lấy riêng rồi broadcast cho người khác.
 *
 * Lưu ý giới hạn của trình duyệt:
 *  - UA không phân biệt chắc chắn Desktop vs Laptop → gộp thành 'desktop'.
 *  - Network Information API (`navigator.connection.type`) chỉ Chrome/Android
 *    hỗ trợ rõ wifi/ethernet/cellular; nơi khác chỉ có `effectiveType` (4g/3g)
 *    nên loại mạng là *ước lượng*, cần đối chiếu thêm `transport.networkType`
 *    từ telemetry để chính xác hơn.
 */

import type { DeviceType, NetworkType } from './mockData';

export interface DeviceInfo {
  deviceType: DeviceType;
  os: string;
  browser: string;
  network: NetworkType;
  networkLabel: string;   // mô tả người đọc (kèm tốc độ ước lượng nếu có)
}

function detectDeviceType(ua: string): DeviceType {
  const s = ua.toLowerCase();
  // userAgentData chính xác hơn UA string nếu có (Chromium)
  const uaData = (navigator as any).userAgentData;
  if (uaData && typeof uaData.mobile === 'boolean') {
    if (uaData.mobile) return /ipad|tablet/.test(s) ? 'tablet' : 'mobile';
  }
  if (/ipad|tablet|playbook|silk/.test(s) || (/android/.test(s) && !/mobile/.test(s))) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) return 'mobile';
  return 'desktop';
}

function detectOS(ua: string): string {
  const s = ua.toLowerCase();
  if (/windows nt 10/.test(s)) return 'Windows';
  if (/windows/.test(s)) return 'Windows';
  if (/iphone|ipad|ipod/.test(s)) return 'iOS';
  if (/mac os x/.test(s)) return 'macOS';
  if (/android/.test(s)) return 'Android';
  if (/linux/.test(s)) return 'Linux';
  return 'Khác';
}

function detectBrowser(ua: string): string {
  const s = ua.toLowerCase();
  if (/edg\//.test(s)) return 'Edge';
  if (/opr\/|opera/.test(s)) return 'Opera';
  if (/chrome|crios/.test(s)) return 'Chrome';
  if (/firefox|fxios/.test(s)) return 'Firefox';
  if (/safari/.test(s)) return 'Safari';
  return 'Khác';
}

function detectNetwork(deviceType: DeviceType): { network: NetworkType; label: string } {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (conn?.type) {
    // Giá trị tin cậy khi có (Chrome/Android)
    switch (conn.type) {
      case 'wifi': return { network: 'wifi', label: 'Wi-Fi' };
      case 'ethernet': return { network: 'ethernet', label: 'Mạng dây' };
      case 'cellular': return { network: 'mobile', label: `Mạng di động${conn.effectiveType ? ` (${conn.effectiveType})` : ''}` };
      default: break;
    }
  }

  // Ước lượng khi trình duyệt không cung cấp type cụ thể
  const eff = conn?.effectiveType ? ` (${conn.effectiveType})` : '';
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    return { network: 'mobile', label: `Di động/Wi-Fi${eff}` };
  }
  return { network: 'wifi', label: `Wi-Fi/Dây${eff}` };
}

/** Thu thập thông tin thiết bị & mạng hiện tại của trình duyệt. */
export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent || '';
  const deviceType = detectDeviceType(ua);
  const { network, label } = detectNetwork(deviceType);
  return {
    deviceType,
    os: detectOS(ua),
    browser: detectBrowser(ua),
    network,
    networkLabel: label,
  };
}
