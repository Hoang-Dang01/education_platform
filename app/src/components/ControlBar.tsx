import React from 'react';
import { useClass } from '../context/ClassContext';
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
} from 'lucide-react';
import { isInstructor } from '../lib/roles';
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
    role,
    toggleAudio,
    toggleVideo,
    requestScreenShare,
    toggleHandRaise,
    toggleChat,
    togglePanel,
    setActiveTab,
    leaveRoom,
    raiseHandQueue,
    participants,
    screenSharingUserId,
    screenStream,
  } = useClass();

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
      // Just close or switch
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
