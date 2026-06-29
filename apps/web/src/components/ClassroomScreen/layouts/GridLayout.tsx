import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMeeting } from '../../../context/MeetingContext';
import { useAuth } from '../../../context/AuthContext';
import { isInstructor, can } from '../../../lib/roles';
import { computeOptimalGrid } from '../../../lib/layout';
import { VideoCard } from '../shared/VideoCard';

export const GridLayout: React.FC = () => {
  const { participants, dominantSpeakerId, muteParticipant, lowerParticipantHand } = useMeeting();
  const { user } = useAuth();
  const role = user?.role || 'student';

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timeoutId: any;

    const observer = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({ width, height });
      }, 100);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const canSeeAllTelemetry = useMemo(() => isInstructor(role as any), [role]);
  const canMuteOrLowerHand = useMemo(() => can(role as any, 'host_session'), [role]);

  const gridConfig = useMemo(() => {
    // Subtract some padding to be safe
    const paddingOffset = 16;
    const viewport = {
      width: Math.max(0, dimensions.width - paddingOffset),
      height: Math.max(0, dimensions.height - paddingOffset),
    };
    return computeOptimalGrid(participants.length, viewport, 12, 16 / 9);
  }, [participants.length, dimensions]);

  return (
    <div
      ref={containerRef}
      className="grid-layout-container"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'center',
        gap: '12px',
        width: '100%',
        height: '100%',
        padding: '0.5rem',
      }}
    >
      {participants.map((p) => {
        const isSpeaking = dominantSpeakerId === p.id || (p.isLocal && dominantSpeakerId === 'local-user');
        
        const cardStyle = gridConfig.cardWidth > 0 ? {
          width: `${gridConfig.cardWidth}px`,
          height: `${gridConfig.cardHeight}px`,
        } : {};

        return (
          <VideoCard
            key={p.id}
            participant={p}
            isSpeaking={isSpeaking}
            canSeeAllTelemetry={canSeeAllTelemetry}
            canMuteOrLowerHand={canMuteOrLowerHand}
            onMute={muteParticipant}
            onLowerHand={lowerParticipantHand}
            style={cardStyle}
          />
        );
      })}
    </div>
  );
};
