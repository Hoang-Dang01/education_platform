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
} from 'lucide-react';
import './ControlBar.css';

export const ControlBar: React.FC = () => {
  const {
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    isHandRaised,
    chatOpen,
    panelOpen,
    activeTab,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    toggleChat,
    togglePanel,
    setActiveTab,
    leaveRoom,
    raiseHandQueue,
    participants,
  } = useClass();

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
            onClick={toggleScreenShare}
            className={`action-btn ${isScreenSharing ? 'sharing' : 'idle'}`}
            title={isScreenSharing ? 'Dừng Trình Chiếu' : 'Trình Chiếu Màn Hình'}
          >
            <Monitor size={26} />
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
