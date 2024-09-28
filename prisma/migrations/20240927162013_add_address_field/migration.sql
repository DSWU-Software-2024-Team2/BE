-- AlterTable
ALTER TABLE `users` ADD COLUMN `ocr_data` JSON NULL,
    ADD COLUMN `verification_code` VARCHAR(191) NULL;
