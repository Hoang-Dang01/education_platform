import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from './meeting.service';
import { PrismaService } from '../../database/prisma.service';
import { MEDIA_PROVIDER } from './media/media-provider.interface';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('MeetingService', () => {
  let service: MeetingService;
  let prisma: PrismaService;
  let mediaProvider: any;
  let config: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    enrollment: {
      findUnique: jest.fn(),
    },
    attendance: {
      upsert: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    telemetrySample: {
      aggregate: jest.fn(),
    },
  };

  const mockMediaProvider = {
    createRoom: jest.fn(),
    deleteRoom: jest.fn(),
    generateAccessToken: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MEDIA_PROVIDER,
          useValue: mockMediaProvider,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
    prisma = module.get<PrismaService>(PrismaService);
    mediaProvider = module.get(MEDIA_PROVIDER);
    config = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('canJoinSession', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.canJoinSession('user-1', 'session-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if session does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', role: UserRole.student });
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(service.canJoinSession('user-1', 'session-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return true if user is admin or manager', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', role: UserRole.admin });
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'session-1',
        class: { id: 'class-1', teacherId: 'teacher-1' },
      });

      const result = await service.canJoinSession('user-1', 'session-1');
      expect(result).toBe(true);
    });

    it('should return true if user is the assigned teacher of the class', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'teacher-1', role: UserRole.teacher });
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'session-1',
        class: { id: 'class-1', teacherId: 'teacher-1' },
      });

      const result = await service.canJoinSession('teacher-1', 'session-1');
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user is teacher but not assigned to the class', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'teacher-2', role: UserRole.teacher });
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'session-1',
        class: { id: 'class-1', teacherId: 'teacher-1' },
      });

      await expect(service.canJoinSession('teacher-2', 'session-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return true if user is student and has active enrollment in the class', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'student-1', role: UserRole.student });
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'session-1',
        class: { id: 'class-1', teacherId: 'teacher-1' },
      });
      mockPrismaService.enrollment.findUnique.mockResolvedValue({
        userId: 'student-1',
        classId: 'class-1',
        status: 'active',
      });

      const result = await service.canJoinSession('student-1', 'session-1');
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if student does not have an active enrollment', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'student-1', role: UserRole.student });
      mockPrismaService.session.findUnique.mockResolvedValue({
        id: 'session-1',
        class: { id: 'class-1', teacherId: 'teacher-1' },
      });
      mockPrismaService.enrollment.findUnique.mockResolvedValue(null);

      await expect(service.canJoinSession('student-1', 'session-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('aggregateAttendance', () => {
    it('should aggregate and calculate final attendance stats and telemetry correctly', async () => {
      const sessionId = 'session-1';
      const startTime = new Date('2026-06-26T10:00:00.000Z');
      const endTime = new Date('2026-06-26T11:00:00.000Z'); // 60 minutes session

      const mockAttendances = [
        {
          id: 'attendance-1',
          userId: 'student-1',
          presentTimeMins: 50, // 50 mins present out of 60 mins -> 83.3% -> pass
          disconnectCount: 2,
        },
        {
          id: 'attendance-2',
          userId: 'student-2',
          presentTimeMins: 30, // 30 mins present out of 60 mins -> 50% -> fail
          disconnectCount: 1,
        },
      ];

      mockPrismaService.attendance.findMany.mockResolvedValue(mockAttendances);
      mockPrismaService.telemetrySample.aggregate.mockImplementation((args: any) => {
        const userId = args.where.userId;
        if (userId === 'student-1') {
          return {
            _avg: {
              pingMs: 25.5,
              packetLoss: 0.1,
              jitterMs: 1.5,
            },
          };
        } else {
          return {
            _avg: {
              pingMs: 120.0,
              packetLoss: 4.2,
              jitterMs: 12.8,
            },
          };
        }
      });

      await service.aggregateAttendance(sessionId, startTime, endTime);

      expect(mockPrismaService.attendance.findMany).toHaveBeenCalledWith({
        where: { sessionId },
      });

      // Assert student-1 updates
      expect(mockPrismaService.attendance.update).toHaveBeenCalledWith({
        where: { id: 'attendance-1' },
        data: {
          totalTimeMins: 60,
          pct: 83.3,
          disconnectCount: 1, // 2 - 1 (compensation)
          status: 'pass',
          avgPing: 25.5,
          avgLoss: 0.1,
          avgJitter: 1.5,
        },
      });

      // Assert student-2 updates
      expect(mockPrismaService.attendance.update).toHaveBeenCalledWith({
        where: { id: 'attendance-2' },
        data: {
          totalTimeMins: 60,
          pct: 50,
          disconnectCount: 0, // 1 - 1 (compensation)
          status: 'fail',
          avgPing: 120.0,
          avgLoss: 4.2,
          avgJitter: 12.8,
        },
      });
    });
  });
});
