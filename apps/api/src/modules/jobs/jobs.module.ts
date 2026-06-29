import { Module } from '@nestjs/common';
import { TelemetryCleanupJob } from './telemetry-cleanup.job';

@Module({
  providers: [TelemetryCleanupJob],
  exports: [TelemetryCleanupJob],
})
export class JobsModule {}
