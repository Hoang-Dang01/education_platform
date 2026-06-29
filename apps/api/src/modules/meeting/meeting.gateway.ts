import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UseFilters } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@WebSocketGateway({
  namespace: 'classroom',
  cors: {
    origin: '*',
  },
})
export class MeetingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MeetingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Authenticats and authorizs client connection via JWT handshake.
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers['authorization']?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Unauthorized WS connection attempt from ${client.id} - No token.`);
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload; // Attach user info to socket metadata
      this.logger.log(`WS Client Connected: ${payload.name} (${payload.role}) - Socket ${client.id}`);
    } catch (error) {
      this.logger.warn(`WS Connection unauthorized: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`WS Client Disconnected: ${user.name} - Socket ${client.id}`);
    }
  }

  /**
   * Handles joining a specific classroom session channel.
   */
  @SubscribeMessage('join_classroom')
  handleJoinClassroom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    const roomName = `session-${data.sessionId}`;
    client.join(roomName);
    this.logger.log(`User ${user.name} joined room ${roomName}`);

    // Broadcast presence update to room
    this.server.to(roomName).emit('participant_joined_classroom', {
      userId: user.id,
      name: user.name,
      role: user.role,
      socketId: client.id,
    });
  }

  /**
   * Receives telemetry reports from client WebRTC connections and broadcasts them to the monitor.
   */
  @SubscribeMessage('telemetry_report')
  handleTelemetryReport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      sessionId: string;
      metrics: {
        ping: number;
        loss: number;
        jitter: number;
        bitrate: number;
        fps: number;
      };
      device: string;
      network: string;
      status: string;
    },
  ) {
    const user = client.data.user;
    if (!user) return;

    // Broadcast live metrics of this user to the admin monitoring channel
    this.server.to('admin_monitoring').emit('live_telemetry_update', {
      sessionId: data.sessionId,
      userId: user.id,
      name: user.name,
      role: user.role,
      metrics: data.metrics,
      device: data.device,
      network: data.network,
      status: data.status,
      timestamp: new Date(),
    });
  }

  /**
   * Syncs hand raise status dynamically in the classroom.
   */
  @SubscribeMessage('raise_hand')
  handleRaiseHand(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; isRaised: boolean },
  ) {
    const user = client.data.user;
    if (!user) return;

    const roomName = `session-${data.sessionId}`;
    this.server.to(roomName).emit('hand_raise_status', {
      userId: user.id,
      name: user.name,
      isRaised: data.isRaised,
      timestamp: Date.now(),
    });
  }

  /**
   * Registers Admins / Managers to receive global telemetry streams.
   */
  @SubscribeMessage('subscribe_monitoring')
  handleSubscribeMonitoring(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (!user) return;

    if (user.role === 'admin' || user.role === 'manager') {
      client.join('admin_monitoring');
      this.logger.log(`Admin/Manager ${user.name} subscribed to real-time telemetry monitoring.`);
      client.emit('monitoring_subscribed', { success: true });
    } else {
      client.emit('monitoring_error', { message: 'Quyền hạn không hợp lệ.' });
    }
  }
}
