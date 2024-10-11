/*
  Warnings:

  - You are about to alter the column `benefits` on the `membershipgrade` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Int`.
  - You are about to drop the column `status` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `membershipgrade` MODIFY `benefits` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `post` DROP COLUMN `status`,
    ADD COLUMN `dislikes_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `dislikes_mileage` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `likes_mileage` INTEGER NOT NULL DEFAULT 0,
    MODIFY `likes_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `reaction` DROP COLUMN `category_id`;
