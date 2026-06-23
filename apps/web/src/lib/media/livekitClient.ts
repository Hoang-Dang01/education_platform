import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  RemoteTrackPublication, 
  RemoteTrack, 
  ConnectionQuality,
  LocalParticipant,
  TrackPublication
} from 'livekit-client';
import type { MediaClient, MediaClientCallbacks, MediaTrack } from './media-client.interface';

class LiveKitTrackAdapter implements MediaTrack {
  private lkTrack: any;
  constructor(lkTrack: any) {
    this.lkTrack = lkTrack;
  }

  getType(): 'audio' | 'video' {
    return this.lkTrack.kind === 'video' ? 'video' : 'audio';
  }

  isLocal(): boolean {
    return this.lkTrack.isLocal ?? false;
  }

  getParticipantId(): string {
    return this.lkTrack.participantIdentity || '';
  }

  getVideoType?(): 'camera' | 'desktop' {
    return this.lkTrack.source === 'screen_share' ? 'desktop' : 'camera';
  }

  attach(element: any): void {
    if (this.lkTrack.attach) {
      this.lkTrack.attach(element);
    }
  }

  detach(element: any): void {
    if (this.lkTrack.detach) {
      this.lkTrack.detach(element);
    }
  }
}

export class LiveKitClient implements MediaClient {
  private room: Room | null = null;
  private callbacks: MediaClientCallbacks | null = null;
  private statsInterval: any = null;

  /**
   * Helper to retrieve WebRTC peer connection safely, isolating SDK private APIs.
   */
  private getPeerConnection(): RTCPeerConnection | null {
    if (!this.room) return null;
    return (this.room as any).engine?.pc ?? null;
  }

  /**
   * Helper to retrieve RTT ping securely.
   */
  private getRoomPing(): number {
    return (this.room as any)?.ping ?? 30;
  }

