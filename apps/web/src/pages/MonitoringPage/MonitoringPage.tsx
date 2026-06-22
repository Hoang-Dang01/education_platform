import React, { useState } from 'react';
import { useClass } from '../../context/ClassContext';
import {
  Radio, Users, Wifi, ShieldAlert, Eye, ArrowLeft, AlertTriangle, CheckCircle2,
  Monitor, Laptop, Tablet, Smartphone, Cable, Signal, ShieldCheck, Mic, MicOff, Video, VideoOff,
  Presentation, GraduationCap, Activity,
} from 'lucide-react';
import { mockLiveClasses } from '../../lib/mockData';
import type { MockLiveClass, LiveParticipant, ClassStatus, DeviceType, NetworkType } from '../../lib/mockData';
import { metricLevel, hasIssue, diagnoseClass, diagnoseInfra } from '../../lib/diagnostics';
import type { MetricKey, DiagnosisType } from '../../lib/diagnostics';
import { roleLabel } from '../../lib/roles';
import './MonitoringPage.css';

const STATUS_LABEL: Record<ClassStatus, string> = {
  scheduled: 'Đã lên lịch', in_progress: 'Đang diễn ra', completed: 'Đã kết thúc',
  interrupted: 'Gián đoạn', cancelled: 'Đã hủy',
};

const DEVICE: Record<DeviceType, { label: string; icon: React.ReactNode }> = {
  desktop: { label: 'PC', icon: <Monitor size={14} /> },
  laptop: { label: 'Laptop', icon: <Laptop size={14} /> },
  tablet: { label: 'Tablet', icon: <Tablet size={14} /> },
  mobile: { label: 'Mobile', icon: <Smartphone size={14} /> },
};

const NETWORK: Record<NetworkType, { label: string; icon: React.ReactNode }> = {
  ethernet: { label: 'Mạng dây', icon: <Cable size={14} /> },
  wifi: { label: 'Wi-Fi', icon: <Wifi size={14} /> },
  mobile: { label: 'Mạng di động', icon: <Signal size={14} /> },
  vpn: { label: 'VPN', icon: <ShieldCheck size={14} /> },
};

const DIAGNOSIS_STYLE: Record<DiagnosisType, string> = {
  healthy: 'diag-healthy', host: 'diag-host', participant: 'diag-participant', infra: 'diag-infra',
};

const metricClass = (key: MetricKey, value: number) => {
  const lvl = metricLevel(key, value);
  return lvl === 'critical' ? 'text-danger' : lvl === 'warning' ? 'text-warning' : 'text-success';
};

