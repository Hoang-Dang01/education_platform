export interface MeetingUser {
  id: string;
  name: string;
  isTeacher: boolean;
}

export interface ParticipantInfo {
  identity: string;
  name: string;
  joinedAt: Date;
}

export interface MediaProvider {
  createRoom(roomName: string, emptyTimeoutMins?: number): Promise<void>;
  deleteRoom(roomName: string): Promise<void>;
  generateAccessToken(roomName: string, user: MeetingUser): Promise<string>;
  
  listParticipants?(roomName: string): Promise<ParticipantInfo[]>;
  startRecording?(roomName: string): Promise<void>;
  stopRecording?(roomName: string): Promise<void>;
}

export const MEDIA_PROVIDER = 'MEDIA_PROVIDER';


