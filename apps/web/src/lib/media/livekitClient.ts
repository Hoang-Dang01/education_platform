import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  RemoteTrackPublication, 
  RemoteTrack, 
  ConnectionQuality,
  TrackPublication
} from 'livekit-client';
import type { MediaClient, MediaClientCallbacks, MediaTrack } from './media-client.interface';

class LiveKitTrackAdapter implements MediaTrack {
  private lkTrack: any;
  private customIsLocal: boolean;
  private participantId: string;
  private customSource?: string;

  constructor(lkTrack: any, isLocal: boolean, participantId: string, source?: string) {
    this.lkTrack = lkTrack;
    this.customIsLocal = isLocal;
    this.participantId = participantId;
    this.customSource = source;
  }

  getType(): 'audio' | 'video' {
    return this.lkTrack?.kind === 'video' ? 'video' : 'audio';
  }

  isLocal(): boolean {
    return this.customIsLocal;
  }

  getParticipantId(): string {
    return this.participantId;
  }

  getVideoType?(): 'camera' | 'desktop' {
    const src = this.customSource || this.lkTrack?.source;
    return src === 'screen_share' || src === 'desktop' ? 'desktop' : 'camera';
  }

  attach(element: any): void {
    if (this.lkTrack && typeof this.lkTrack.attach === 'function') {
      console.log(`[LiveKitTrackAdapter] Attaching track ${this.lkTrack.kind} (${this.getVideoType?.()}) to element`);
      this.lkTrack.attach(element);
    } else {
      console.warn('[LiveKitTrackAdapter] Cannot attach track: attach method is missing');
    }
  }

  detach(element: any): void {
    if (this.lkTrack && typeof this.lkTrack.detach === 'function') {
      console.log(`[LiveKitTrackAdapter] Detaching track ${this.lkTrack.kind}`);
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

  /**
   * Safely parses participant metadata.
   */
  private getParticipantMeta(participant: RemoteParticipant): { role: string; name?: string } {
    if (!participant || !participant.metadata) return { role: 'student' };
    try {
      const parsed = JSON.parse(participant.metadata);
      return {
        role: parsed.role ?? 'student',
        name: parsed.name
      };
    } catch (e) {
      console.warn('[LiveKitClient] Failed to parse participant metadata:', e);
      return { role: 'student' };
    }
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

        // Sync existing remote participants
        room.remoteParticipants.forEach((participant) => {
          console.log('[LiveKitClient] Syncing existing participant:', participant.identity);
          const meta = this.getParticipantMeta(participant);
          callbacks?.onParticipantJoined?.(
            participant.identity,
            participant.name || meta.name || 'Người dùng LiveKit',
            meta.role as any
          );
        });

        // Publish local camera and mic tracks
        room.localParticipant.enableCameraAndMicrophone()
          .then(() => {
            console.log('[LiveKitClient] Local camera and microphone enabled successfully.');
            const tracks: any[] = [];
            (room.localParticipant as any).videoTracks.forEach((pub: any) => {
              if (pub.track) {
                console.log('[LiveKitClient] Packaging local video track:', pub.track.sid);
                tracks.push(new LiveKitTrackAdapter(
                  pub.track,
                  true,
                  'local-user',
                  pub.source
                ));
              }
            });
            (room.localParticipant as any).audioTracks.forEach((pub: any) => {
              if (pub.track) {
                console.log('[LiveKitClient] Packaging local audio track:', pub.track.sid);
                tracks.push(new LiveKitTrackAdapter(
                  pub.track,
                  true,
                  'local-user',
                  pub.source
                ));
              }
            });
            callbacks.onLocalTracksReady(tracks);
          })
          .catch(err => {
            console.warn('[LiveKitClient] Camera or microphone not available, joining as listener only:', err);
            callbacks.onLocalTracksReady([]);
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
        this.callbacks?.onConnectionStatsReceived('local-user', {
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
      const meta = this.getParticipantMeta(participant);
      this.callbacks?.onParticipantJoined?.(
        participant.identity,
        participant.name || meta.name || 'Người dùng LiveKit',
        meta.role as any
      );
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('[LiveKitClient] Participant disconnected:', participant.identity);
      this.callbacks?.onParticipantLeft(participant.identity);
    });

    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('[LiveKitClient] Track subscribed:', track.kind, 'from', participant.identity);
      
      // Ensure participant exists with correct metadata before track is added
      const meta = this.getParticipantMeta(participant);
      this.callbacks?.onParticipantJoined?.(
        participant.identity,
        participant.name || meta.name || 'Người dùng LiveKit',
        meta.role as any
      );

      const adaptedTrack = new LiveKitTrackAdapter(
        track,
        false,
        participant.identity,
        publication.source
      );
      this.callbacks?.onTrackAdded(adaptedTrack);
    });

    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('[LiveKitClient] Track unsubscribed:', track.kind, 'from', participant.identity);
      const adaptedTrack = new LiveKitTrackAdapter(
        track,
        false,
        participant.identity,
        publication.source
      );
      this.callbacks?.onTrackRemoved(adaptedTrack);
    });

    // Handle local publication updates to prevent ghost videos
    room.on(RoomEvent.LocalTrackPublished, (publication: TrackPublication) => {
      if (publication.track) {
        console.log('[LiveKitClient] Local track published:', publication.track.kind);
        const adaptedTrack = new LiveKitTrackAdapter(
          publication.track,
          true,
          'local-user',
          publication.source
        );
        this.callbacks?.onTrackAdded(adaptedTrack);
      }
    });

    room.on(RoomEvent.LocalTrackUnpublished, (publication: TrackPublication) => {
      console.log('[LiveKitClient] Local track unpublished:', publication.kind);
      const adaptedTrack = new LiveKitTrackAdapter(
        publication.track,
        true,
        'local-user',
        publication.source
      );
      this.callbacks?.onTrackRemoved(adaptedTrack);
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      if (speakers.length > 0) {
        const activeId = speakers[0].isLocal ? 'local-user' : speakers[0].identity;
        this.callbacks?.onDominantSpeakerChanged(activeId);
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
          this.callbacks?.onHandRaiseChanged('local-user', false);
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
      
      this.callbacks?.onHandRaiseChanged('local-user', isRaised);
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
      console.log('[LiveKitClient] Screen share started successfully. Packaging track.');
      return new LiveKitTrackAdapter(
        publication.track,
        true,
        this.room.localParticipant.identity,
        'screen_share'
      );
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
