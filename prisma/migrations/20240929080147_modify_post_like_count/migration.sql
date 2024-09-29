/*
  Warnings:

  - Added the required column `likes_count` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `post` ADD COLUMN `likes_count` INTEGER NOT NULL;
