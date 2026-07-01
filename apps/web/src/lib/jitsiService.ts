// @ts-ignore
import JitsiMeetJS from 'lib-jitsi-meet';
import type { UserRole } from './roles';
import { getDeviceInfo } from './deviceInfo';
import type { DeviceInfo } from './deviceInfo';
import type { MediaClient, MediaClientCallbacks } from './media/media-client.interface';

// Chỉ số telemetry đã chuẩn hoá từ stats của Jitsi (BRD 7.5)
export interface LiveStats {
  latency: number;      // ms (rtt)
  packetLoss: number;   // %
  jitter: number;       // ms (0 nếu trình duyệt không cấp)
  bitrate: number;      // Kbps (down + up)
  framerate: number;    // fps
  networkType?: string; // từ transport (wifi/ethernet/cellular...) nếu có
}

// Chuẩn hoá object stats thô của lib-jitsi-meet về LiveStats
function normalizeStats(stats: any): LiveStats {
  const transport = Array.isArray(stats?.transport) ? stats.transport[0] : undefined;
  const fpsObj = stats?.framerate || {};
  const fpsValues = Object.values(fpsObj).flatMap((v: any) => (typeof v === 'object' ? Object.values(v) : [v])) as number[];
  return {
    latency: Math.round(transport?.rtt ?? stats?.jvbRTT ?? 0),
    packetLoss: Number(stats?.packetLoss?.total ?? 0),
    jitter: Math.round(transport?.jitter ?? 0),
    bitrate: Math.round((stats?.bitrate?.download ?? 0) + (stats?.bitrate?.upload ?? 0)),
    framerate: fpsValues.length ? Math.max(...fpsValues) : 0,
    networkType: transport?.networkType,
  };
}

