/*
  Warnings:

  - The primary key for the `chatroom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `상태` on the `chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `생성일자` on the `chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `채팅방 유형` on the `chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `채팅방 이름` on the `chatroom` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `post` table. All the data in the column will be lost.
  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mileagerecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mileageusage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Evaluatee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Evaluator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `GradeChangeRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[membership_grade_id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatroom_id` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatroom_name` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatroom_type` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent_category_id` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_category_id` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `Profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chatroom` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `상태`,
    DROP COLUMN `생성일자`,
    DROP COLUMN `채팅방 유형`,
    DROP COLUMN `채팅방 이름`,
    ADD COLUMN `chatroom_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `chatroom_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `chatroom_type` ENUM('INDIVIDUAL', 'GROUP') NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL,
    ADD PRIMARY KEY (`chatroom_id`);

-- AlterTable
ALTER TABLE `post` DROP COLUMN `category_id`,
    ADD COLUMN `parent_category_id` INTEGER NOT NULL,
    ADD COLUMN `sub_category_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `profiles` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `profile_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`profile_id`);

-- AlterTable
ALTER TABLE `users` MODIFY `membership_grade_id` INTEGER NULL;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `evaluation`;

-- DropTable
DROP TABLE `mileagerecord`;

-- DropTable
DROP TABLE `mileageusage`;

-- CreateTable
CREATE TABLE `ParentCategory` (
    `parentcategory_id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentcategory_name` ENUM('INFORMATION', 'TIP', 'PLAYGROUND') NOT NULL,

    PRIMARY KEY (`parentcategory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubCategory` (
    `subcategory_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subcategory_name` ENUM('INSCNOOL', 'OUTSCHOOL', 'TEST', 'JOB') NOT NULL,
    `parentcategory_id` INTEGER NOT NULL,

    PRIMARY KEY (`subcategory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MileageTrade` (
    `record_id` INTEGER NOT NULL AUTO_INCREMENT,
    `buyer_id` INTEGER NOT NULL,
    `seller_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `traded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `MileageTrade_buyer_id_key`(`buyer_id`),
    UNIQUE INDEX `MileageTrade_seller_id_key`(`seller_id`),
    PRIMARY KEY (`record_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Manner` (
    `manner_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `like_count` INTEGER NOT NULL DEFAULT 0,
    `dislike_count` INTEGER NOT NULL DEFAULT 0,
    `manner_face` ENUM('GOOD', 'NORMAL', 'BAD') NOT NULL,
    `evaluatee_id` INTEGER NULL,

    UNIQUE INDEX `Manner_evaluatee_id_key`(`evaluatee_id`),
    PRIMARY KEY (`manner_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MannerReaction` (
    `mannerReaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    `evaluator_id` INTEGER NOT NULL,
    `evaluatee_id` INTEGER NOT NULL,
    `manner_id` INTEGER NOT NULL,
    `reaction` ENUM('GOOD', 'BAD') NOT NULL,
    `reacted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`mannerReaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UsersTrade` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UsersTrade_AB_unique`(`A`, `B`),
    INDEX `_UsersTrade_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Evaluatee_user_id_key` ON `Evaluatee`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Evaluator_user_id_key` ON `Evaluator`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `GradeChangeRecord_user_id_key` ON `GradeChangeRecord`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Profiles_user_id_key` ON `Profiles`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Reaction_user_id_key` ON `Reaction`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Users_membership_grade_id_key` ON `Users`(`membership_grade_id`);

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_membership_grade_id_fkey` FOREIGN KEY (`membership_grade_id`) REFERENCES `MembershipGrade`(`membershipgrade_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profiles` ADD CONSTRAINT `Profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_chatroom_id_fkey` FOREIGN KEY (`chatroom_id`) REFERENCES `ChatRoom`(`chatroom_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_chatroom_id_fkey` FOREIGN KEY (`chatroom_id`) REFERENCES `ChatRoom`(`chatroom_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_parent_category_id_fkey` FOREIGN KEY (`parent_category_id`) REFERENCES `ParentCategory`(`parentcategory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubCategory` ADD CONSTRAINT `SubCategory_parentcategory_id_fkey` FOREIGN KEY (`parentcategory_id`) REFERENCES `ParentCategory`(`parentcategory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`post_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reaction` ADD CONSTRAINT `Reaction_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`post_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reaction` ADD CONSTRAINT `Reaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`post_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MileageTrade` ADD CONSTRAINT `MileageTrade_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MileageTrade` ADD CONSTRAINT `MileageTrade_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MileageTrade` ADD CONSTRAINT `MileageTrade_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Post`(`post_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluator` ADD CONSTRAINT `Evaluator_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluatee` ADD CONSTRAINT `Evaluatee_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Manner` ADD CONSTRAINT `Manner_evaluatee_id_fkey` FOREIGN KEY (`evaluatee_id`) REFERENCES `Evaluatee`(`evaluatee_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MannerReaction` ADD CONSTRAINT `MannerReaction_evaluator_id_fkey` FOREIGN KEY (`evaluator_id`) REFERENCES `Evaluator`(`evaluator_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MannerReaction` ADD CONSTRAINT `MannerReaction_evaluatee_id_fkey` FOREIGN KEY (`evaluatee_id`) REFERENCES `Evaluatee`(`evaluatee_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MannerReaction` ADD CONSTRAINT `MannerReaction_manner_id_fkey` FOREIGN KEY (`manner_id`) REFERENCES `Manner`(`manner_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GradeChangeRecord` ADD CONSTRAINT `GradeChangeRecord_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlarmSetting` ADD CONSTRAINT `AlarmSetting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alarm` ADD CONSTRAINT `Alarm_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchHistory` ADD CONSTRAINT `SearchHistory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchHistory` ADD CONSTRAINT `SearchHistory_keyword_id_fkey` FOREIGN KEY (`keyword_id`) REFERENCES `SearchKeyword`(`keyword_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UsersTrade` ADD CONSTRAINT `_UsersTrade_A_fkey` FOREIGN KEY (`A`) REFERENCES `Mileage`(`mileage_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UsersTrade` ADD CONSTRAINT `_UsersTrade_B_fkey` FOREIGN KEY (`B`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
