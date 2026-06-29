import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';

@Injectable()
export class TelemetryService {
  constructor(private prisma: PrismaService) {}

  async ingest(userId: string, dto: IngestTelemetryDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
    });
    
    if (!session) {
      throw new NotFoundException('Phiên học không tồn tại.');
    }

    return this.prisma.telemetrySample.create({
      data: {
        sessionId: dto.sessionId,
        userId,
        pingMs: dto.pingMs,
        packetLoss: dto.packetLoss,
        jitterMs: dto.jitterMs,
        bitrateKbps: dto.bitrateKbps,
        fps: dto.fps,
      },
    });
  }
}
