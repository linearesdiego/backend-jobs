-- AlterTable
ALTER TABLE `providerprofile` ADD COLUMN `moderationStatus` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL;

-- Backfill: providers already public become APPROVED
UPDATE `providerProfile`
SET `moderationStatus` = 'APPROVED'
WHERE `profileComplete` = 1
  AND `videoUrl` IS NOT NULL
  AND `status` = 'ACTIVE';
