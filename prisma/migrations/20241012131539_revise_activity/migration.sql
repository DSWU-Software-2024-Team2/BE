/*
  Warnings:

  - You are about to drop the `_activitykeywords` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `keyword` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_activitykeywords` DROP FOREIGN KEY `_ActivityKeywords_A_fkey`;

-- DropForeignKey
ALTER TABLE `_activitykeywords` DROP FOREIGN KEY `_ActivityKeywords_B_fkey`;

-- DropTable
DROP TABLE `_activitykeywords`;

-- DropTable
DROP TABLE `keyword`;

-- CreateTable
CREATE TABLE `Contest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `host` VARCHAR(191) NOT NULL,
    `dueDate` VARCHAR(191) NOT NULL,
    `viewCount` INTEGER NOT NULL,
    `coverImage` VARCHAR(191) NOT NULL,
    `parentCategory_id` INTEGER NOT NULL,
    `subCategory_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Contest` ADD CONSTRAINT `Contest_parentCategory_id_fkey` FOREIGN KEY (`parentCategory_id`) REFERENCES `ParentCategory`(`parentcategory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contest` ADD CONSTRAINT `Contest_subCategory_id_fkey` FOREIGN KEY (`subCategory_id`) REFERENCES `SubCategory`(`subcategory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
