/*
  Warnings:

  - You are about to drop the column `ocr_data` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verification_code` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `ocr_data`,
    DROP COLUMN `verification_code`;
