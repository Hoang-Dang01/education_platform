import React, { useMemo } from 'react';
import { useMeeting } from '../../../context/MeetingContext';
import { useAuth } from '../../../context/AuthContext';
import { isInstructor, can } from '../../../lib/roles';
import { computeSpotlightParticipant } from '../../../lib/layout';
import { VideoCard } from '../shared/VideoCard';
import './FocusLayout.css';

export const FocusLayout: React.FC = () => {
  const { participants, dominantSpeakerId, muteParticipant, lowerParticipantHand } = useMeeting();
  const { user } = useAuth();
  const role = user?.role || 'student';

  const canSeeAllTelemetry = useMemo(() => isInstructor(role as any), [role]);
  const canMuteOrLowerHand = useMemo(() => can(role as any, 'host_session'), [role]);

  // Determine who should be in spotlight
  const spotlightParticipant = useMemo(() => {
    return computeSpotlightParticipant(participants, dominantSpeakerId);
  }, [participants, dominantSpeakerId]);

  // Other participants list
  const sideParticipants = useMemo(() => {
    if (!spotlightParticipant) return participants;
    return participants.filter(p => p.id !== spotlightParticipant.id);
  }, [participants, spotlightParticipant]);

  if (participants.length === 0) return null;

  return (
    <div className="focus-layout-container animate-fade-in">
      {/* Spotlight large panel */}
      <div className="spotlight-wrapper">
        {spotlightParticipant && (
          <VideoCard
            participant={spotlightParticipant}
            isSpeaking={
              dominantSpeakerId === spotlightParticipant.id ||
              (spotlightParticipant.isLocal && dominantSpeakerId === 'local-user')
            }
            canSeeAllTelemetry={canSeeAllTelemetry}
            canMuteOrLowerHand={canMuteOrLowerHand}
            onMute={muteParticipant}
            onLowerHand={lowerParticipantHand}
          />
        )}
      </div>

      {/* Side strip list (only if other participants exist) */}
      {sideParticipants.length > 0 && (
        <div className="side-strip-container">
          <div className="side-strip-scrollable">
            {sideParticipants.map((p) => {
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
      )}
    </div>
  );
};
