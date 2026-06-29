import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TelemetryCleanupJob {
  private readonly logger = new Logger(TelemetryCleanupJob.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Cleans up telemetry samples older than the retention threshold for ended sessions.
   * Runs daily at 3:15 AM.
   */
  @Cron('0 15 3 * * *')
  async handleCleanup() {
    try {
      const retentionDays = parseInt(
        this.configService.get<string>('TELEMETRY_RETENTION_DAYS') || '7',
        10,
      );

      const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      const startTime = Date.now();

      this.logger.log(
        `Starting telemetry cleanup. Retention: ${retentionDays} days (older than ${threshold.toISOString()}).`,
      );

      let totalDeleted = 0;
      const batchSize = 5000;

      while (true) {
        // Query IDs of outdated samples associated with ended sessions
        const batch = await this.prisma.telemetrySample.findMany({
          where: {
            createdAt: { lt: threshold },
            session: { status: 'ended' },
          },
          select: { id: true },
          take: batchSize,
        });

        if (batch.length === 0) {
          break;
        }

        const ids = batch.map((item) => item.id);

        const deleteResult = await this.prisma.telemetrySample.deleteMany({
          where: {
            id: { in: ids },
          },
        });

        totalDeleted += deleteResult.count;
        // DEBUG level: per-batch noise is acceptable in dev but too verbose in production
        this.logger.debug(
          `Deleted batch of ${deleteResult.count} telemetry samples. Cumulative deleted: ${totalDeleted}`,
        );

        // Yield to event loop to avoid starvation and reduce database CPU lock
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const durationMs = Date.now() - startTime;
      this.logger.log(
        `Telemetry cleanup completed. Deleted total ${totalDeleted} rows in ${durationMs}ms.`,
      );

      return { totalDeleted, durationMs };
    } catch (error) {
      this.logger.error(`Telemetry cleanup failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
