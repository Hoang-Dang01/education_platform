import React, { useEffect, useRef } from 'react';
import type { Participant } from '../../../context/ClassContext';
import type { MediaTrack } from '../../../lib/media/media-client.interface';
import { Mic, MicOff, Hand, Sparkles, Wifi, ShieldAlert, VolumeX, Monitor, Laptop, Tablet, Smartphone } from 'lucide-react';
import { isInstructor, roleLabel } from '../../../lib/roles';
import type { DeviceType } from '../../../lib/mockData';
import '../../VideoGrid/VideoGrid.css';

const deviceIcon = (d?: DeviceType) => {
  switch (d) {
    case 'desktop': return <Monitor size={12} />;
    case 'laptop': return <Laptop size={12} />;
    case 'tablet': return <Tablet size={12} />;
    case 'mobile': return <Smartphone size={12} />;
    default: return null;
  }
};

export interface MediaTrackProps {
  track: MediaTrack;
  className?: string;
  isMuted?: boolean;
}

export const MediaTrackRenderer: React.FC<MediaTrackProps> = ({ track, className, isMuted = false }) => {
  const elementRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !track) return;

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
    default:
      return <span title="Kết nối: Xuất sắc"><Wifi size={14} className="quality-excellent" /></span>;
  }
};

export interface VideoCardProps {
  participant: Participant;
  isSpeaking: boolean;
  canSeeAllTelemetry: boolean;
  canMuteOrLowerHand: boolean;
  onMute: (id: string) => void;
  onLowerHand: (id: string) => void;
  style?: React.CSSProperties;
}

const VideoCardComponent: React.FC<VideoCardProps> = ({
  participant: p,
  isSpeaking,
  canSeeAllTelemetry,
  canMuteOrLowerHand,
  onMute,
  onLowerHand,
  style,
}) => {
  const isWebcamActive = !p.isVideoMuted && p.videoTrack;

  return (
    <div
      style={style}
      className={`video-card glass-panel ${p.isLocal ? 'local-card' : ''} ${
        isSpeaking ? 'active-speaker' : ''
      }`}
    >
      {/* Audio track rendering for remote peers */}
      {!p.isLocal && p.audioTrack && (
        <MediaTrackRenderer track={p.audioTrack} isMuted={p.isAudioMuted} />
      )}

      {/* Video view: Jitsi track feed or avatar placeholder */}
      {isWebcamActive ? (
        <MediaTrackRenderer
          track={p.videoTrack}
          isMuted={p.isLocal}
          className="card-video-feed"
        />
      ) : (
        <div className="card-avatar-wrapper">
          <div className={`avatar-circle ${isInstructor(p.role) ? 'teacher-avatar' : ''}`}>
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
        {isInstructor(p.role) && (
          <div className="teacher-badge">
            <Sparkles size={12} />
            <span>{roleLabel(p.role)}</span>
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

      {/* Administrative overlays */}
      {canMuteOrLowerHand && !p.isLocal && (
        <div className="teacher-action-overlay">
          {!p.isAudioMuted && (
            <button
              onClick={() => onMute(p.id)}
              className="action-btn text-danger"
              title="Tắt tiếng học sinh"
            >
              <VolumeX size={14} />
              <span>Tắt tiếng</span>
            </button>
          )}
          {p.isHandRaised && (
            <button
              onClick={() => onLowerHand(p.id)}
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
        <div className="card-meta">
          {p.device && (canSeeAllTelemetry || p.isLocal) && (
            <span className="device-tag" title={p.networkLabel || p.network}>
              {deviceIcon(p.device)}
              {p.network && <Wifi size={12} />}
            </span>
          )}
          <div className="quality-badge">{getQualityIcon(p.connectionQuality)}</div>
        </div>
      </div>

      {/* Telemetry real-time on hover */}
      {p.latency !== undefined && (canSeeAllTelemetry || p.isLocal) && (
        <div className="card-telemetry">
          <span title="Độ trễ">{p.latency}ms</span>
          <span title="Mất gói">{p.packetLoss ?? 0}%</span>
          {p.jitter !== undefined && <span title="Jitter">{p.jitter}ms</span>}
          {p.framerate ? <span title="FPS">{p.framerate}fps</span> : null}
        </div>
      )}
    </div>
  );
};

export const VideoCard = React.memo(VideoCardComponent);
