import React, { useMemo, useEffect, useRef } from 'react';
import { useMeeting } from '../../../context/MeetingContext';
import { useAuth } from '../../../context/AuthContext';
import { isInstructor, can } from '../../../lib/roles';
import { VideoCard, MediaTrackRenderer } from '../shared/VideoCard';
import { Presentation, MonitorUp } from 'lucide-react';
import './FocusLayout.css'; // Reuses FocusLayout side-strip styles

const ScreenShareVideoElement: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline muted className="real-screen-feed" />;
};

export const ScreenShareLayout: React.FC = () => {
  const {
    participants,
    dominantSpeakerId,
    screenTrack,
    screenStream,
    screenSharingUserId,
    muteParticipant,
    lowerParticipantHand,
  } = useMeeting();
  
  const { user } = useAuth();
  const role = user?.role || 'student';

  const canSeeAllTelemetry = useMemo(() => isInstructor(role as any), [role]);
  const canMuteOrLowerHand = useMemo(() => can(role as any, 'host_session'), [role]);

  const screenSharingParticipant = useMemo(() => {
    return participants.find(p => p.id === screenSharingUserId);
  }, [participants, screenSharingUserId]);

  const screenSharingUserName = screenSharingParticipant ? screenSharingParticipant.name : 'Giảng viên';
  const isLocalScreenSharing = screenSharingUserId === 'local-user' || screenStream !== null;

  const renderSharedContent = () => {
    if (screenTrack) {
      return <MediaTrackRenderer track={screenTrack} className="real-screen-feed" />;
    }
    if (screenStream) {
      return <ScreenShareVideoElement stream={screenStream} />;
    }
    return (
      <div className="shared-screen-mock" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
        <Presentation size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Không tìm thấy luồng trình chiếu</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang chờ giảng viên kết nối thiết bị hoặc cấp quyền...</p>
      </div>
    );
  };

  return (
    <div className="focus-layout-container screen-share-split-layout animate-fade-in">
      {/* Large shared viewport container */}
      <div className="shared-viewport-container glass-panel flex-1">
        {renderSharedContent()}
        <div className="viewport-overlay-indicator">
          <MonitorUp size={16} />
          <span>
            {isLocalScreenSharing
              ? 'Bạn đang chia sẻ màn hình'
              : `Màn hình trình chiếu của ${screenSharingUserName}`}
          </span>
        </div>
      </div>

      {/* Side list column of other participants */}
      <div className="side-strip-container">
        <div className="side-strip-scrollable">
          {participants.map((p) => {
            const isSpeaking = dominantSpeakerId === p.id || (p.isLocal && dominantSpeakerId === 'local-user');
            return (
              <div key={p.id} className="side-strip-card-wrapper">
                <VideoCard
                  participant={p}
                  isSpeaking={isSpeaking}
                  canSeeAllTelemetry={canSeeAllTelemetry}
                  canMuteOrLowerHand={canMuteOrLowerHand}
                  onMute={muteParticipant}
                  onLowerHand={lowerParticipantHand}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
