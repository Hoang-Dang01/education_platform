import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookReceiver } from 'livekit-server-sdk';
import { PrismaService } from '../../database/prisma.service';

@Controller('meetings/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: any, @Body() body: any) {
    const signature = req.headers['authorization'];
    const rawBody = req.rawBody;

    if (!signature || !rawBody) {
      this.logger.warn('Received webhook with missing signature or raw body.');
      throw new UnauthorizedException('Missing signature or raw body.');
    }

    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      this.logger.error('LiveKit credentials not configured in backend environment.');
      throw new UnauthorizedException('Credentials not configured.');
    }

    try {
      const receiver = new WebhookReceiver(apiKey, apiSecret);
      // Cryptographically verify webhook signature
      const event = receiver.receive(rawBody.toString('utf8'), signature);
      await this.processWebhookEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid signature.');
    }
  }

  @Post('mock')
  @HttpCode(HttpStatus.OK)
  async handleMockWebhook(@Body() body: any) {
    // Only allow mock webhook in non-production environments
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      throw new UnauthorizedException('Mock webhook is disabled in production.');
    }

    this.logger.log(`Received mock webhook event: ${body.event}`);
    await this.processWebhookEvent(body);
    return { received: true, mock: true };
  }

  /**
   * Processes LiveKit webhook events and syncs database state.
   */
  private async processWebhookEvent(event: any) {
    const eventName = event.event;
    const roomName = event.room?.name;
    const participantIdentity = event.participant?.identity;

    if (!roomName) {
      this.logger.warn(`Webhook event ${eventName} lacks room name.`);
      return;
    }

    // Find the active session associated with this Jitsi/LiveKit roomName
    const session = await this.prisma.session.findUnique({
      where: { roomName },
    });

    if (!session) {
      this.logger.warn(`No session found for roomName "${roomName}". Ignoring event.`);
      return;
    }

    switch (eventName) {
      case 'participant_joined':
        this.logger.log(`Participant "${participantIdentity}" joined room "${roomName}".`);
        if (participantIdentity) {
          const user = await this.prisma.user.findUnique({ where: { id: participantIdentity } });
          if (user && user.role === 'student') {
            // Upsert initial attendance record
            await this.prisma.attendance.upsert({
              where: {
                sessionId_userId: { sessionId: session.id, userId: user.id },
              },
              update: {},
              create: {
                sessionId: session.id,
                userId: user.id,
                status: 'fail',
              },
            });
          }
        }
        break;

      case 'participant_left':
        this.logger.log(`Participant "${participantIdentity}" left room "${roomName}".`);
        if (participantIdentity) {
          const user = await this.prisma.user.findUnique({ where: { id: participantIdentity } });
          if (user && user.role === 'student') {
            const joinedAtSeconds = event.participant?.joinedAt || Math.floor(Date.now() / 1000);
            const nowSeconds = Math.floor(Date.now() / 1000);
            const durationSeconds = Math.max(0, nowSeconds - joinedAtSeconds);
            const durationMins = Math.ceil(durationSeconds / 60);

            // Fetch current attendance record
            const attendance = await this.prisma.attendance.findUnique({
              where: {
                sessionId_userId: { sessionId: session.id, userId: user.id },
              },
            });

            const currentPresentTime = attendance?.presentTimeMins || 0;
            const currentDisconnects = attendance?.disconnectCount || 0;

            // Increment present minutes and disconnect segment count
            await this.prisma.attendance.update({
              where: {
                sessionId_userId: { sessionId: session.id, userId: user.id },
              },
              data: {
                presentTimeMins: currentPresentTime + durationMins,
                disconnectCount: currentDisconnects + 1,
              },
            });
          }
        }
        break;

      case 'room_finished':
        this.logger.log(`LiveKit Room "${roomName}" finished. Closing session.`);
        const endTime = new Date();
        const startTime = session.startTime ? new Date(session.startTime) : new Date(session.createdAt);
        const totalDurationMins = Math.max(1, Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60)));

        // Update Session to ended status
        await this.prisma.session.update({
          where: { id: session.id },
          data: {
            status: 'ended',
            endTime,
          },
        });

        // Query all attendance records for this session
        const attendances = await this.prisma.attendance.findMany({
          where: { sessionId: session.id },
        });

        // Compute final percentage and passing status for each student
        for (const att of attendances) {
          const pct = totalDurationMins > 0 ? (att.presentTimeMins / totalDurationMins) * 100 : 100;
          const roundedPct = Math.min(100, Math.round(pct * 10) / 10);
          const passed = roundedPct >= 80 ? 'pass' : 'fail';

          // Compensate disconnectCount: if student left once at the end, subtract 1 
          // to represent clean logout rather than actual networking drops.
          const finalDisconnects = Math.max(0, att.disconnectCount - 1);

          await this.prisma.attendance.update({
            where: { id: att.id },
            data: {
              totalTimeMins: totalDurationMins,
              pct: roundedPct,
              disconnectCount: finalDisconnects,
              status: passed,
            },
          });
        }
        this.logger.log(`Session ${session.id} finalized attendance logs for ${attendances.length} students.`);
        break;

      default:
        this.logger.log(`Unhandled webhook event: ${eventName}`);
        break;
    }
  }
}
