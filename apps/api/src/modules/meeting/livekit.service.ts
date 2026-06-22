import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private roomService: RoomServiceClient;

  constructor(private configService: ConfigService) {
    const apiURL = this.configService.get<string>('LIVEKIT_API_URL');
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (apiURL && apiKey && apiSecret) {
      this.roomService = new RoomServiceClient(apiURL, apiKey, apiSecret);
    } else {
      this.logger.warn(
        'LiveKit configuration missing. Token generation and Room APIs will fail if called.',
      );
    }
  }

  /**
   * Generates a LiveKit access token with correct permissions.
   */
  async generateToken(
    roomName: string,
    participantIdentity: string,
    participantName: string,
    isTeacher: boolean,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit credentials not configured on backend.');
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: '4h', // Token is valid for 4 hours
    });

    // Grant correct permissions
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      roomAdmin: isTeacher, // Teacher has moderator rights
    });

    return await at.toJwt();
  }

  /**
   * Creates a room explicitly on LiveKit server (Model B - Session Triggered).
   */
  async createRoom(roomName: string, emptyTimeoutMins = 15): Promise<void> {
    if (!this.roomService) {
      throw new Error('LiveKit RoomServiceClient is not initialized.');
    }

    try {
      await this.roomService.createRoom({
        name: roomName,
        emptyTimeout: emptyTimeoutMins * 60, // Convert to seconds
        maxParticipants: 100,
      });
      this.logger.log(`LiveKit Room "${roomName}" created successfully.`);
    } catch (error) {
      this.logger.error(`Failed to create LiveKit room "${roomName}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Closes a room explicitly via LiveKit API.
   */
  async closeRoom(roomName: string): Promise<void> {
    if (!this.roomService) {
      throw new Error('LiveKit RoomServiceClient is not initialized.');
    }

    try {
      await this.roomService.deleteRoom(roomName);
      this.logger.log(`LiveKit Room "${roomName}" closed/deleted successfully.`);
    } catch (error) {
      this.logger.error(`Failed to close LiveKit room "${roomName}": ${error.message}`);
      throw error;
    }
  }
}
