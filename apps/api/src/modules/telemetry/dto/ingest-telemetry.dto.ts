import { IsString, IsNumber, IsOptional } from 'class-validator';

export class IngestTelemetryDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  pingMs: number;

  @IsNumber()
  packetLoss: number;

  @IsNumber()
  jitterMs: number;

  @IsNumber()
  @IsOptional()
  bitrateKbps?: number;

  @IsNumber()
  @IsOptional()
  fps?: number;
}
