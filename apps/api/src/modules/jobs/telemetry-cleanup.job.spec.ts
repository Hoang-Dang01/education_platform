import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryCleanupJob } from './telemetry-cleanup.job';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('TelemetryCleanupJob', () => {
  let job: TelemetryCleanupJob;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrismaService = {
    telemetrySample: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryCleanupJob,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    job = module.get<TelemetryCleanupJob>(TelemetryCleanupJob);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('handleCleanup', () => {
    it('should delete 0 rows if no telemetry samples match the criteria (Test 1: No rows)', async () => {
      mockConfigService.get.mockReturnValue('7'); // Retention 7 days
      mockPrismaService.telemetrySample.findMany.mockResolvedValue([]); // No matching old rows

      const result = await job.handleCleanup();

      expect(result.totalDeleted).toBe(0);
      expect(mockPrismaService.telemetrySample.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.telemetrySample.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete outdated records of ended sessions (Test 2: Rows older than threshold)', async () => {
      mockConfigService.get.mockReturnValue('7'); // Retention 7 days
      
      // Mock findMany returning 1 record in first batch, and empty array in second batch
      mockPrismaService.telemetrySample.findMany
        .mockResolvedValueOnce([{ id: 'sample-outdated-1' }])
        .mockResolvedValueOnce([]);
        
      mockPrismaService.telemetrySample.deleteMany.mockResolvedValue({ count: 1 });

      const result = await job.handleCleanup();

      expect(result.totalDeleted).toBe(1);
      expect(mockPrismaService.telemetrySample.findMany).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.telemetrySample.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['sample-outdated-1'] },
        },
      });
    });

    it('should preserve recent records and ignore active sessions (Test 3: Recent rows preserved)', async () => {
      mockConfigService.get.mockReturnValue('7'); // Retention 7 days

      // Since Prisma query filters by `createdAt < threshold` and `session.status = 'ended'`,
      // recent rows or rows of active sessions will NOT be fetched by findMany.
      // Therefore, findMany returns empty batch.
      mockPrismaService.telemetrySample.findMany.mockResolvedValue([]);

      const result = await job.handleCleanup();

      expect(result.totalDeleted).toBe(0);
      
      // Verify findMany query structure is correct
      expect(mockPrismaService.telemetrySample.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              lt: expect.any(Date),
            }),
            session: { status: 'ended' },
          }),
        }),
      );
      expect(mockPrismaService.telemetrySample.deleteMany).not.toHaveBeenCalled();
    });
  });
});
