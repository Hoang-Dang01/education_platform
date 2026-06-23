import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../context/MeetingContext';
import { useAuth } from '../../context/AuthContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Hand,
  MessageSquare,
  Users,
  PhoneOff,
  Loader2,
  Circle,
} from 'lucide-react';
import { isInstructor } from '../../lib/roles';
import { saveMaterial } from '../../lib/localDb';
import './ControlBar.css';

export const ControlBar: React.FC = () => {
  const {
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    shareApprovalPending,
    shareApproved,
    isHandRaised,
    chatOpen,
    panelOpen,
    activeTab,
    toggleAudio,
    toggleVideo,
    requestScreenShare,
    toggleHandRaise,
    toggleChat,
    togglePanel,
    setActiveTab,
    leaveSession: leaveRoom,
    raiseHandQueue,
    participants,
    screenSharingUserId,
    screenStream,
    roomName,
  } = useMeeting();

  const { user } = useAuth();
  const role = user?.role || 'student';
  const userName = user?.name || '';

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTimer = () => {
    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
    } else {
      setIsRecording(false);
      const finalSecs = recordingSeconds;
      const formattedTime = `${Math.floor(finalSecs / 60)} phút ${finalSecs % 60} giây`;
      
      const getCourseId = (room: string): string => {
        const r = room.toLowerCase();
        if (r.includes('toan')) return 'c1';
        if (r.includes('ly')) return 'c2';
        if (r.includes('hoa')) return 'c3';
        return 'c1';
      };
      
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      
      try {
        const mockVideoBlob = new Blob(["mock video stream data"], { type: 'video/mp4' });
        const courseId = getCourseId(roomName);
        
        await saveMaterial({
          id: 'rec-' + Date.now(),
          courseId: courseId,
          title: `Video ghi hình buổi học ngày ${dateStr}`,
          fileName: `ghi_hinh_${roomName}_${Date.now()}.mp4`,
          fileType: 'video',
          fileSize: `${(finalSecs * 0.12).toFixed(1)} MB`,
          fileBlob: mockVideoBlob,
          uploadedAt: today.toISOString(),
          uploadedBy: userName || 'Giáo viên',
        });
        
        alert(`Ghi hình thành công!\nBản ghi hình (${formattedTime}) đã được tự động lưu vào tài liệu môn học.`);
      } catch (err) {
        console.error('Lỗi khi lưu video ghi hình:', err);
      }
    }
  };

  const canShareDirectly = isInstructor(role);
  const isLocalSharing = screenSharingUserId === 'local-user' || screenStream !== null;

  // Nhãn nút share theo vai trò & trạng thái
  const shareTitle = isLocalSharing
    ? 'Dừng Trình Chiếu'
    : isScreenSharing
      ? 'Người khác đang trình chiếu...'
      : shareApprovalPending
        ? 'Đang chờ giảng viên duyệt...'
        : shareApproved
          ? 'Đã được duyệt — bấm để chọn màn hình'
          : canShareDirectly
            ? 'Trình Chiếu Màn Hình'
            : 'Xin phép chia sẻ màn hình';

  const shareBtnClass = isLocalSharing
    ? 'sharing'
    : isScreenSharing
      ? 'disabled'
      : shareApprovalPending
        ? 'pending'
        : shareApproved
          ? 'approved'
          : 'idle';

  // Find hand raise count
  const handRaiseCount = raiseHandQueue.length;

  // Toggle user list / attendance tab
  const handleToggleAttendance = () => {
    togglePanel();
    if (!panelOpen) {
      setActiveTab('attendance');
    } else if (activeTab === 'attendance') {
      setActiveTab('attendance');
    } else {
      setActiveTab('attendance');
    }
  };

  return (
    <div className="control-bar-wrapper">
      <div className="control-bar glass-panel">
        
        {/* Section 1: Audio / Video */}
        <div className="control-group">
          <button
            onClick={toggleAudio}
            className={`action-btn ${isAudioMuted ? 'muted' : 'active'}`}
            title={isAudioMuted ? 'Bật Micro' : 'Tắt Micro'}
          >
            {isAudioMuted ? <MicOff size={26} /> : <Mic size={26} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`action-btn ${isVideoMuted ? 'muted' : 'active'}`}
            title={isVideoMuted ? 'Bật Camera' : 'Tắt Camera'}
          >
            {isVideoMuted ? <VideoOff size={26} /> : <Video size={26} />}
          </button>
        </div>

        {/* Section 2: Shared features */}
        <div className="control-group">
          {/* Recording Button (only for teacher role) */}
          {isInstructor(role) && (
            <button
              onClick={handleToggleRecording}
              className={`action-btn ${isRecording ? 'recording-active' : 'idle'}`}
              title={isRecording ? 'Dừng Ghi Hình' : 'Bắt Đầu Ghi Hình'}
            >
              {isRecording ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="animate-pulse" style={{ width: '8px', height: '8px', background: '#ff4d4d', borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ff4d4d' }}>{formatTimer()}</span>
                </div>
              ) : (
                <Circle size={26} />
              )}
            </button>
          )}

          <button
            onClick={requestScreenShare}
            className={`action-btn ${shareBtnClass}`}
            title={shareTitle}
            disabled={shareApprovalPending || (isScreenSharing && !isLocalSharing)}
          >
            {shareApprovalPending ? <Loader2 size={26} className="spin" /> : <Monitor size={26} />}
          </button>

          <button
            onClick={toggleHandRaise}
            className={`action-btn ${isHandRaised ? 'hand-active' : 'idle'}`}
            title={isHandRaised ? 'Hạ Tay Xuống' : 'Giơ Tay Phát Biểu'}
          >
            <Hand size={26} />
            {handRaiseCount > 0 && (
              <span className="badge-counter warning">{handRaiseCount}</span>
            )}
          </button>
        </div>

        {/* Section 3: Panels Toggle */}
        <div className="control-group">
          <button
            onClick={toggleChat}
            className={`action-btn ${chatOpen && panelOpen && activeTab === 'chat' ? 'panel-active' : 'idle'}`}
            title="Trò chuyện"
          >
            <MessageSquare size={26} />
          </button>

          <button
            onClick={handleToggleAttendance}
            className={`action-btn ${panelOpen && activeTab === 'attendance' ? 'panel-active' : 'idle'}`}
            title="Thành viên & Điểm danh"
          >
            <Users size={26} />
            <span className="badge-counter info">{participants.length}</span>
          </button>
        </div>

        {/* Section 4: Exit Room */}
        <div className="control-group">
          <button
            onClick={leaveRoom}
            className="action-btn leave-btn"
            title="Rời Lớp Học"
          >
            <PhoneOff size={26} />
          </button>
        </div>

      </div>
    </div>
  );
};

