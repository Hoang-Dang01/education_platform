import React, { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { BookOpen, FileText, Video, Download, Upload, Search, ArrowLeft, Plus } from 'lucide-react';
import { mockCourses } from '../lib/mockData';
import type { MockCourse } from '../lib/mockData';
import './Pages.css';

export const CoursesPage: React.FC = () => {
  const { role } = useClass();
  const [selectedCourse, setSelectedCourse] = useState<MockCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const courses: MockCourse[] = mockCourses;

  const filteredCourses = courses.filter(c =>
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
        </div>

        <section className="materials-section glass-panel">
          <div className="materials-header">
            <h3>Tài liệu & Bài giảng</h3>
            {role === 'teacher' && (
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
              <div className="progress-container">
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${c.progress}%` }}></div>
                </div>
                <span className="progress-text">{c.progress}% bài học</span>
              </div>
              <span className="materials-badge">{c.materialsCount} tài liệu</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
