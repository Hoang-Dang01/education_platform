-- CreateTable
CREATE TABLE "TelemetrySample" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pingMs" DOUBLE PRECISION NOT NULL,
    "packetLoss" DOUBLE PRECISION NOT NULL,
    "jitterMs" DOUBLE PRECISION NOT NULL,
    "bitrateKbps" DOUBLE PRECISION,
    "fps" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetrySample_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TelemetrySample" ADD CONSTRAINT "TelemetrySample_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetrySample" ADD CONSTRAINT "TelemetrySample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
