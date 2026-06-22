import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { CourseController } from './course.controller';
import { ClassController } from './class.controller';
import { SessionController } from './session.controller';
import { WebhookController } from './webhook.controller';
import { MeetingService } from './meeting.service';
import { LivekitService } from './livekit.service';
import { MeetingGateway } from './meeting.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    MeetingController,
    CourseController,
    ClassController,
    SessionController,
    WebhookController,
  ],
  providers: [MeetingService, LivekitService, MeetingGateway],
  exports: [MeetingService, LivekitService, MeetingGateway],
})
export class MeetingModule {}
