/**
 * CHẨN ĐOÁN CHẤT LƯỢNG KẾT NỐI — Network Diagnostics
 *
 * Triển khai ngưỡng cảnh báo (BRD 7.7) và tập luật xác định nguyên nhân sự cố
 * (BRD 10.5: Host / Participant / Infrastructure). Toàn bộ logic thuần, không
 * phụ thuộc UI — dùng chung cho dashboard giám sát và (sau này) module báo cáo.
 */

import type { LiveParticipant, MockLiveClass } from './mockData';

// Ngưỡng cảnh báo theo BRD 7.7
export const THRESHOLDS = {
  latency: 300,    // ms
  packetLoss: 5,   // %
  jitter: 30,      // ms
};

// Ngưỡng "bị ảnh hưởng" (dưới mức cảnh báo cứng nhưng đã suy giảm rõ rệt)
const AFFECTED = {
  latency: 200,
  packetLoss: 2,
  jitter: 25,
};

export type MetricLevel = 'good' | 'warning' | 'critical';
export type MetricKey = 'latency' | 'packetLoss' | 'jitter';

/** Phân loại mức một chỉ số telemetry theo ngưỡng BRD. */
export function metricLevel(key: MetricKey, value: number): MetricLevel {
  const limit = THRESHOLDS[key];
  if (value > limit) return 'critical';
  if (value > limit * 0.66) return 'warning';
  return 'good';
}

/** Một người tham gia có đang gặp sự cố kết nối hay không. */
export function hasIssue(p: LiveParticipant): boolean {
  return (
    p.connState !== 'connected' ||
    p.latency > THRESHOLDS.latency ||
    p.packetLoss > THRESHOLDS.packetLoss ||
    p.jitter > THRESHOLDS.jitter
  );
}

/** Người tham gia bị "ảnh hưởng" (suy giảm rõ rệt dù chưa vượt ngưỡng cứng). */
export function isAffected(p: LiveParticipant): boolean {
  return (
    p.connState !== 'connected' ||
    p.latency > AFFECTED.latency ||
    p.packetLoss > AFFECTED.packetLoss ||
    p.jitter > AFFECTED.jitter
  );
}

export type DiagnosisType = 'healthy' | 'host' | 'participant' | 'infra';
export type Confidence = 'low' | 'medium' | 'high';

export interface Diagnosis {
  type: DiagnosisType;
  confidence: Confidence;
  title: string;
  detail: string;
}

/**
 * Chẩn đoán nguyên nhân sự cố trong PHẠM VI MỘT LỚP (BRD 10.5 Rule 01 & 02).
 */
export function diagnoseClass(cls: MockLiveClass): Diagnosis {
  const host = cls.participants.find(p => p.role === 'teacher');
  const students = cls.participants.filter(p => p.role !== 'teacher');
  const affectedStudents = students.filter(isAffected);
  const affectedRatio = students.length ? affectedStudents.length / students.length : 0;

  // Rule 01 — Host Connection Issue: host mất gói cao VÀ >50% học viên bị ảnh hưởng
  if (host && host.packetLoss > THRESHOLDS.packetLoss && affectedRatio > 0.5) {
    return {
      type: 'host',
      confidence: 'high',
      title: 'Sự cố phía Giáo viên (Host)',
      detail: `Giáo viên mất gói ${host.packetLoss}% và ${affectedStudents.length}/${students.length} học viên bị ảnh hưởng. Khuyến nghị giáo viên kiểm tra đường truyền / giảm chất lượng video.`,
    };
  }

  // Rule 02 — Participant Connection Issue: chỉ một nhóm nhỏ gặp sự cố, host bình thường
  const issueStudents = students.filter(hasIssue);
  if (issueStudents.length > 0 && (!host || !hasIssue(host)) && affectedRatio <= 0.5) {
    const names = issueStudents.map(s => s.name).join(', ');
    return {
      type: 'participant',
      confidence: 'high',
      title: 'Sự cố phía Học viên',
      detail: `${issueStudents.length} học viên gặp sự cố (${names}); các thành viên khác ổn định. Khuyến nghị học viên kiểm tra mạng / chuyển sang mạng dây.`,
    };
  }

  // Có suy giảm nhưng chưa đủ điều kiện kết luận chắc chắn
  if (affectedStudents.length > 0 || (host && hasIssue(host))) {
    return {
      type: 'participant',
      confidence: 'medium',
      title: 'Có dấu hiệu suy giảm chất lượng',
      detail: 'Một số chỉ số vượt ngưỡng theo dõi nhưng chưa đủ cơ sở kết luận nguyên nhân. Tiếp tục giám sát.',
    };
  }

  return {
    type: 'healthy',
    confidence: 'high',
    title: 'Kết nối ổn định',
    detail: 'Tất cả người tham gia có chất lượng kết nối trong ngưỡng cho phép.',
  };
}

/**
 * Chẩn đoán hạ tầng (BRD 10.5 Rule 03, hiệu chỉnh): nghi ngờ lỗi hạ tầng khi
 * ≥2 lớp đồng thời có sự cố phía Host — dấu hiệu suy giảm diện rộng.
 */
export function diagnoseInfra(classes: MockLiveClass[]): Diagnosis | null {
  const hostSideClasses = classes.filter(c => diagnoseClass(c).type === 'host');
  if (hostSideClasses.length >= 2) {
    return {
      type: 'infra',
      confidence: 'medium',
      title: 'Nghi ngờ sự cố hạ tầng hệ thống',
      detail: `${hostSideClasses.length} lớp đồng thời suy giảm phía Host — khuyến nghị quản trị viên kiểm tra Media Server và hạ tầng mạng trung tâm.`,
    };
  }
  return null;
}