export const MonitoringPage: React.FC = () => {
  const { joinRoom, userName, role } = useClass();
  const [selected, setSelected] = useState<MockLiveClass | null>(null);
  const classes = mockLiveClasses;

  // ---- Tổng hợp toàn hệ thống (BRD 7.2) ----
  const allParticipants = classes.flatMap(c => c.participants);
  const agg = {
    liveClasses: classes.length,
    teachers: allParticipants.filter(p => p.role === 'teacher' && p.connState === 'connected').length,
    students: allParticipants.filter(p => p.role !== 'teacher' && p.connState === 'connected').length,
    connections: allParticipants.filter(p => p.connState === 'connected').length,
    usersWithIssues: allParticipants.filter(hasIssue).length,
    classesWithWarning: classes.filter(c => diagnoseClass(c).type !== 'healthy').length,
  };
  const infra = diagnoseInfra(classes);

  // ======================= CHI TIẾT MỘT LỚP =======================
  if (selected) {
    const diag = diagnoseClass(selected);
    return (
      <div className="page-container monitoring-page animate-fade-in">
        <button onClick={() => setSelected(null)} className="back-btn glass-panel">
          <ArrowLeft size={16} />
          <span>Quay lại tổng quan</span>
        </button>

        <div className="report-session-header glass-panel">
          <div>
            <span className={`status-pill status-${selected.status}`}>{STATUS_LABEL[selected.status]}</span>
            <h2>{selected.subject}</h2>
            <p className="monitor-room">Phòng: <code>{selected.room}</code> · {selected.teacher} · bắt đầu {selected.startedAt} ({selected.durationMins}')</p>
          </div>
          <button
            className="monitor-join-btn"
            onClick={() => joinRoom(selected.room, userName || 'Người giám sát', role)}
          >
            <Eye size={14} />
            <span>Vào giám sát</span>
          </button>
        </div>

        {/* Banner chẩn đoán (BRD 7.8 / 10.5) */}
        <div className={`diagnosis-banner glass-panel ${DIAGNOSIS_STYLE[diag.type]}`}>
          {diag.type === 'healthy' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <div>
            <h4>{diag.title} <span className="diag-confidence">· độ tin cậy: {diag.confidence}</span></h4>
            <p>{diag.detail}</p>
          </div>
        </div>

        {/* Bảng telemetry từng người (BRD 7.4 – 7.6) */}
        <section className="reports-section glass-panel">
          <div className="reports-section-header">
            <h3>Giám sát người tham gia ({selected.participants.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Người tham gia</th>
                  <th>Trạng thái</th>
                  <th>Cam/Mic</th>
                  <th>Latency</th>
                  <th>Mất gói</th>
                  <th>Jitter</th>
                  <th>Thiết bị</th>
                  <th>Mạng</th>
                  <th>Tham gia</th>
                  <th>Mất KN</th>
                </tr>
              </thead>
              <tbody>
                {selected.participants.map(p => (
                  <ParticipantRow key={p.id} p={p} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // ======================= TỔNG QUAN HỆ THỐNG =======================
  return (
    <div className="page-container monitoring-page animate-fade-in">
      <section className="welcome-banner glass-panel">
        <div className="banner-left">
          <h2>Giám sát thời gian thực</h2>
          <p>Theo dõi toàn bộ phiên học đang diễn ra trên hệ thống. Bấm vào một lớp để xem chi tiết telemetry từng người.</p>
        </div>
        <div className="banner-badge live">
          <Radio size={16} className="animate-pulse-light" />
          <span>Trực tiếp</span>
        </div>
      </section>

      {/* KPI tổng (BRD 7.2) */}
      <section className="kpi-grid monitor-kpi-grid">
        <MiniKpi icon={<Radio size={18} />} color="green" value={agg.liveClasses} label="Lớp đang diễn ra" />
        <MiniKpi icon={<Presentation size={18} />} color="indigo" value={agg.teachers} label="Giáo viên online" />
        <MiniKpi icon={<GraduationCap size={18} />} color="cyan" value={agg.students} label="Học viên online" />
        <MiniKpi icon={<Activity size={18} />} color="indigo" value={agg.connections} label="Kết nối hoạt động" />
        <MiniKpi icon={<ShieldAlert size={18} />} color="red" value={agg.usersWithIssues} label="Người gặp sự cố" />
        <MiniKpi icon={<AlertTriangle size={18} />} color="amber" value={agg.classesWithWarning} label="Lớp có cảnh báo" />
      </section>

      {/* Cảnh báo hạ tầng (BRD 10.5 Rule 03) */}
      {infra && (
        <div className={`diagnosis-banner glass-panel ${DIAGNOSIS_STYLE.infra}`}>
          <AlertTriangle size={20} />
          <div>
            <h4>{infra.title} <span className="diag-confidence">· độ tin cậy: {infra.confidence}</span></h4>
            <p>{infra.detail}</p>
          </div>
        </div>
      )}

      <section className="monitor-grid">
        {classes.map(c => {
          const diag = diagnoseClass(c);
          const issues = c.participants.filter(hasIssue).length;
          return (
            <div key={c.id} className="monitor-card glass-panel" onClick={() => setSelected(c)} role="button">
              <div className="monitor-card-head">
                <span className={`live-dot ${c.status === 'interrupted' ? 'warn' : ''}`}></span>
                <h3>{c.subject}</h3>
                <span className={`status-pill status-${c.status}`}>{STATUS_LABEL[c.status]}</span>
              </div>

              <p className="monitor-room">Phòng: <code>{c.room}</code> · {c.teacher}</p>

              <div className="monitor-stats">
                <div className="monitor-stat">
                  <Users size={14} />
                  <span>{c.participantCount}/{c.capacity}</span>
                  <small>Sĩ số</small>
                </div>
                <div className="monitor-stat">
                  {issues > 0 ? <ShieldAlert size={14} className="text-danger" /> : <CheckCircle2 size={14} className="text-success" />}
                  <span className={issues > 0 ? 'text-danger' : 'text-success'}>{issues}</span>
                  <small>Gặp sự cố</small>
                </div>
              </div>

              <div className={`monitor-diag-line ${DIAGNOSIS_STYLE[diag.type]}`}>
                {diag.type === 'healthy' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                <span>{diag.title}</span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

// --- Hàng telemetry của một người tham gia ---
const ParticipantRow: React.FC<{ p: LiveParticipant }> = ({ p }) => (
  <tr className={hasIssue(p) ? 'row-issue' : ''}>
    <td className="font-bold">
      {p.name}
      <span className={`role-cell ${p.role === 'teacher' ? 'teacher' : 'student'}`} style={{ marginLeft: 8 }}>
        {roleLabel(p.role)}
      </span>
    </td>
    <td>
      <span className={`conn-pill conn-${p.connState}`}>
        {p.connState === 'connected' ? 'Kết nối' : p.connState === 'reconnecting' ? 'Đang kết nối lại' : 'Mất kết nối'}
      </span>
    </td>
    <td>
      <span className="cam-mic">
        {p.cameraOn ? <Video size={14} className="text-success" /> : <VideoOff size={14} className="text-muted" />}
        {p.micOn ? <Mic size={14} className="text-success" /> : <MicOff size={14} className="text-muted" />}
      </span>
    </td>
    <td className={metricClass('latency', p.latency)}>{p.latency} ms</td>
    <td className={metricClass('packetLoss', p.packetLoss)}>{p.packetLoss}%</td>
    <td className={metricClass('jitter', p.jitter)}>{p.jitter} ms</td>
    <td><span className="device-cell">{DEVICE[p.device].icon} {DEVICE[p.device].label}</span></td>
    <td><span className="device-cell">{NETWORK[p.network].icon} {NETWORK[p.network].label}</span></td>
    <td>{p.joinedMinsAgo}'</td>
    <td className={p.disconnectCount > 0 ? 'text-warning' : ''}>{p.disconnectCount}</td>
  </tr>
);

// --- Thẻ KPI nhỏ ---
const MiniKpi: React.FC<{ icon: React.ReactNode; color: string; value: number; label: string }> = ({ icon, color, value, label }) => (
  <div className={`kpi-card glass-panel accent-${color} monitor-mini-kpi`}>
    <div className="kpi-header">
      <span className="kpi-title">{label}</span>
      <div className="kpi-icon-wrapper">{icon}</div>
    </div>
    <div className="kpi-body"><h3>{value}</h3></div>
  </div>
);
