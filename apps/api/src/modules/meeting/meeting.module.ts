import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { ClassController } from './class.controller';
import { SessionController } from './session.controller';
import { WebhookController } from './webhook.controller';
import { MeetingService } from './meeting.service';
import { LivekitService } from './livekit.service';
import { MeetingGateway } from './meeting.gateway';
import { AuthModule } from '../auth/auth.module';
import { MEDIA_PROVIDER } from './media/media-provider.interface';
import { LivekitAdapter } from './media/livekit.adapter';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [AuthModule],
  controllers: [
    CourseController,
    ClassController,
    SessionController,
    WebhookController,
  ],
  providers: [
    MeetingService,
    LivekitService,
    MeetingGateway,
    {
      provide: MEDIA_PROVIDER,
      useFactory: (config: ConfigService, livekitService: LivekitService) => {
        const provider = config.get<string>('MEDIA_PROVIDER') || 'livekit';
        if (provider === 'livekit') {
          return new LivekitAdapter(livekitService);
        }
        // Fallback default
        return new LivekitAdapter(livekitService);
      },
      inject: [ConfigService, LivekitService],
    },
  ],
  exports: [MeetingService, LivekitService, MeetingGateway, MEDIA_PROVIDER],
})
export class MeetingModule {}


