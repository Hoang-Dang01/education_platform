import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Clock, ArrowLeft, Search, Calendar, Filter, Mail, Printer, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { mockReportSessions } from '../../lib/mockData';
import { getSessionReports } from '../../lib/localDb';
import type { SessionReport } from '../../lib/localDb';
import './ReportsPage.css';

export const ReportsPage: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionReport | null>(null);
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'pass' | 'fail'>('all');

  // Email Scheduler States
  const [isSchedOpen, setIsSchedOpen] = useState(false);
  const [schedFreq, setSchedFreq] = useState('weekly-friday');
  const [schedTime, setSchedTime] = useState('17:00');
  const [schedEmail, setSchedEmail] = useState('admin@edumeet.com');
  const [schedSaved, setSchedSaved] = useState(false);

  useEffect(() => {
    setLoadingHistory(true);
    
    // Fetch real history sessions
    api.getHistorySessions()
      .then(sessions => {
        const mappedReal: SessionReport[] = sessions.map(s => {
          const dateStr = s.startTime 
            ? new Date(s.startTime).toLocaleDateString('vi-VN') 
            : new Date(s.createdAt).toLocaleDateString('vi-VN');
          return {
            id: s.id,
            roomName: `${s.class?.course?.name || ''} - ${s.class?.name || ''}`,
            date: dateStr,
            presentStudents: 0,
            totalStudents: s.class?.enrollments?.length || 0,
            avgDurationMins: s.endTime && s.startTime 
              ? Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000) 
              : 0,
            avgConnectionQuality: 'good',
            details: []
          };
        });

        const local = getSessionReports();
        const mockReportsMapped: SessionReport[] = mockReportSessions.map((m: any) => ({
          id: m.id,
          roomName: m.roomName,
          date: m.date,
          presentStudents: m.presentStudents,
          totalStudents: m.totalStudents,
          avgDurationMins: m.avgDurationMins,
          avgConnectionQuality: m.avgConnectionQuality,
          details: m.details.map((d: any) => ({
            name: d.name,
            role: d.role,
            presentTimeMins: d.presentTimeMins,
            totalTimeMins: d.totalTimeMins,
            pct: d.pct,
            telemetry: d.telemetry
          }))
        }));

        setReports([...mappedReal, ...local, ...mockReportsMapped]);
      })
      .catch(err => {
        console.error('Failed to fetch history sessions:', err);
        const local = getSessionReports();
        const mockReportsMapped: SessionReport[] = mockReportSessions.map((m: any) => ({
          id: m.id,
          roomName: m.roomName,
          date: m.date,
          presentStudents: m.presentStudents,
          totalStudents: m.totalStudents,
          avgDurationMins: m.avgDurationMins,
          avgConnectionQuality: m.avgConnectionQuality,
          details: m.details.map((d: any) => ({
            name: d.name,
            role: d.role,
            presentTimeMins: d.presentTimeMins,
            totalTimeMins: d.totalTimeMins,
            pct: d.pct,
            telemetry: d.telemetry
          }))
        }));
        setReports([...local, ...mockReportsMapped]);
      })
      .finally(() => {
        setLoadingHistory(false);
      });

    // Load saved scheduler config
    const savedConfig = localStorage.getItem('edumeet_report_schedule_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setSchedFreq(parsed.freq || 'weekly-friday');
        setSchedTime(parsed.time || '17:00');
        setSchedEmail(parsed.email || 'admin@edumeet.com');
      } catch (e) {
        console.error('Error loading schedule config:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setSelectedSession(null);
      return;
    }
    
    // Check if selectedSessionId is from mock data (e.g., starting with "r", "lc" or "local")
    if (selectedSessionId.length !== 36) {
      const found = reports.find(r => r.id === selectedSessionId);
      if (found) {
        setSelectedSession(found);
      }
      return;
    }

    setLoadingReport(true);
    api.getSessionReport(selectedSessionId)
      .then(s => {
        const dateStr = s.startTime 
          ? new Date(s.startTime).toLocaleDateString('vi-VN') 
          : new Date(s.createdAt).toLocaleDateString('vi-VN');
        const present = s.attendances?.filter((a: any) => a.user?.role === 'student' && a.presentTimeMins > 0).length || 0;
        const total = s.class?.enrollments?.length || s.attendances?.filter((a: any) => a.user?.role === 'student').length || 0;
        
        let totalPing = 0, totalLoss = 0, totalJitter = 0, count = 0;
        const details = (s.attendances || []).map((a: any) => {
          totalPing += a.avgPing || 0;
          totalLoss += a.avgLoss || 0;
          totalJitter += a.avgJitter || 0;
          count++;
          return {
            name: a.user?.name || '',
            role: a.user?.role === 'teacher' ? 'Giáo viên' : 'Học viên',
            presentTimeMins: a.presentTimeMins,
            totalTimeMins: a.totalTimeMins || 90,
            pct: Math.round(a.pct),
            telemetry: {
              ping: Math.round(a.avgPing),
              jitter: Math.round(a.avgJitter),
              loss: Math.round(a.avgLoss * 10) / 10
            }
          };
        });

        const avgPing = count > 0 ? totalPing / count : 0;
        const avgLoss = count > 0 ? totalLoss / count : 0;
        const avgJitter = count > 0 ? totalJitter / count : 0;
        
        let avgQuality: SessionReport['avgConnectionQuality'] = 'excellent';
        if (avgLoss > 5 || avgPing > 300 || avgJitter > 50) avgQuality = 'critical';
        else if (avgLoss > 3 || avgPing > 200 || avgJitter > 30) avgQuality = 'poor';
        else if (avgLoss > 1 || avgPing > 100 || avgJitter > 20) avgQuality = 'good';

        const mapped: SessionReport = {
          id: s.id,
          roomName: `${s.class?.course?.name || ''} - ${s.class?.name || ''}`,
          date: dateStr,
          presentStudents: present,
          totalStudents: total || 1,
          avgDurationMins: s.endTime && s.startTime 
            ? Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000) 
            : 0,
          avgConnectionQuality: avgQuality,
          details
        };
        setSelectedSession(mapped);
      })
      .catch(err => {
        console.error('Failed to load session report:', err);
        alert('Không thể tải báo cáo phiên học này.');
        setSelectedSessionId(null);
      })
      .finally(() => {
        setLoadingReport(false);
      });
  }, [selectedSessionId, reports]);

  const getQualityText = (quality: SessionReport['avgConnectionQuality']) => {
    switch (quality) {
      case 'excellent': return 'Xuất sắc';
      case 'good': return 'Khá';
      case 'poor': return 'Kém';
      case 'critical': return 'Nghiêm trọng';
      default: return 'Khá';
    }
  };

  const getTelemetryStatus = (ping: number, loss: number, jitter: number) => {
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

  // 1. Export CSV (Original)
  const handleExportCSV = (session: SessionReport) => {
    const headers = ['Học viên', 'Vai trò', 'Thời lượng tham gia (phút)', 'Tỷ lệ (%)', 'Độ trễ Ping (ms)', 'Jitter (ms)', 'Tỷ lệ mất gói (%)', 'Chất lượng kết nối'];
    const rows = session.details.map(d => {
      const telStatus = getTelemetryStatus(d.telemetry.ping, d.telemetry.loss, d.telemetry.jitter);
      return [
        `"${d.name.replace(/"/g, '""')}"`,
        `"${d.role}"`,
        d.presentTimeMins,
        d.pct,
        d.telemetry.ping,
        d.telemetry.jitter,
        d.telemetry.loss,
        `"${telStatus.label}"`
      ];
    });

    let csvContent = '\uFEFF'; 
    csvContent += headers.join(',') + '\n';
    csvContent += rows.map(r => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_diem_danh_${session.roomName.replace(/\s+/g, '_')}_${session.date.replace(/\//g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. Export Excel XML styled sheet (.xls)
  const handleExportExcel = (session: SessionReport) => {
    const title = `BÁO CÁO CHUYÊN CẦN LỚP HỌC - ${session.roomName.toUpperCase()}`;
    const dateStr = `Ngày dạy: ${session.date}`;
    
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8"/><style>`;
    html += `table { border-collapse: collapse; font-family: Arial, sans-serif; width: 100%; }`;
    html += `th { background-color: #4f46e5; color: white; border: 1px solid #cccccc; padding: 10px; font-weight: bold; text-align: center; }`;
    html += `td { border: 1px solid #cccccc; padding: 8px; text-align: left; }`;
    html += `.title-row { font-size: 16px; font-weight: bold; color: #1e1e2f; text-align: center; height: 35px; }`;
    html += `.meta-row { font-size: 11px; color: #666666; font-style: italic; }`;
    html += `.teacher-cell { background-color: #f5f3ff; font-weight: bold; }`;
    html += `.pct-pass { color: #10b981; font-weight: bold; }`;
    html += `.pct-fail { color: #ef4444; font-weight: bold; }`;
    html += `</style></head><body>`;
    html += `<table>`;
    html += `<tr><td colspan="8" class="title-row">${title}</td></tr>`;
    html += `<tr><td colspan="8" class="meta-row">${dateStr}</td></tr>`;
    html += `<tr><td colspan="8" class="meta-row">Sĩ số lớp học: ${session.presentStudents}/${session.totalStudents} học sinh | Thời lượng giảng dạy trung bình: ${session.avgDurationMins} phút</td></tr>`;
    html += `<tr><td colspan="8"></td></tr>`;
    html += `<tr>`;
    html += `<th>Học viên</th><th>Vai trò</th><th>Thời lượng tham gia</th><th>Tỷ lệ chuyên cần</th><th>Ping (ms)</th><th>Jitter (ms)</th><th>Mất gói (%)</th><th>Trạng thái mạng</th>`;
    html += `</tr>`;
    
    session.details.forEach(d => {
      const tel = getTelemetryStatus(d.telemetry.ping, d.telemetry.loss, d.telemetry.jitter);
      const isTeacher = d.role === 'Giáo viên';
      const rowStyle = isTeacher ? 'class="teacher-cell"' : '';
      const pctClass = d.pct >= 90 ? 'pct-pass' : 'pct-fail';
      
      html += `<tr>`;
      html += `<td ${rowStyle}>${d.name}</td>`;
      html += `<td ${rowStyle}>${d.role}</td>`;
      html += `<td ${rowStyle}>${d.presentTimeMins} phút</td>`;
      html += `<td ${rowStyle} class="${pctClass}">${d.pct}%</td>`;
      html += `<td ${rowStyle}>${d.telemetry.ping} ms</td>`;
      html += `<td ${rowStyle}>${d.telemetry.jitter} ms</td>`;
      html += `<td ${rowStyle}>${d.telemetry.loss}%</td>`;
      html += `<td ${rowStyle}>${tel.label}</td>`;
      html += `</tr>`;
    });
    
    html += `</table></body></html>`;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_chuyen_can_${session.roomName.replace(/\s+/g, '_')}_${session.date.replace(/\//g, '-')}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 3. Print Report (triggers PDF generation via browser)
  const handlePrintReport = () => {
    window.print();
  };

  // Save scheduler configuration
  const handleSaveScheduler = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { freq: schedFreq, time: schedTime, email: schedEmail };
    localStorage.setItem('edumeet_report_schedule_config', JSON.stringify(config));
    setSchedSaved(true);
    setTimeout(() => setSchedSaved(false), 3000);
  };

  // Apply Search & Filter options
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Parse date (DD/MM/YYYY)
    let matchesDate = true;
    if (startDate || endDate) {
      const [day, month, year] = r.date.split('/');
      const reportDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (reportDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        if (reportDate > end) matchesDate = false;
      }
    }

    // Attendance stats filter
    let matchesAttendance = true;
    const avgPct = r.details.length > 0 
      ? r.details.reduce((sum, d) => sum + d.pct, 0) / r.details.length
      : (r.presentStudents / r.totalStudents) * 100;
      
    if (attendanceFilter === 'pass' && avgPct < 90) matchesAttendance = false;
    if (attendanceFilter === 'fail' && avgPct >= 90) matchesAttendance = false;

    return matchesSearch && matchesDate && matchesAttendance;
  });

  if (loadingHistory) {
    return (
      <div className="page-container reports-page animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin text-primary" size={48} style={{ margin: '0 auto 1rem' }} />
          <p>Đang tải danh sách lịch sử...</p>
        </div>
      </div>
    );
  }

  if (loadingReport) {
    return (
      <div className="page-container reports-page animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin text-primary" size={48} style={{ margin: '0 auto 1rem' }} />
          <p>Đang tải chi tiết báo cáo...</p>
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="page-container session-report-page animate-fade-in printable-report">
        <button onClick={() => setSelectedSessionId(null)} className="back-btn glass-panel no-print">
          <ArrowLeft size={16} />
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
              <span>Chuyên cần: {selectedSession.presentStudents}/{selectedSession.totalStudents} học viên</span>
            </div>
            <div className="summary-pill">
              <Clock size={14} className="text-primary" />
              <span>Thời gian TB: {selectedSession.avgDurationMins} phút</span>
            </div>
          </div>
        </div>

        <section className="reports-section glass-panel">
          <div className="reports-section-header no-print">
            <h3>Chi tiết Chuyên cần & Telemetry Mạng</h3>
            <div className="report-export-actions" style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="export-btn-full secondary" onClick={handlePrintReport}>
                <Printer size={14} />
                <span>In / Xuất PDF</span>
              </button>
              <button className="export-btn-full secondary" onClick={() => handleExportCSV(selectedSession)}>
                <Download size={14} />
                <span>Tải CSV</span>
              </button>
              <button className="export-btn-full" onClick={() => handleExportExcel(selectedSession)}>
                <Download size={14} />
                <span>Xuất Excel (.xls)</span>
              </button>
            </div>
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

  // Calculate summary metrics
  const totalReports = reports.length;
  const totalPresent = reports.reduce((sum, r) => sum + r.presentStudents, 0);
  const totalStudents = reports.reduce((sum, r) => sum + r.totalStudents, 0);
  const avgAttendance = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 91;
  const absentRate = totalStudents > 0 ? Math.max(0, 100 - avgAttendance - 3) : 6;
  const lateRate = 3;

  return (
    <div className="page-container reports-page animate-fade-in">
      
      {/* Title Header */}
      <div className="reports-page-head">
        <div>
          <h2 className="reports-page-title">Báo cáo chuyên cần</h2>
          <p className="reports-page-subtitle">Theo dõi điểm danh, vắng mặt và trạng thái tham gia lớp học</p>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="reports-summary-metrics-grid">
        <div className="metric-card glass-panel animate-fade-in">
          <div className="metric-icon-box">📊</div>
          <div className="metric-info">
            <span className="metric-value">{totalReports}</span>
            <span className="metric-label">Tổng buổi học</span>
          </div>
        </div>
        <div className="metric-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="metric-icon-box text-success">✔️</div>
          <div className="metric-info">
            <span className="metric-value">{avgAttendance}%</span>
            <span className="metric-label">Có mặt trung bình</span>
          </div>
        </div>
        <div className="metric-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="metric-icon-box text-danger">❌</div>
          <div className="metric-info">
            <span className="metric-value">{absentRate}%</span>
            <span className="metric-label">Vắng mặt</span>
          </div>
        </div>
        <div className="metric-card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="metric-icon-box text-warning">🕒</div>
          <div className="metric-info">
            <span className="metric-value">{lateRate}%</span>
            <span className="metric-label">Đi muộn / Trễ</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <section className="reports-filters-section glass-panel">
        <div className="filter-row">
          {/* Search bar */}
          <div className="search-box-wrapper">
            <Search size={16} className="search-icon-filter" />
            <input
              type="text"
              placeholder="Tìm theo lớp, môn hoặc phòng học..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="filter-search-input"
            />
          </div>

          {/* Date range filter */}
          <div className="date-picker-group">
            <div className="date-input-container">
              <Calendar size={14} className="date-icon" />
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                title="Từ ngày"
              />
            </div>
            <span className="date-separator">→</span>
            <div className="date-input-container">
              <Calendar size={14} className="date-icon" />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                title="Đến ngày"
              />
            </div>
          </div>

          {/* Attendance select filter */}
          <div className="select-filter-container">
            <Filter size={14} className="select-icon" />
            <select
              value={attendanceFilter}
              onChange={e => setAttendanceFilter(e.target.value as 'all' | 'pass' | 'fail')}
            >
              <option value="all">Trạng thái chuyên cần</option>
              <option value="pass">{"Chuyên cần Đạt (>= 90%)"}</option>
              <option value="fail">{"Chuyên cần Yếu (< 90%)"}</option>
            </select>
          </div>

          {/* Auto Scheduler button */}
          <button 
            className={`scheduler-toggle-btn ${isSchedOpen ? 'active' : ''}`}
            onClick={() => setIsSchedOpen(!isSchedOpen)}
            title="Lập lịch gửi báo cáo qua Email"
          >
            <Mail size={16} />
            <span>Tự động gửi báo cáo</span>
            <span className={`status-dot-scheduler ${isSchedOpen ? 'active' : ''}`}></span>
          </button>
        </div>

        {/* Email Scheduler Configuration panel */}
        {isSchedOpen && (
          <div className="scheduler-config-panel animate-scale-up">
            <h4>⚙️ Cấu Hình Tự Động Gửi Báo Cáo Chuyên Cần Định Kỳ</h4>
            <form onSubmit={handleSaveScheduler} className="scheduler-form">
              <div className="form-row-sched">
                <div className="form-group-sched">
                  <label>Tần suất gửi</label>
                  <select value={schedFreq} onChange={e => setSchedFreq(e.target.value)}>
                    <option value="daily">Hàng ngày (18:00)</option>
                    <option value="weekly-monday">Thứ Hai hàng tuần (08:00)</option>
                    <option value="weekly-friday">Thứ Sáu hàng tuần (17:00)</option>
                    <option value="monthly">Cuối tháng (20:00)</option>
                  </select>
                </div>
                <div className="form-group-sched">
                  <label>Giờ kích hoạt</label>
                  <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} />
                </div>
                <div className="form-group-sched email-field">
                  <label>Email tiếp nhận</label>
                  <input 
                    type="email" 
                    placeholder="admin@edumeet.com" 
                    value={schedEmail} 
                    onChange={e => setSchedEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group-sched submit-btn-field">
                  <button type="submit" className="save-sched-btn">Lưu cấu hình</button>
                </div>
              </div>
              {schedSaved && (
                <div className="sched-success-msg text-success">
                  ✓ Lưu cấu hình thành công! Hệ thống giả lập sẽ tự động kích hoạt gửi báo cáo định kỳ.
                </div>
              )}
            </form>
          </div>
        )}
      </section>

      {/* Reports Grid List */}
      {filteredReports.length > 0 ? (
        <div className="reports-list">
          {filteredReports.map(session => (
            <div
              key={session.id}
              className="session-report-card glass-panel"
              onClick={() => setSelectedSessionId(session.id)}
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
      ) : (
        <div className="empty-reports-state animate-fade-in">
          <div className="empty-state-icon-box">
            <Calendar size={36} />
          </div>
          <h4>{searchQuery || startDate || endDate || attendanceFilter !== 'all' ? 'Không tìm thấy dữ liệu phù hợp' : 'Chưa có báo cáo chuyên cần'}</h4>
          <p>
            {searchQuery || startDate || endDate || attendanceFilter !== 'all'
              ? 'Hãy thử thay đổi bộ lọc hoặc chọn khoảng thời gian khác.'
              : 'Báo cáo điểm danh của các buổi học sẽ xuất hiện tại đây khi lớp học trực tuyến diễn ra.'}
          </p>
          {searchQuery || startDate || endDate || attendanceFilter !== 'all' ? (
            <button className="primary-cta-btn" onClick={() => {
              setSearchQuery('');
              setStartDate('');
              setEndDate('');
              setAttendanceFilter('all');
            }} style={{ marginTop: '1rem' }}>
              Xóa bộ lọc
            </button>
          ) : (
            <button className="primary-cta-btn" onClick={() => window.location.hash = '#calendar'} style={{ marginTop: '1rem' }}>
              Xem lịch học
            </button>
          )}
        </div>
      )}
    </div>
  );
};

