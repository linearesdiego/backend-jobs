-- AlterTable
ALTER TABLE `user` ADD COLUMN `isBanned` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `role` ENUM('ADMIN', 'MOD', 'CONTRACTOR', 'PROVIDER') NOT NULL;

-- CreateTable
CREATE TABLE `Ad` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `mediaUrl` VARCHAR(191) NOT NULL,
    `mediaKey` VARCHAR(191) NOT NULL,
    `mediaType` VARCHAR(191) NOT NULL,
    `placement` ENUM('HEADER', 'SIDEBAR', 'FEED') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `linkUrl` VARCHAR(191) NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Ad_placement_isActive_idx`(`placement`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminLog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `performedById` VARCHAR(191) NOT NULL,
    `targetUserId` VARCHAR(191) NULL,
    `targetAdId` VARCHAR(191) NULL,
    `details` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminLog_performedById_idx`(`performedById`),
    INDEX `AdminLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ad` ADD CONSTRAINT `Ad_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminLog` ADD CONSTRAINT `AdminLog_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
