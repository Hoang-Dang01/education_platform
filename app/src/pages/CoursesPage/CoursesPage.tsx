import React, { useState, useEffect, useRef } from 'react';
import { useClass } from '../../context/ClassContext';
import { BookOpen, FileText, Video, Download, Upload, Search, ArrowLeft, Plus, Users, UserCheck, Trash2, X, FileImage } from 'lucide-react';
import { mockCourses } from '../../lib/mockData';
import type { MockCourse } from '../../lib/mockData';
import { can } from '../../lib/roles';
import { getMaterials, saveMaterial, deleteMaterial } from '../../lib/localDb';
import type { LocalMaterial } from '../../lib/localDb';
import './CoursesPage.css';

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

  // Các state để lưu tài liệu từ IndexedDB và kiểm soát upload modal
  const [localMaterials, setLocalMaterials] = useState<LocalMaterial[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'pdf' | 'slide' | 'video' | 'image'>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = role === 'student';
  const canManageCourses = can(role, 'manage_courses'); // admin, manager
  const canShareMaterials = can(role, 'share_materials'); // admin, manager, teacher
  const heading = COURSE_HEADINGS[role] ?? COURSE_HEADINGS.student;

  // Tải danh sách tài liệu từ IndexedDB khi người dùng chọn khóa học
  const loadLocalMaterials = async (courseId: string) => {
    try {
      const list = await getMaterials(courseId);
      setLocalMaterials(list);
    } catch (err) {
      console.error('Failed to load local materials:', err);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      loadLocalMaterials(selectedCourse.id);
    } else {
      setLocalMaterials([]);
    }
  }, [selectedCourse]);

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
      case 'image':
        return <FileImage className="text-success" size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const handleDownloadLocal = (material: LocalMaterial) => {
    const url = URL.createObjectURL(material.fileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = material.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMock = (title: string, type: string) => {
    const dummyText = `Đây là tài liệu giảng dạy cho môn học: ${title}\nLoại tài liệu: ${type}\nĐược tải về thông qua EduMeet.`;
    const blob = new Blob([dummyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = type === 'pdf' ? 'pdf' : type === 'slide' ? 'pptx' : type === 'video' ? 'mp4' : 'txt';
    a.download = `${title.replace(/\s+/g, '_')}_mock.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (!uploadTitle) {
      const dotIndex = file.name.lastIndexOf('.');
      const nameWithoutExt = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      setUploadTitle(nameWithoutExt);
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      setUploadType('pdf');
    } else if (['ppt', 'pptx', 'odp'].includes(ext || '')) {
      setUploadType('slide');
    } else if (['mp4', 'webm', 'avi', 'mov'].includes(ext || '')) {
      setUploadType('video');
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) {
      setUploadType('image');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setUploadTitle('');
    setUploadType('pdf');
    setSelectedFile(null);
    setDragActive(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedCourse || !uploadTitle.trim()) return;

    try {
      const newMaterial: LocalMaterial = {
        id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        courseId: selectedCourse.id,
        title: uploadTitle.trim(),
        fileName: selectedFile.name,
        fileType: uploadType,
        fileSize: formatFileSize(selectedFile.size),
        fileBlob: selectedFile,
        uploadedAt: new Date().toISOString(),
      };

      await saveMaterial(newMaterial);
      await loadLocalMaterials(selectedCourse.id);
      closeModal();
    } catch (err) {
      console.error('Failed to save material:', err);
      alert('Có lỗi xảy ra khi lưu tài liệu. Vui lòng thử lại.');
    }
  };

  const handleDeleteLocalMaterial = async (id: string) => {
    if (!selectedCourse) return;
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      try {
        await deleteMaterial(id);
        await loadLocalMaterials(selectedCourse.id);
      } catch (err) {
        console.error('Failed to delete material:', err);
      }
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
              <button className="upload-btn" onClick={() => setShowUploadModal(true)}>
                <Plus size={16} />
                <Upload size={14} />
                <span>Tải lên tài liệu</span>
              </button>
            )}
          </div>

          <div className="materials-list">
            {/* Danh sách tài liệu mẫu có sẵn */}
            {selectedCourse.materials.map(m => (
              <div key={m.id} className="material-item-row glass-panel">
                <div className="material-info">
                  {getMaterialIcon(m.type)}
                  <span className="material-title">{m.title}</span>
                  {m.size && <span className="material-size">{m.size}</span>}
                </div>
                <div className="material-actions">
                  <button 
                    className="download-btn-icon" 
                    title="Tải xuống"
                    onClick={() => handleDownloadMock(m.title, m.type)}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Danh sách tài liệu tự tải lên (IndexedDB) */}
            {localMaterials.map(m => (
              <div key={m.id} className="material-item-row glass-panel local-material">
                <div className="material-info">
                  {getMaterialIcon(m.fileType)}
                  <div className="material-title-group">
                    <span className="material-title">{m.title}</span>
                    <span className="material-filename">{m.fileName}</span>
                  </div>
                  <span className="material-size">{m.fileSize}</span>
                </div>
                <div className="material-actions">
                  <button 
                    className="download-btn-icon" 
                    title="Tải xuống"
                    onClick={() => handleDownloadLocal(m)}
                  >
                    <Download size={14} />
                  </button>
                  {canShareMaterials && (
                    <button 
                      className="delete-btn-icon text-danger" 
                      title="Xóa tài liệu"
                      onClick={() => handleDeleteLocalMaterial(m.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {selectedCourse.materials.length === 0 && localMaterials.length === 0 && (
              <div className="no-materials">Chưa có tài liệu nào trong khóa học này.</div>
            )}
          </div>
        </section>

        {/* Modal Tải lên tài liệu học tập (IndexedDB Drag & Drop) */}
        {showUploadModal && (
          <div className="modal-overlay animate-fade-in" onClick={closeModal}>
            <div className="modal-content glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Tải lên tài liệu học tập</h3>
                <button className="close-btn-icon" onClick={closeModal} title="Đóng">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUploadSubmit} className="upload-form">
                <div className="form-group">
                  <label htmlFor="material-title">Tên tài liệu hiển thị *</label>
                  <input
                    id="material-title"
                    type="text"
                    placeholder="Ví dụ: Đề cương chương 3 Tích Phân..."
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="material-type">Loại tài liệu</label>
                  <select
                    id="material-type"
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as any)}
                  >
                    <option value="pdf">Tài liệu PDF (.pdf)</option>
                    <option value="slide">Bài giảng PowerPoint (.ppt, .pptx)</option>
                    <option value="video">Video bài giảng (.mp4, .webm)</option>
                    <option value="image">Hình ảnh minh họa (.png, .jpg)</option>
                  </select>
                </div>

                <div 
                  className={`drag-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="file-input-hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.ppt,.pptx,.odp,.mp4,.webm,.avi,.mov,.png,.jpg,.jpeg,.gif,.svg,.webp"
                  />
                  
                  {selectedFile ? (
                    <div className="selected-file-info animate-fade-in">
                      {getMaterialIcon(uploadType)}
                      <div className="file-meta">
                        <p className="file-name">{selectedFile.name}</p>
                        <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button 
                        type="button" 
                        className="remove-file-btn" 
                        title="Hủy chọn tệp"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="drag-drop-prompt">
                      <Upload className="upload-icon" size={32} />
                      <p className="prompt-title">Kéo thả tệp tài liệu vào đây hoặc click để duyệt</p>
                      <p className="prompt-subtitle">Chấp nhận tài liệu PDF, Slide, Video hoặc Hình ảnh</p>
                    </div>
                  )}
                </div>

                <div className="modal-actions-footer">
                  <button type="button" className="cancel-btn" onClick={closeModal}>
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={!selectedFile || !uploadTitle.trim()}
                  >
                    Bắt đầu tải lên
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
