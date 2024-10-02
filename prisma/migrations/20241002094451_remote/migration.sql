/*
  Warnings:

  - You are about to drop the `chatmessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chatparticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chatroom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chatmessage` DROP FOREIGN KEY `ChatMessage_chatroom_id_fkey`;

-- DropForeignKey
ALTER TABLE `chatmessage` DROP FOREIGN KEY `ChatMessage_sender_id_fkey`;

-- DropForeignKey
ALTER TABLE `chatparticipant` DROP FOREIGN KEY `ChatParticipant_chatroom_id_fkey`;

-- DropForeignKey
ALTER TABLE `chatparticipant` DROP FOREIGN KEY `ChatParticipant_user_id_fkey`;

-- DropTable
DROP TABLE `chatmessage`;

-- DropTable
DROP TABLE `chatparticipant`;

-- DropTable
DROP TABLE `chatroom`;
