import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TelemetryService } from './telemetry.service';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';

@Controller('telemetry')
@UseGuards(JwtAuthGuard)
export class TelemetryController {
  constructor(private telemetryService: TelemetryService) {}

  @Post('ingest')
  async ingest(@Req() req: any, @Body() dto: IngestTelemetryDto) {
    const userId = req.user.id;
    await this.telemetryService.ingest(userId, dto);
    return { success: true };
  }
}
