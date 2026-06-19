// @ts-ignore
import JitsiMeetJS from 'lib-jitsi-meet';

export interface JitsiCallbacks {
  onLocalTracksReady: (tracks: any[]) => void;
  onRemoteTrackAdded: (track: any) => void;
  onRemoteTrackRemoved: (track: any) => void;
  onParticipantJoined: (id: string, displayName: string, role: string) => void;
  onParticipantLeft: (id: string) => void;
  onChatMessageReceived: (senderId: string, senderName: string, text: string, timestamp: Date) => void;
  onDominantSpeakerChanged: (id: string) => void;
  onConnectionStatsReceived: (id: string, stats: any) => void;
  onHandRaiseChanged: (id: string, isHandRaised: boolean) => void;
  onConferenceJoined: () => void;
  onConnectionFailed: (error: string) => void;
  onConnectionDisconnected: () => void;
}

class JitsiService {
  private connection: any = null;
  private conference: any = null;
  private localTracks: any[] = [];
  private callbacks: JitsiCallbacks | null = null;
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

  public connect(roomName: string, userName: string, _role: 'teacher' | 'student', callbacks: JitsiCallbacks) {
    this.init();
    this.callbacks = callbacks;

    const normalizedRoom = roomName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    
    // Standard Jitsi configuration targeting meet.jit.si public server
    const connectionConfig = {
      hosts: {
        domain: 'meet.jit.si',
        muc: 'conference.meet.jit.si',
        focus: 'focus.meet.jit.si',
      },
      bosh: `https://meet.jit.si/http-bind?room=${normalizedRoom}`,
      websocket: `wss://meet.jit.si/xmpp-websocket?room=${normalizedRoom}`,
      clientNode: 'http://jitsi.org/jitsimeet',
    };

    console.log(`Connecting to room: ${normalizedRoom} as ${userName}`);
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
      
      // Initialize local media tracks after joining
      this.createLocalMedia();
    });

    this.conference.on(confEvents.TRACK_ADDED, (track: any) => {
      if (track.isLocal()) {
        console.log('Local track added to conference');
      } else {
        console.log(`Remote track added: ${track.getType()} from ${track.getParticipantId()}`);
        this.callbacks?.onRemoteTrackAdded(track);
      }
    });

    this.conference.on(confEvents.TRACK_REMOVED, (track: any) => {
      console.log(`Track removed: ${track.getType()}`);
      this.callbacks?.onRemoteTrackRemoved(track);
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
      // stats object contains loss, jitter, rtt (ping)
      this.callbacks?.onConnectionStatsReceived(id, stats);
    });

    this.conference.on(confEvents.MESSAGE_RECEIVED, (id: string, text: string, ts: Date) => {
      const participantName = this.conference.getParticipantById(id)?.getDisplayName() || 'Ẩn danh';
      this.callbacks?.onChatMessageReceived(id, participantName, text, ts || new Date());
    });

    this.conference.on(confEvents.PARTICIPANT_PROPERTY_CHANGED, (participant: any, property: string, _oldValue: any, newValue: any) => {
      if (property === 'raisedHand') {
        const id = participant.getId();
        console.log(`Hand raise changed: ${id} -> ${newValue}`);
        this.callbacks?.onHandRaiseChanged(id, !!newValue);
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
      // fallback to audio only if camera is blocked or unavailable
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
      // Locally trigger update
      this.callbacks?.onHandRaiseChanged(this.conference.myUserId(), isRaised);
    }
  }

  public sendChatMessage(text: string) {
    if (this.conference) {
      this.conference.sendTextMessage(text);
    }
  }

  public lowerParticipantHand(id: string) {
    // If we are teacher, we can ask participant to lower hand.
    // Jitsi does not have a direct kick-hand api for all rooms, but we can set properties
    // Or we can send a custom command message over XMPP data channel.
    if (this.conference) {
      this.conference.sendMessage({
        type: 'lower-hand-command',
        targetId: id
      });
    }
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

export const jitsiService = new JitsiService();
