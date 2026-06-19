import React, { useState } from 'react';
import { Download, CheckCircle2, Clock } from 'lucide-react';
import { mockReportSessions } from '../lib/mockData';
import type { MockReportSession } from '../lib/mockData';
import './Pages.css';

export const ReportsPage: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<MockReportSession | null>(null);
  const reportSessions = mockReportSessions;


  const getQualityText = (quality: MockReportSession['avgConnectionQuality']) => {
    switch (quality) {
      case 'excellent': return 'Xuất sắc';
      case 'good': return 'Khá';
      case 'poor': return 'Kém';
      case 'critical': return 'Nghiêm trọng';
    }
  };

  const getTelemetryStatus = (ping: number, loss: number, jitter: number) => {
    // Adheres to 4-level telemetry specs from BRD
    if (loss < 2 && ping < 150 && jitter < 15) {
      return { label: 'Excellent', color: 'text-success' };
    }
    if (loss <= 5 && ping <= 300 && jitter <= 30) {
      return { label: 'Poor', color: 'text-warning' };
    }
    if (loss > 5 || ping > 300 || jitter > 30) {
      return { label: 'Critical', color: 'text-danger' };
    }
    return { label: 'Good', color: 'text-primary' };
  };

  if (selectedSession) {
    return (
      <div className="page-container session-report-page animate-fade-in">
        <button onClick={() => setSelectedSession(null)} className="back-btn glass-panel">
          <span>Quay lại</span>
        </button>

        <div className="report-session-header glass-panel">
          <div>
            <span className="date-tag">{selectedSession.date}</span>
            <h2>Báo cáo Lớp học: {selectedSession.roomName}</h2>
          </div>
          <div className="session-summary-pills">
            <div className="summary-pill">
              <CheckCircle2 size={14} className="text-success" />
              <span>Chuyên cần: {selectedSession.presentStudents}/{selectedSession.totalStudents}</span>
            </div>
            <div className="summary-pill">
              <Clock size={14} className="text-primary" />
              <span>Thời gian TB: {selectedSession.avgDurationMins} phút</span>
            </div>
          </div>
        </div>

        <section className="reports-section glass-panel">
          <div className="reports-section-header">
            <h3>Chi tiết Chuyên cần & Telemetry Mạng</h3>
            <button className="export-btn-full">
              <Download size={14} />
              <span>Tải Báo Cáo XLS</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Vai trò</th>
                  <th>Thời lượng học</th>
                  <th>Tỷ lệ</th>
                  <th>Ping (ms)</th>
                  <th>Jitter (ms)</th>
                  <th>Mất gói (%)</th>
                  <th>Chất lượng</th>
                </tr>
              </thead>
              <tbody>
                {selectedSession.details.map((d, idx) => {
                  const telStatus = getTelemetryStatus(d.telemetry.ping, d.telemetry.loss, d.telemetry.jitter);
                  return (
                    <tr key={idx}>
                      <td className="font-bold">{d.name}</td>
                      <td>
                        <span className={`role-cell ${d.role === 'Giáo viên' ? 'teacher' : 'student'}`}>
                          {d.role}
                        </span>
                      </td>
                      <td>{d.presentTimeMins} phút</td>
                      <td>
                        <span className={`pct-badge ${d.pct >= 90 ? 'success' : d.pct >= 80 ? 'warning' : 'danger'}`}>
                          {d.pct}%
                        </span>
                      </td>
                      <td>{d.telemetry.ping} ms</td>
                      <td>{d.telemetry.jitter} ms</td>
                      <td>{d.telemetry.loss}%</td>
                      <td>
                        <span className={`quality-badge-table ${telStatus.color}`}>
                          {telStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container reports-page animate-fade-in">
      <div className="reports-list">
        {reportSessions.map(session => (
          <div
            key={session.id}
            className="session-report-card glass-panel"
            onClick={() => setSelectedSession(session)}
          >
            <div className="session-card-left">
              <span className="session-date-tag">{session.date}</span>
              <h3>Lớp: {session.roomName}</h3>
              <p>Mạng TB: <strong className="text-success">{getQualityText(session.avgConnectionQuality)}</strong></p>
            </div>
            
            <div className="session-card-right">
              <div className="stat-box">
                <span className="stat-num">{session.presentStudents}/{session.totalStudents}</span>
                <span className="stat-label">Sĩ số</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">{session.avgDurationMins}m</span>
                <span className="stat-label">Thời lượng TB</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
