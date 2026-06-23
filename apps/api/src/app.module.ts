import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { MeetingModule } from './modules/meeting/meeting.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { MaterialsModule } from './modules/materials/materials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? [] : ['apps/api/.env', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    MeetingModule,
    TelemetryModule,
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
