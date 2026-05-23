CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "location" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT,
    "tags" TEXT[],
    "source" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "embedding" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "rawCvText" TEXT NOT NULL,
    "parsedProfile" JSONB NOT NULL,
    "embedding" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Job_url_key" ON "Job"("url");
CREATE INDEX "Job_source_idx" ON "Job"("source");
CREATE INDEX "Job_postedAt_idx" ON "Job"("postedAt");
CREATE INDEX "SearchResult_userProfileId_idx" ON "SearchResult"("userProfileId");

ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_userProfileId_fkey"
    FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
