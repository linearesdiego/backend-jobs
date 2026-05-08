-- AlterTable: revert placement to NOT NULL (was set nullable in cambio_a_optional)
ALTER TABLE `ad` MODIFY `placement` ENUM('HEADER', 'SIDEBAR', 'FEED') NOT NULL;

-- AlterTable: expand targetUserEmail to VARCHAR(255)
ALTER TABLE `adminlog` MODIFY COLUMN `targetUserEmail` VARCHAR(255) NULL;

-- AlterTable: add profile image columns to contractorprofile
ALTER TABLE `contractorprofile`
  ADD COLUMN `profileImageUrl` VARCHAR(191) NULL,
  ADD COLUMN `profileImageMedia` VARCHAR(191) NULL;

-- AlterTable: add profile image columns to providerprofile
ALTER TABLE `providerprofile`
  ADD COLUMN `profileImageUrl` VARCHAR(191) NULL,
  ADD COLUMN `profileImageMedia` VARCHAR(191) NULL;
