/*
  Warnings:

  - A unique constraint covering the columns `[keyword]` on the table `SearchKeyword` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SearchKeyword_keyword_key` ON `SearchKeyword`(`keyword`);