export class JitsiClient implements MediaClient {
  private connection: any = null;
  private conference: any = null;
  private localTracks: any[] = [];
  private localDesktopTrack: any = null;
  private callbacks: MediaClientCallbacks | null = null;
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    try {
      JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
      JitsiMeetJS.init({
        useIPv6: true,
        disableAudioLevels: false,
      });
      this.isInitialized = true;
      console.log('JitsiMeetJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize JitsiMeetJS:', error);
    }
  }

  public connect(
    roomName: string,
    userName: string,
    _role: UserRole,
    callbacks: MediaClientCallbacks,
    _token?: string,
    _serverUrl?: string
  ) {
    this.init();
    this.callbacks = callbacks;

    const normalizedRoom = roomName.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    const jitsiHost = import.meta.env.VITE_JITSI_HOST || 'meet.ffmuc.net';
    const jitsiPort = import.meta.env.VITE_JITSI_PORT || '443';

    // Xác định schema và port suffix
    const isHttps = jitsiPort === '443' || jitsiPort === '8443';
    const wsScheme = isHttps ? 'wss' : 'ws';
    const portSuffix = (isHttps && jitsiPort === '443') || (!isHttps && jitsiPort === '80')
      ? ''
      : `:${jitsiPort}`;

    // Cấu hình kết nối XMPP động
    const connectionConfig = {
      hosts: {
        domain: jitsiHost,
        muc: `conference.${jitsiHost}`,
        focus: `focus.${jitsiHost}`,
      },
      serviceUrl: `${wsScheme}://${jitsiHost}${portSuffix}/xmpp-websocket?room=${normalizedRoom}`,
      clientNode: 'http://jitsi.org/jitsimeet',
    };

    console.log(`[JitsiClient] Connecting to: ${jitsiHost}${portSuffix}`);
    console.log(`[JitsiClient] Room: ${normalizedRoom} | User: ${userName}`);
    this.connection = new JitsiMeetJS.JitsiConnection(null, null, connectionConfig);

    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      () => this.onConnectionEstablished(normalizedRoom, userName)
    );

    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      (err: any) => {
        console.error('Connection failed:', err);
        this.callbacks?.onConnectionFailed(err.toString());
      }
    );

    this.connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      () => {
        console.log('Disconnected from Jitsi Server');
        this.callbacks?.onConnectionDisconnected();
      }
    );

    this.connection.connect();
  }

  private onConnectionEstablished(roomName: string, userName: string) {
    console.log('Connection established, initializing conference...');
    
    const confConfig = {
      openBridgeChannel: 'websocket',
    };

    this.conference = this.connection.initJitsiConference(roomName, confConfig);

    // Register conference events
    this.setupConferenceListeners();

    // Set local display name
    this.conference.setDisplayName(userName);

    // Join room
    this.conference.join();
  }

  private setupConferenceListeners() {
    if (!this.conference) return;

    const confEvents = JitsiMeetJS.events.conference;

    this.conference.on(confEvents.CONFERENCE_JOINED, () => {
      console.log('Joined Jitsi Conference successfully!');
      this.callbacks?.onConferenceJoined();

      try {
        this.conference.setLocalParticipantProperty('deviceInfo', JSON.stringify(getDeviceInfo()));
      } catch (e) {
        console.warn('Không thể broadcast deviceInfo:', e);
      }

      // Initialize local media tracks after joining
      this.createLocalMedia();
    });

    this.conference.on(
      JitsiMeetJS.events.connectionQuality.LOCAL_STATS_UPDATED,
      (stats: any) => this.callbacks?.onLocalStatsUpdated?.(normalizeStats(stats))
    );

    this.conference.on(confEvents.TRACK_ADDED, (track: any) => {
      if (track.isLocal()) {
        console.log('Local track added to conference');
      } else {
        console.log(`Remote track added: ${track.getType()} from ${track.getParticipantId()}`);
        this.callbacks?.onTrackAdded(track);
      }
    });

    this.conference.on(confEvents.TRACK_REMOVED, (track: any) => {
      console.log(`Track removed: ${track.getType()}`);
      this.callbacks?.onTrackRemoved(track);
    });

    this.conference.on(confEvents.USER_JOINED, (id: string, participant: any) => {
      console.log(`User joined: ${id} (${participant.getDisplayName()})`);
      this.callbacks?.onParticipantJoined(id, participant.getDisplayName() || 'Học viên ẩn danh', participant.getRole());
    });

    this.conference.on(confEvents.USER_LEFT, (id: string) => {
      console.log(`User left: ${id}`);
      this.callbacks?.onParticipantLeft(id);
    });

    this.conference.on(confEvents.DOMINANT_SPEAKER_CHANGED, (id: string) => {
      this.callbacks?.onDominantSpeakerChanged(id);
    });

    this.conference.on(confEvents.CONNECTION_STATS, (id: string, stats: any) => {
      this.callbacks?.onConnectionStatsReceived(id, stats);
    });

    this.conference.on(confEvents.MESSAGE_RECEIVED, (id: string, text: string, ts: Date) => {
      const participantName = this.conference.getParticipantById(id)?.getDisplayName() || 'Ẩn danh';
      this.callbacks?.onChatMessageReceived(id, participantName, text, ts || new Date());
    });

    this.conference.on(confEvents.PARTICIPANT_PROPERTY_CHANGED, (participant: any, property: string, _oldValue: any, newValue: any) => {
      const id = participant.getId();
      if (property === 'raisedHand') {
        console.log(`Hand raise changed: ${id} -> ${newValue}`);
        this.callbacks?.onHandRaiseChanged(id, !!newValue);
      } else if (property === 'deviceInfo' && newValue) {
        try {
          this.callbacks?.onParticipantDeviceInfo?.(id, JSON.parse(newValue) as DeviceInfo);
        } catch (e) {
          console.warn('deviceInfo không hợp lệ từ participant', id, e);
        }
      }
    });
  }

  private createLocalMedia() {
    JitsiMeetJS.createLocalTracks({
      devices: ['audio', 'video'],
      resolution: 720,
      constraints: {
        video: {
          height: { ideal: 720, min: 240, max: 1080 },
          width: { ideal: 1280, min: 320, max: 1920 },
        }
      }
    })
    .then((tracks: any[]) => {
      this.localTracks = tracks;
      this.localTracks.forEach(track => {
        this.conference.addTrack(track);
      });
      this.callbacks?.onLocalTracksReady(tracks);
    })
    .catch((err: any) => {
      console.error('Error creating local tracks:', err);
      JitsiMeetJS.createLocalTracks({ devices: ['audio'] })
        .then((tracks: any[]) => {
          this.localTracks = tracks;
          this.localTracks.forEach(track => {
            this.conference.addTrack(track);
          });
          this.callbacks?.onLocalTracksReady(tracks);
        })
        .catch((e: any) => console.error('Audio-only fallback failed:', e));
    });
  }

  public setAudioMuted(isMuted: boolean) {
    const audioTrack = this.localTracks.find(t => t.getType() === 'audio');
    if (audioTrack) {
      if (isMuted) {
        audioTrack.mute().catch((e: any) => console.error('Error muting audio:', e));
      } else {
        audioTrack.unmute().catch((e: any) => console.error('Error unmuting audio:', e));
      }
    }
  }

  public setVideoMuted(isMuted: boolean) {
    const videoTrack = this.localTracks.find(t => t.getType() === 'video');
    if (videoTrack) {
      if (isMuted) {
        videoTrack.mute().catch((e: any) => console.error('Error muting video:', e));
      } else {
        videoTrack.unmute().catch((e: any) => console.error('Error unmuting video:', e));
      }
    }
  }

  public setHandRaised(isRaised: boolean) {
    if (this.conference) {
      this.conference.setLocalParticipantProperty('raisedHand', isRaised);
      this.callbacks?.onHandRaiseChanged(this.conference.myUserId(), isRaised);
    }
  }

  public sendChatMessage(text: string) {
    if (this.conference) {
      this.conference.sendTextMessage(text);
    }
  }

  public lowerParticipantHand(id: string) {
    if (this.conference) {
      this.conference.sendMessage({
        type: 'lower-hand-command',
        targetId: id
      });
    }
  }

  public startScreenShare(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.conference) {
        reject(new Error('Conference is not active'));
        return;
      }
      if (this.localDesktopTrack) {
        resolve(this.localDesktopTrack);
        return;
      }

      console.log('[JitsiClient] Creating local desktop track...');
      JitsiMeetJS.createLocalTracks({
        devices: ['desktop'],
        desktopSharingFrameRate: {
          min: 5,
          max: 30
        }
      })
      .then((tracks: any[]) => {
        const desktopTrack = tracks.find(t => t.getType() === 'video');
        if (!desktopTrack) {
          throw new Error('No desktop video track created');
        }
        this.localDesktopTrack = desktopTrack;

        desktopTrack.addEventListener(
          JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
          () => {
            console.log('[JitsiClient] Local desktop track stopped by user/browser');
            if (this.callbacks?.onLocalScreenShareStopped) {
              this.callbacks.onLocalScreenShareStopped();
            } else {
              this.stopScreenShare().catch(err => console.error(err));
            }
          }
        );

        this.conference.addTrack(desktopTrack)
          .then(() => {
            console.log('[JitsiClient] Desktop track added to conference successfully');
            resolve(desktopTrack);
          })
          .catch((err: any) => {
            console.error('Failed to add desktop track to conference:', err);
            desktopTrack.dispose();
            this.localDesktopTrack = null;
            reject(err);
          });
      })
      .catch((err: any) => {
        console.error('Failed to create desktop track:', err);
        reject(err);
      });
    });
  }

  public stopScreenShare(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.localDesktopTrack) {
        resolve();
        return;
      }

      console.log('[JitsiClient] Removing desktop track from conference...');
      const track = this.localDesktopTrack;
      this.localDesktopTrack = null;

      if (this.conference) {
        this.conference.removeTrack(track)
          .then(() => {
            console.log('[JitsiClient] Desktop track removed from conference');
            track.dispose();
            resolve();
          })
          .catch((err: any) => {
            console.error('Failed to remove desktop track from conference:', err);
            track.dispose();
            resolve();
          });
      } else {
        track.dispose();
        resolve();
      }
    });
  }

  public disconnect() {
    this.localTracks.forEach(track => {
      try {
        track.dispose();
      } catch (e) {
        console.error('Error disposing track:', e);
      }
    });
    this.localTracks = [];

    if (this.localDesktopTrack) {
      try {
        this.localDesktopTrack.dispose();
      } catch (e) {
        console.error('Error disposing desktop track:', e);
      }
      this.localDesktopTrack = null;
    }

    if (this.conference) {
      this.conference.leave().then(() => {
        if (this.connection) {
          this.connection.disconnect();
        }
      });
    } else if (this.connection) {
      this.connection.disconnect();
    }
    
    this.conference = null;
    this.connection = null;
  }
}
