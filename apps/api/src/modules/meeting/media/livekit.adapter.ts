import { Injectable } from '@nestjs/common';
import { MediaProvider, MeetingUser } from './media-provider.interface';
import { LivekitService } from '../livekit.service';

@Injectable()
export class LivekitAdapter implements MediaProvider {
  constructor(private readonly livekitService: LivekitService) {}

  async createRoom(roomName: string, emptyTimeoutMins?: number): Promise<void> {
    await this.livekitService.createRoom(roomName, emptyTimeoutMins);
  }

  async deleteRoom(roomName: string): Promise<void> {
    await this.livekitService.closeRoom(roomName);
  }

  async generateAccessToken(roomName: string, user: MeetingUser): Promise<string> {
    return this.livekitService.generateToken(
      roomName,
      user.id,
      user.name,
      user.isTeacher,
    );
  }
}
