import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useClass } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, FileText, Video, Download, Upload, Search, ArrowLeft, Plus, Users, UserCheck, Trash2, X, FileImage, Folder, Loader2, AlertCircle, Eye, Share2 } from 'lucide-react';
import type { MockCourse } from '../../lib/mockData';
import { can } from '../../lib/roles';
import { api } from '../../lib/api';
import './CoursesPage.css';

// Tiêu đề khu vực khóa học theo vai trò
const COURSE_HEADINGS: Record<string, { title: string; subtitle: string }> = {
  student: { title: 'Khóa học của tôi', subtitle: 'Các môn bạn đang theo học và tiến độ hoàn thành.' },
  teacher: { title: 'Lớp học phụ trách', subtitle: 'Các lớp bạn đang giảng dạy và quản lý tài liệu.' },
  manager: { title: 'Quản lý khóa học', subtitle: 'Toàn bộ khóa học trong chương trình đào tạo phụ trách.' },
  admin: { title: 'Quản lý khóa học', subtitle: 'Toàn bộ khóa học trên hệ thống.' },
};

export const CoursesPage: React.FC = () => {
  const { courses, loading: lmsLoading, error: lmsError, refreshLmsData } = useClass();
  const { user } = useAuth();
  const token = localStorage.getItem('accessToken') || '';
  const role = user?.role || 'student';
  const userName = user?.name || '';
  const [selectedCourse, setSelectedCourse] = useState<MockCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'personal'>('courses');
  const [shareMaterialId, setShareMaterialId] = useState<string | null>(null);

  // Các state kiểm soát tài liệu và upload
  const [personalMaterials, setPersonalMaterials] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'pdf' | 'slide' | 'video' | 'image'>('pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = role === 'student';
  const canManageCourses = can(role, 'manage_courses'); // admin, manager
  const canShareMaterials = can(role, 'share_materials'); // admin, manager, teacher
  const heading = COURSE_HEADINGS[role] ?? COURSE_HEADINGS.student;

  // Pronoun detection helper
  const getPronoun = (name: string): string => {
    const normalized = name.toLowerCase().trim();
    if (normalized.startsWith('cô') || normalized.includes(' cô ')) return 'cô';
    if (normalized.startsWith('thầy') || normalized.includes(' thầy ')) return 'thầy';
    return 'bạn';
  };

  const pronoun = getPronoun(userName);
  const capitalizedPronoun = pronoun.charAt(0).toUpperCase() + pronoun.slice(1);

  const dynamicSubtitle = React.useMemo(() => {
    if (role === 'student') {
      return `Các môn ${pronoun} đang theo học và tiến độ hoàn thành.`;
    }
    if (role === 'teacher') {
      return `Các lớp ${pronoun} đang giảng dạy và quản lý tài liệu.`;
    }
    return heading.subtitle;
  }, [role, pronoun, heading.subtitle]);

  // Tải danh sách tài liệu cá nhân từ backend
  const loadPersonalMaterials = async () => {
    try {
      const list = await api.getPersonalMaterials();
      setPersonalMaterials(list);
    } catch (err) {
      console.error('Failed to load personal materials:', err);
    }
  };

  // Đồng bộ hóa selectedCourse khi danh sách courses thay đổi (sau khi upload hoặc xóa)
  useEffect(() => {
    if (selectedCourse) {
      const rawCourse = courses?.find(c => c.id === selectedCourse.id);
      if (rawCourse) {
        const mainClass = rawCourse.classes?.[0];
        const teacherName = mainClass?.teacher?.name || 'Chưa phân công';
        const totalStudents = rawCourse.classes?.reduce((acc: number, cls: any) => acc + (cls.enrollments?.length || 0), 0) || 0;
        const completedSessions = rawCourse.classes?.reduce((acc: number, cls: any) => acc + (cls.sessions?.filter((s: any) => s.status === 'completed' || s.status === 'ended').length || 0), 0) || 0;
        const totalSessions = rawCourse.classes?.reduce((acc: number, cls: any) => acc + (cls.sessions?.length || 0), 0) || 0;
        
        const updated: MockCourse = {
          id: rawCourse.id,
          name: rawCourse.name,
          code: rawCourse.code,
          desc: rawCourse.description || '',
          teacher: teacherName,
          progress: 75,
          materialsCount: rawCourse.materials?.length || 0,
          studentCount: totalStudents,
          attendanceRate: 92.5,
          sessionsDone: completedSessions,
          sessionsTotal: totalSessions || 1,
          materials: (rawCourse.materials || []).map((m: any) => ({
            id: m.id,
            title: m.title,
            type: m.fileType as 'pdf' | 'slide' | 'video',
            size: m.fileSize || 'Không rõ dung lượng',
            url: m.filePath || '#',
            uploadedBy: m.uploadedBy || 'Hệ thống'
          }))
        };
        setSelectedCourse(updated);
      } else {
        setSelectedCourse(null);
      }
    }
  }, [courses]);

  useEffect(() => {
    if (activeTab === 'personal') {
      loadPersonalMaterials();
    }
  }, [activeTab]);

  const mappedCourses: MockCourse[] = (courses || []).map((c: any) => {
    const mainClass = c.classes?.[0];
    const teacherName = mainClass?.teacher?.name || 'Chưa phân công';
    const totalStudents = c.classes?.reduce((acc: number, cls: any) => acc + (cls.enrollments?.length || 0), 0) || 0;
    const completedSessions = c.classes?.reduce((acc: number, cls: any) => acc + (cls.sessions?.filter((s: any) => s.status === 'completed' || s.status === 'ended').length || 0), 0) || 0;
    const totalSessions = c.classes?.reduce((acc: number, cls: any) => acc + (cls.sessions?.length || 0), 0) || 0;
    
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      desc: c.description || '',
      teacher: teacherName,
      progress: 75,
      materialsCount: c.materials?.length || 0,
      studentCount: totalStudents,
      attendanceRate: 92.5,
      sessionsDone: completedSessions,
      sessionsTotal: totalSessions || 1,
      materials: (c.materials || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        type: m.fileType as 'pdf' | 'slide' | 'video',
        size: m.fileSize || 'Không rõ dung lượng',
        url: m.filePath || '#',
        uploadedBy: m.uploadedBy || 'Hệ thống'
      }))
    };
  });

  // Giáo viên chỉ thấy lớp mình phụ trách; nếu không khớp tên thì hiển thị tất cả (fallback)
  const taught = mappedCourses.filter(c => c.teacher === userName);
  const scopedCourses = role === 'teacher' && taught.length > 0 ? taught : mappedCourses;

  const filteredCourses = scopedCourses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPersonalMaterials = personalMaterials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!selectedFile || !uploadTitle.trim()) return;
    if (activeTab === 'courses' && !selectedCourse) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle.trim());
      formData.append('scope', activeTab === 'courses' ? 'course' : 'personal');
      if (activeTab === 'courses' && selectedCourse) {
        formData.append('courseId', selectedCourse.id);
      }
      formData.append('isPrivate', (activeTab === 'personal').toString());

      await api.uploadMaterial(formData);
      
      if (activeTab === 'courses' && selectedCourse) {
        await refreshLmsData();
      } else {
        await loadPersonalMaterials();
      }
      closeModal();
    } catch (err) {
      console.error('Failed to upload material:', err);
      alert('Có lỗi xảy ra khi tải tài liệu lên: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (id: string, isPrivateMat?: boolean) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      try {
        await api.deleteMaterial(id);
        if (isPrivateMat) {
          await loadPersonalMaterials();
        } else {
          await refreshLmsData();
        }
      } catch (err) {
        console.error('Failed to delete material:', err);
        alert('Không thể xóa tài liệu: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  if (lmsLoading) {
    return (
      <div className="page-container courses-page animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin text-primary" size={48} style={{ margin: '0 auto 1rem' }} />
          <p>Đang tải danh sách khóa học...</p>
        </div>
      </div>
    );
  }

  if (lmsError) {
    return (
      <div className="page-container courses-page animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}>
          <AlertCircle className="text-danger" size={48} style={{ margin: '0 auto 1rem' }} />
          <h3>Đã xảy ra lỗi</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{lmsError}</p>
          <button onClick={refreshLmsData} className="save-btn-modal" style={{ width: 'auto', padding: '8px 20px' }}>Thử lại</button>
        </div>
      </div>
    );
  }

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
            {/* Danh sách tài liệu khóa học */}
            {selectedCourse.materials.map(m => {
              const canDelete = role === 'admin' || role === 'manager' || (canShareMaterials && m.uploadedBy === userName);
              return (
                <div key={m.id} className="material-item-row glass-panel">
                  <div className="material-info">
                    {getMaterialIcon(m.type)}
                    <div className="material-title-group">
                      <span className="material-title">{m.title}</span>
                      <span className="material-uploader">Người tải lên: {m.uploadedBy || 'Hệ thống'}</span>
                    </div>
                    {m.size && <span className="material-size">{m.size}</span>}
                  </div>
                  <div className="material-actions">
                    {m.url && m.url !== '#' ? (
                      <>
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${m.url}?view=true&token=${token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-btn-icon view-btn"
                          title="Xem tài liệu"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Eye size={14} />
                        </a>
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${m.url}?token=${token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-btn-icon"
                          title="Tải xuống"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Download size={14} />
                        </a>
                      </>
                    ) : (
                      <>
                        <button 
                          className="download-btn-icon view-btn" 
                          title="Xem trực tuyến (Bản mẫu)"
                          onClick={() => alert(`Xem trực tuyến tài liệu mẫu: ${m.title}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="download-btn-icon" 
                          title="Tải xuống"
                          onClick={() => handleDownloadMock(m.title, m.type)}
                        >
                          <Download size={14} />
                        </button>
                      </>
                    )}
                    {canDelete && m.url && m.url !== '#' && (
                      <button 
                        className="delete-btn-icon text-danger" 
                        title="Xóa tài liệu"
                        onClick={() => handleDeleteMaterial(m.id, false)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {selectedCourse.materials.length === 0 && (
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
                  <button type="button" className="cancel-btn" onClick={closeModal} disabled={isUploading}>
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={!selectedFile || !uploadTitle.trim() || isUploading}
                  >
                    {isUploading ? 'Đang tải lên...' : 'Bắt đầu tải lên'}
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
          <p className="courses-page-subtitle">{dynamicSubtitle}</p>
        </div>
        {canManageCourses && activeTab === 'courses' && (
          <button className="upload-btn">
            <Plus size={16} />
            <span>Thêm khóa học</span>
          </button>
        )}
      </div>

      <div className="courses-tabs">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('courses');
            setSearchQuery('');
          }}
        >
          <BookOpen size={16} />
          <span>Khóa học</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('personal');
            setSearchQuery('');
          }}
        >
          <Folder size={16} />
          <span>Tài liệu cá nhân</span>
        </button>
      </div>

      <div className="courses-header-actions">
        <div className="search-bar-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={activeTab === 'courses' ? 'Tìm kiếm môn học...' : 'Tìm tài liệu cá nhân...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {activeTab === 'courses' ? (
        filteredCourses.length > 0 ? (
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
        ) : (
          <div className="empty-courses-state animate-fade-in">
            <div className="empty-state-icon-box">
              <BookOpen size={36} />
            </div>
            <h4>{searchQuery ? 'Không tìm thấy lớp học phù hợp' : 'Bạn chưa được phân công lớp học nào'}</h4>
            <p>
              {searchQuery
                ? 'Vui lòng kiểm tra lại tên hoặc mã môn học và thử lại.'
                : 'Khi quản trị viên phân bổ lớp học cho tài khoản của bạn, các lớp học tương ứng sẽ xuất hiện tại đây.'}
            </p>
          </div>
        )
      ) : (
        <section className="materials-section glass-panel">
          <div className="personal-materials-header">
            <h3>Tài liệu cá nhân của tôi</h3>
            <button className="upload-btn" onClick={() => setShowUploadModal(true)}>
              <Plus size={16} />
              <Upload size={14} />
              <span>Tải lên tài liệu cá nhân</span>
            </button>
          </div>

          <div className="materials-list">
            {filteredPersonalMaterials.map(m => (
              <div key={m.id} className="material-item-row glass-panel local-material">
                <div className="material-info">
                  {getMaterialIcon(m.fileType)}
                  <div className="material-title-group">
                    <span className="material-title">{m.title}</span>
                    <span className="material-filename">{m.fileName}</span>
                    <span className="material-uploader">Tải lên lúc: {new Date(m.uploadedAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <span className="material-size">{m.fileSize}</span>
                </div>
                <div className="material-actions">
                  <a 
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${m.filePath}?view=true&token=${token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn-icon view-btn"
                    title="Xem tài liệu"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Eye size={14} />
                  </a>
                  <a 
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${m.filePath}?token=${token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn-icon"
                    title="Tải xuống"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                  </a>
                  {canShareMaterials && (
                    <button 
                      className="download-btn-icon share-btn" 
                      title="Chia sẻ vào khóa học"
                      onClick={() => setShareMaterialId(m.id)}
                    >
                      <Share2 size={14} />
                    </button>
                  )}
                  <button 
                    className="delete-btn-icon text-danger" 
                    title="Xóa tài liệu"
                    onClick={() => handleDeleteMaterial(m.id, true)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {filteredPersonalMaterials.length === 0 && (
              <div className="empty-materials-state animate-fade-in">
                <div className="empty-state-icon-box">
                  <Folder size={36} />
                </div>
                <h4>{searchQuery ? 'Không tìm thấy tài liệu phù hợp' : `Kho tài liệu cá nhân của ${pronoun} đang trống`}</h4>
                <p>
                  {searchQuery 
                    ? 'Hãy thử tìm kiếm với các từ khóa khác.'
                    : 'Tải lên bài giảng, PDF, slide hoặc hình ảnh để quản lý tập trung và an toàn hơn.'}
                </p>
                {!searchQuery && (
                  <button className="upload-btn primary-cta-btn" onClick={() => setShowUploadModal(true)} style={{ margin: '1rem auto 0' }}>
                    <Plus size={16} />
                    <Upload size={14} />
                    <span>Tải tài liệu lên</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Modal Tải lên tài liệu cho Tab Cá Nhân */}
      {showUploadModal && activeTab === 'personal' && createPortal(
        <div className="modal-overlay animate-fade-in" onClick={closeModal}>
          <div className="modal-content glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tải lên tài liệu cá nhân</h3>
              <button className="close-btn-icon" onClick={closeModal} title="Đóng" disabled={isUploading}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <div className="form-group">
                <label htmlFor="material-title">Tên tài liệu hiển thị *</label>
                <input
                  id="material-title"
                  type="text"
                  placeholder="Ví dụ: Tài liệu ôn thi riêng tư..."
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="material-type">Loại tài liệu</label>
                <select
                  id="material-type"
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value as any)}
                  disabled={isUploading}
                >
                  <option value="pdf">Tài liệu PDF (.pdf)</option>
                  <option value="slide">Bài giảng PowerPoint (.ppt, .pptx)</option>
                  <option value="video">Video bài giảng (.mp4, .webm)</option>
                  <option value="image">Hình ảnh minh họa (.png, .jpg)</option>
                </select>
              </div>

              <div 
                className={`drag-drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''} ${isUploading ? 'disabled' : ''}`}
                onDragEnter={isUploading ? undefined : handleDrag}
                onDragOver={isUploading ? undefined : handleDrag}
                onDragLeave={isUploading ? undefined : handleDrag}
                onDrop={isUploading ? undefined : handleDrop}
                onClick={isUploading ? undefined : triggerFileInput}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-input-hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.odp,.mp4,.webm,.avi,.mov,.png,.jpg,.jpeg,.gif,.svg,.webp"
                  disabled={isUploading}
                />
                
                {selectedFile ? (
                  <div className="selected-file-info animate-fade-in">
                    {getMaterialIcon(uploadType)}
                    <div className="file-meta">
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    {!isUploading && (
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
                    )}
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
                <button type="button" className="cancel-btn" onClick={closeModal} disabled={isUploading}>
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={!selectedFile || !uploadTitle.trim() || isUploading}
                >
                  {isUploading ? 'Đang tải lên...' : 'Bắt đầu tải lên'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal chia sẻ tài liệu vào khóa học */}
      {shareMaterialId && createPortal(
        <div className="modal-overlay animate-fade-in" onClick={() => setShareMaterialId(null)}>
          <div className="modal-content glass-panel animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Chia sẻ tài liệu vào khóa học</h3>
              <button className="close-btn-icon" onClick={() => setShareMaterialId(null)} title="Đóng">
                <X size={18} />
              </button>
            </div>
            <div className="share-course-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                Chọn một khóa học dưới đây để chia sẻ tài liệu này. Tất cả học sinh và giáo viên thuộc khóa học sẽ được quyền đọc/tải tài liệu.
              </p>
              {scopedCourses.map(c => (
                <button 
                  key={c.id} 
                  type="button"
                  className="share-course-item-row"
                  onClick={async () => {
                    try {
                      await api.shareMaterial(shareMaterialId, c.id);
                      alert(`Chia sẻ thành công tài liệu vào khóa học: ${c.name} 🎉`);
                      setShareMaterialId(null);
                      await refreshLmsData();
                    } catch (err) {
                      alert('Không thể chia sẻ tài liệu: ' + (err instanceof Error ? err.message : String(err)));
                    }
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--text-primary)' }}>{c.name}</strong>
                    <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mã lớp: {c.code} • Giáo viên: {c.teacher}</small>
                  </div>
                </button>
              ))}
              {scopedCourses.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  {capitalizedPronoun} chưa tham gia hay quản lý khóa học nào để thực hiện chia sẻ.
                </p>
              )}
            </div>
            <div className="modal-actions-footer" style={{ marginTop: '1rem' }}>
              <button type="button" className="cancel-btn" onClick={() => setShareMaterialId(null)} style={{ width: '100%' }}>
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