  public connect(
    roomName: string,
    _userName: string,
    _role: string,
    callbacks: MediaClientCallbacks,
    token?: string,
    serverUrl?: string
  ): void {
    this.callbacks = callbacks;
    if (!token || !serverUrl) {
      console.error('[LiveKitClient] Token or ServerUrl missing.');
      callbacks.onConnectionFailed('Token hoặc ServerUrl của LiveKit bị thiếu.');
      return;
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    this.room = room;

    this.setupRoomListeners(room);

    room.connect(serverUrl, token)
      .then(() => {
        console.log('[LiveKitClient] Connected to LiveKit Room:', roomName);
        callbacks.onConferenceJoined();

        // Publish local camera and mic tracks
        room.localParticipant.enableCameraAndMicrophone()
          .then(() => {
            const tracks: any[] = [];
            (room.localParticipant as any).videoTracks.forEach((pub: any) => {
              if (pub.track) {
                tracks.push(new LiveKitTrackAdapter({
                  ...pub.track,
                  isLocal: true,
                  participantIdentity: room.localParticipant.identity
                }));
              }
            });
            (room.localParticipant as any).audioTracks.forEach((pub: any) => {
              if (pub.track) {
                tracks.push(new LiveKitTrackAdapter({
                  ...pub.track,
                  isLocal: true,
                  participantIdentity: room.localParticipant.identity
                }));
              }
            });
            callbacks.onLocalTracksReady(tracks);
          })
          .catch(err => {
            console.error('[LiveKitClient] Error enabling camera/mic:', err);
            callbacks.onConnectionFailed(err.toString());
          });

        // Setup real-time WebRTC stats aggregator
        this.startStatsAggregator(room);
      })
      .catch(err => {
        console.error('[LiveKitClient] Connection failed:', err);
        callbacks.onConnectionFailed(err.toString());
      });
  }

  private stopStatsAggregator() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  private startStatsAggregator(room: Room) {
    this.stopStatsAggregator();
    this.statsInterval = setInterval(async () => {
      if (!room || room.state !== 'connected') return;

      const pc = this.getPeerConnection();
      const ping = this.getRoomPing();

      try {
        let totalLoss = 0;
        let jitter = 0;

        if (pc) {
          const statsReport = await pc.getStats();
          statsReport.forEach((report: any) => {
            if (report.type === 'inbound-rtp' && (report.kind === 'video' || report.kind === 'audio')) {
              totalLoss += report.packetsLost ?? 0;
              jitter = Math.max(jitter, (report.jitter ?? 0) * 1000); // convert to ms
            }
          });
        }

        // Report stats for local participant
        this.callbacks?.onConnectionStatsReceived(room.localParticipant.identity, {
          latency: ping,
          packetLoss: totalLoss,
          jitter: Math.round(jitter),
        });

        // Report stats for remote peers estimated via connection quality
        room.remoteParticipants.forEach(p => {
          let estimatedLatency = ping + 10;
          let estimatedLoss = 0;
          let estimatedJitter = 2;

          if (p.connectionQuality === ConnectionQuality.Poor) {
            estimatedLatency = ping + 150;
            estimatedLoss = 5;
            estimatedJitter = 25;
          } else if (p.connectionQuality === ConnectionQuality.Lost) {
            estimatedLatency = ping + 300;
            estimatedLoss = 15;
            estimatedJitter = 60;
          }

          this.callbacks?.onConnectionStatsReceived(p.identity, {
            latency: estimatedLatency,
            packetLoss: estimatedLoss,
            jitter: estimatedJitter,
          });
        });
      } catch (e) {
        console.warn('[LiveKitClient] Failed to gather peer connection stats:', e);
      }
    }, 3000);
  }

  private setupRoomListeners(room: Room) {
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('[LiveKitClient] Participant connected:', participant.identity);
      this.callbacks?.onParticipantJoined(
        participant.identity,
        participant.name || 'Người dùng LiveKit',
        'student'
      );
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('[LiveKitClient] Participant disconnected:', participant.identity);
      this.callbacks?.onParticipantLeft(participant.identity);
    });

    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('[LiveKitClient] Track subscribed:', track.kind, 'from', participant.identity);
      const adaptedTrack = new LiveKitTrackAdapter({
        ...track,
        participantIdentity: participant.identity,
        source: publication.source
      });
      this.callbacks?.onTrackAdded(adaptedTrack);
    });

    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('[LiveKitClient] Track unsubscribed:', track.kind, 'from', participant.identity);
      const adaptedTrack = new LiveKitTrackAdapter({
        ...track,
        participantIdentity: participant.identity,
        source: publication.source
      });
      this.callbacks?.onTrackRemoved(adaptedTrack);
    });

    // Handle local publication updates to prevent ghost videos
    room.on(RoomEvent.LocalTrackPublished, (publication: TrackPublication, participant: LocalParticipant) => {
      if (publication.track) {
        const adaptedTrack = new LiveKitTrackAdapter({
          ...publication.track,
          isLocal: true,
          participantIdentity: participant.identity
        });
        this.callbacks?.onTrackAdded(adaptedTrack);
      }
    });

    room.on(RoomEvent.LocalTrackUnpublished, (publication: TrackPublication, participant: LocalParticipant) => {
      const adaptedTrack = new LiveKitTrackAdapter({
        ...publication.track,
        isLocal: true,
        participantIdentity: participant.identity
      });
      this.callbacks?.onTrackRemoved(adaptedTrack);
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      if (speakers.length > 0) {
        this.callbacks?.onDominantSpeakerChanged(speakers[0].identity);
      }
    });

    // Handle Auto-reconnect lifecycle to ensure telemetry uptime
    room.on(RoomEvent.Reconnecting, () => {
      console.log('[LiveKitClient] Reconnecting to room. Pausing stats aggregator.');
      this.stopStatsAggregator();
      this.callbacks?.onConnectionReconnecting?.();
    });

    room.on(RoomEvent.Reconnected, () => {
      console.log('[LiveKitClient] Reconnected to room. Restarting stats aggregator.');
      this.startStatsAggregator(room);
      this.callbacks?.onConnectionReconnected?.();
    });

    room.on(RoomEvent.Disconnected, () => {
      console.log('[LiveKitClient] Disconnected from room.');
      this.stopStatsAggregator();
      this.callbacks?.onConnectionDisconnected();
    });

    // Handle Data Channel Messages (signaling hand raise, chat, etc.)
    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      if (!participant) return;
      try {
        const textDecoder = new TextDecoder();
        const data = JSON.parse(textDecoder.decode(payload));
        if (data.action === 'handRaise') {
          this.callbacks?.onHandRaiseChanged(participant.identity, !!data.isRaised);
        } else if (data.action === 'chat') {
          this.callbacks?.onChatMessageReceived(
            participant.identity,
            data.senderName || participant.name || 'Người dùng',
            data.text,
            new Date()
          );
        } else if (data.action === 'lowerHand' && data.targetId === room.localParticipant.identity) {
          this.callbacks?.onHandRaiseChanged(room.localParticipant.identity, false);
        }
      } catch (err) {
        console.error('[LiveKitClient] Error parsing data channel message:', err);
      }
    });
  }

  public disconnect(): void {
    this.stopStatsAggregator();
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
  }

  public setAudioMuted(isMuted: boolean): void {
    if (this.room) {
      this.room.localParticipant.setMicrophoneEnabled(!isMuted)
        .catch(err => console.error('[LiveKitClient] Error toggling mic:', err));
    }
  }

  public setVideoMuted(isMuted: boolean): void {
    if (this.room) {
      this.room.localParticipant.setCameraEnabled(!isMuted)
        .catch(err => console.error('[LiveKitClient] Error toggling camera:', err));
    }
  }

  public setHandRaised(isRaised: boolean): void {
    if (this.room) {
      const payload = JSON.stringify({ action: 'handRaise', isRaised });
      const encoder = new TextEncoder();
      this.room.localParticipant.publishData(encoder.encode(payload), { reliable: true })
        .catch(err => console.error('[LiveKitClient] Error publishing hand raise:', err));
      
      this.callbacks?.onHandRaiseChanged(this.room.localParticipant.identity, isRaised);
    }
  }

  public sendChatMessage(text: string): void {
    if (this.room) {
      const payload = JSON.stringify({ action: 'chat', text, senderName: this.room.localParticipant.name });
      const encoder = new TextEncoder();
      this.room.localParticipant.publishData(encoder.encode(payload), { reliable: true })
        .catch(err => console.error('[LiveKitClient] Error sending chat message:', err));
    }
  }

  public lowerParticipantHand(id: string): void {
    if (this.room) {
      const payload = JSON.stringify({ action: 'lowerHand', targetId: id });
      const encoder = new TextEncoder();
      this.room.localParticipant.publishData(encoder.encode(payload), { reliable: true })
        .catch(err => console.error('[LiveKitClient] Error lower participant hand command:', err));
    }
  }

  public async startScreenShare(): Promise<any> {
    if (!this.room) throw new Error('Room is not connected.');
    try {
      const publication = await this.room.localParticipant.setScreenShareEnabled(true);
      if (!publication || !publication.track) {
        throw new Error('Không thể khởi tạo track chia sẻ màn hình.');
      }
      return new LiveKitTrackAdapter({
        ...publication.track,
        participantIdentity: this.room.localParticipant.identity,
        source: 'screen_share'
      });
    } catch (err) {
      console.error('[LiveKitClient] Error starting screen share:', err);
      throw err;
    }
  }

  public async stopScreenShare(): Promise<void> {
    if (!this.room) return;
    try {
      await this.room.localParticipant.setScreenShareEnabled(false);
    } catch (err) {
      console.error('[LiveKitClient] Error stopping screen share:', err);
      throw err;
    }
  }
}
