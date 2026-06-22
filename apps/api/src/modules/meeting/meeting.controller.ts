import { Controller, Post, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingController {
  constructor(private meetingService: MeetingService) {}

  @Post('join')
  async joinMeeting(@Req() req: any, @Body('classId') classId: string) {
    const userId = req.user.id;
    return this.meetingService.joinMeeting(userId, classId);
  }

  @Post('leave')
  async leaveMeeting(@Req() req: any, @Body('classId') classId: string) {
    // Client leaving notification is handled client-side or via webhook, 
    // but REST leave endpoint is available for bookkeeping.
    return { success: true };
  }

  @Post('end')
  async endMeeting(@Req() req: any, @Body('classId') classId: string) {
    const role = req.user.role;
    if (role !== 'teacher' && role !== 'admin' && role !== 'manager') {
      throw new ForbiddenException('Chỉ giáo viên hoặc quản lý mới có quyền đóng lớp học.');
    }
    await this.meetingService.endMeeting(classId);
    return { success: true };
  }
}
