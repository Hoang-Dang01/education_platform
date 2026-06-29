export interface MediaTrack {
  getType(): 'audio' | 'video';
  isLocal(): boolean;
  getParticipantId(): string;
  getVideoType?(): 'camera' | 'desktop';
  attach(element: any): void;
  detach(element: any): void;
}

export interface MediaClientCallbacks {
  onLocalTracksReady: (tracks: any[]) => void;
  onTrackAdded: (track: any) => void;
  onTrackRemoved: (track: any) => void;
  onParticipantJoined: (id: string, displayName: string, role: string) => void;
  onParticipantLeft: (id: string) => void;
  onChatMessageReceived: (senderId: string, senderName: string, text: string, timestamp?: Date) => void;
  onDominantSpeakerChanged: (id: string) => void;
  onConnectionStatsReceived: (
    id: string,
    stats: {
      latency: number;
      packetLoss: number;
      jitter: number;
      bitrate?: number;
      framerate?: number;
    }
  ) => void;
  onHandRaiseChanged: (id: string, isHandRaised: boolean) => void;
  onConferenceJoined: () => void;
  onConnectionFailed: (error: string) => void;
  onConnectionDisconnected: () => void;
  onLocalScreenShareStopped?: () => void;
  onConnectionReconnecting?: () => void;
  onConnectionReconnected?: () => void;
  onLocalStatsUpdated?: (stats: any) => void;
  onParticipantDeviceInfo?: (id: string, info: any) => void;
}

export interface MediaClient {
  connect(
    roomName: string,
    userName: string,
    role: string,
    callbacks: MediaClientCallbacks,
    token?: string,
    serverUrl?: string
  ): void;
  disconnect(): void;
  setAudioMuted(isMuted: boolean): void;
  setVideoMuted(isMuted: boolean): void;
  setHandRaised(isRaised: boolean): void;
  sendChatMessage(text: string): void;
  lowerParticipantHand(id: string): void;
  startScreenShare(): Promise<any>;
  stopScreenShare(): Promise<void>;
}
