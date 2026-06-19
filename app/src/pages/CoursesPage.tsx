import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { BookOpen, FileText, Video, Download, Upload, Search, ArrowLeft, Plus, Users, UserCheck } from 'lucide-react';
import { mockCourses } from '../lib/mockData';
import type { MockCourse } from '../lib/mockData';
import { can } from '../lib/roles';
import './Pages.css';

// Tiêu đề khu vực khóa học theo vai trò
const COURSE_HEADINGS: Record<string, { title: string; subtitle: string }> = {
  student: { title: 'Khóa học của tôi', subtitle: 'Các môn bạn đang theo học và tiến độ hoàn thành.' },
  teacher: { title: 'Lớp học phụ trách', subtitle: 'Các lớp bạn đang giảng dạy và quản lý tài liệu.' },
  manager: { title: 'Quản lý khóa học', subtitle: 'Toàn bộ khóa học trong chương trình đào tạo phụ trách.' },
  admin: { title: 'Quản lý khóa học', subtitle: 'Toàn bộ khóa học trên hệ thống.' },
};

export const CoursesPage: React.FC = () => {
  const { role, userName } = useClass();
  const [selectedCourse, setSelectedCourse] = useState<MockCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isStudent = role === 'student';
  const canManageCourses = can(role, 'manage_courses'); // admin, manager
  const canShareMaterials = can(role, 'share_materials'); // admin, manager, teacher
  const heading = COURSE_HEADINGS[role] ?? COURSE_HEADINGS.student;

  // Giáo viên chỉ thấy lớp mình phụ trách; nếu không khớp tên thì hiển thị tất cả (fallback)
  const taught = mockCourses.filter(c => c.teacher === userName);
  const scopedCourses = role === 'teacher' && taught.length > 0 ? taught : mockCourses;

  const filteredCourses = scopedCourses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-danger" size={16} />;
      case 'slide':
        return <BookOpen className="text-warning" size={16} />;
      case 'video':
        return <Video className="text-primary" size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (selectedCourse) {
    return (
      <div className="page-container course-details-page animate-fade-in">
        <button onClick={() => setSelectedCourse(null)} className="back-btn glass-panel">
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>

        <div className="course-detail-header glass-panel">
          <div className="course-headline">
            <span className="course-code-tag">{selectedCourse.code}</span>
            <h2>{selectedCourse.name}</h2>
            <p className="course-teacher-label">Giảng viên: {selectedCourse.teacher}</p>
          </div>
          <p className="course-desc-text">{selectedCourse.desc}</p>

          {/* Số liệu quản lý — chỉ hiện với vai trò điều hành/quản lý */}
          {!isStudent && (
            <div className="course-detail-stats">
              <div className="detail-stat">
                <Users size={14} />
                <span>{selectedCourse.studentCount} học viên</span>
              </div>
              <div className="detail-stat">
                <UserCheck size={14} />
                <span>Chuyên cần {selectedCourse.attendanceRate}%</span>
              </div>
              <div className="detail-stat">
                <BookOpen size={14} />
                <span>{selectedCourse.sessionsDone}/{selectedCourse.sessionsTotal} buổi</span>
              </div>
            </div>
          )}
        </div>

        <section className="materials-section glass-panel">
          <div className="materials-header">
            <h3>Tài liệu & Bài giảng</h3>
            {canShareMaterials && (
              <button className="upload-btn">
                <Plus size={16} />
                <Upload size={14} />
                <span>Tải lên tài liệu</span>
              </button>
            )}
          </div>

          <div className="materials-list">
            {selectedCourse.materials.map(m => (
              <div key={m.id} className="material-item-row glass-panel">
                <div className="material-info">
                  {getMaterialIcon(m.type)}
                  <span className="material-title">{m.title}</span>
                  {m.size && <span className="material-size">{m.size}</span>}
                </div>
                <div className="material-actions">
                  <button className="download-btn-icon" title="Tải xuống">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container courses-page animate-fade-in">
      <div className="courses-page-head">
        <div>
          <h2 className="courses-page-title">{heading.title}</h2>
          <p className="courses-page-subtitle">{heading.subtitle}</p>
        </div>
        {canManageCourses && (
          <button className="upload-btn">
            <Plus size={16} />
            <span>Thêm khóa học</span>
          </button>
        )}
      </div>

      <div className="courses-header-actions">
        <div className="search-bar-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(c => (
          <div key={c.id} className="course-card glass-panel" onClick={() => setSelectedCourse(c)}>
            <div className="course-card-head">
              <span className="course-card-code">{c.code}</span>
              <h3>{c.name}</h3>
              <p>{c.teacher}</p>
            </div>

            <div className="course-card-footer">
              {isStudent ? (
                <>
                  <div className="progress-container">
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${c.progress}%` }}></div>
                    </div>
                    <span className="progress-text">{c.progress}% bài học</span>
                  </div>
                  <span className="materials-badge">{c.materialsCount} tài liệu</span>
                </>
              ) : (
                <div className="course-mgmt-stats">
                  <div className="mgmt-stat">
                    <Users size={13} />
                    <span>{c.studentCount}</span>
                    <small>học viên</small>
                  </div>
                  <div className="mgmt-stat">
                    <UserCheck size={13} />
                    <span>{c.attendanceRate}%</span>
                    <small>chuyên cần</small>
                  </div>
                  <div className="mgmt-stat">
                    <BookOpen size={13} />
                    <span>{c.sessionsDone}/{c.sessionsTotal}</span>
                    <small>buổi</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
