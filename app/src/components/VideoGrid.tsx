import React, { useEffect, useRef } from 'react';
import { useClass } from '../context/ClassContext';
import type { Participant } from '../context/ClassContext';
import { Mic, MicOff, Hand, Sparkles, Wifi, ShieldAlert, VolumeX } from 'lucide-react';
import './VideoGrid.css';

// Sub-component to safely handle HTML5 track attachments
interface JitsiTrackProps {
  track: any;
  className?: string;
  isMuted?: boolean;
}

const JitsiTrack: React.FC<JitsiTrackProps> = ({ track, className, isMuted = false }) => {
  const elementRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !track) return;

    // Attach Jitsi track to HTML element
    track.attach(el);

    return () => {
      try {
        track.detach(el);
      } catch (e) {
        console.error('Error detaching track:', e);
      }
    };
  }, [track]);

  if (track.getType() === 'video') {
    return (
      <video
        ref={elementRef as React.RefObject<HTMLVideoElement>}
        autoPlay
        playsInline
        muted={isMuted}
        className={className}
      />
    );
  } else {
    // Audio elements don't need styling class
    return (
      <audio
        ref={elementRef as React.RefObject<HTMLAudioElement>}
        autoPlay
        playsInline
        muted={isMuted}
      />
    );
  }
};

export const VideoGrid: React.FC = () => {
  const { participants, role, muteParticipant, lowerParticipantHand, dominantSpeakerId } = useClass();

  // Determine grid template style depending on participant counts
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2-rows-2';
    if (count <= 6) return 'grid-cols-3-rows-2';
    return 'grid-cols-auto';
  };

  const getQualityIcon = (quality: Participant['connectionQuality']) => {
    switch (quality) {
      case 'excellent':
        return <span title="Kết nối: Xuất sắc"><Wifi size={14} className="quality-excellent" /></span>;
      case 'good':
        return <span title="Kết nối: Tốt"><Wifi size={14} className="quality-good" /></span>;
      case 'poor':
        return <span title="Kết nối: Yếu"><Wifi size={14} className="quality-poor" /></span>;
      case 'critical':
        return <span title="Kết nối: Rất yếu"><ShieldAlert size={14} className="quality-critical" /></span>;
    }
  };

  return (
    <div className={`video-grid-container ${getGridClass(participants.length)}`}>
      {participants.map(p => {
        // Highlight active speaker
        const isSpeaking = dominantSpeakerId === p.id || (p.isLocal && dominantSpeakerId === 'local-user');
        
        return (
          <div
            key={p.id}
            className={`video-card glass-panel ${p.isLocal ? 'local-card' : ''} ${
              isSpeaking ? 'active-speaker' : ''
            }`}
          >
            {/* Audio track rendering (only for remote peers to avoid echoing local microphone) */}
            {!p.isLocal && p.audioTrack && (
              <JitsiTrack track={p.audioTrack} isMuted={p.isAudioMuted} />
            )}

            {/* Video view: Jitsi track feed or avatar placeholder */}
            {!p.isVideoMuted && p.videoTrack ? (
              <JitsiTrack
                track={p.videoTrack}
                isMuted={p.isLocal} // Local webcam stream is muted locally
                className="card-video-feed"
              />
            ) : (
              <div className="card-avatar-wrapper">
                <div className={`avatar-circle ${p.role === 'teacher' ? 'teacher-avatar' : ''}`}>
                  <span>{p.name.split(' ').pop()?.charAt(0)}</span>
                </div>
                <div className="avatar-ambient-glow"></div>
              </div>
            )}

            {/* Upper badges */}
            <div className="card-top-badges">
              {p.isHandRaised && (
                <div className="hand-badge">
                  <Hand size={14} className="hand-icon" />
                  <span>Giơ tay</span>
                </div>
              )}
              {p.role === 'teacher' && (
                <div className="teacher-badge">
                  <Sparkles size={12} />
                  <span>Giáo viên</span>
                </div>
              )}
            </div>

            {/* Mic status indicator */}
            <div className="card-mic-badge">
              {p.isAudioMuted ? (
                <div className="mic-icon muted">
                  <MicOff size={14} />
                </div>
              ) : (
                <div className="mic-icon active">
                  <Mic size={14} />
                </div>
              )}
            </div>

            {/* Teacher administrative overlays */}
            {role === 'teacher' && !p.isLocal && (
              <div className="teacher-action-overlay">
                {!p.isAudioMuted && (
                  <button
                    onClick={() => muteParticipant(p.id)}
                    className="action-btn text-danger"
                    title="Tắt tiếng học sinh"
                  >
                    <VolumeX size={14} />
                    <span>Tắt tiếng</span>
                  </button>
                )}
                {p.isHandRaised && (
                  <button
                    onClick={() => lowerParticipantHand(p.id)}
                    className="action-btn text-warning"
                    title="Hạ tay học sinh"
                  >
                    <Hand size={14} />
                    <span>Hạ tay</span>
                  </button>
                )}
              </div>
            )}

            {/* Footer labels */}
            <div className="card-info-bar">
              <span className="participant-name">
                {p.name} {p.isLocal && '(Bạn)'}
              </span>
              <div className="quality-badge">{getQualityIcon(p.connectionQuality)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
