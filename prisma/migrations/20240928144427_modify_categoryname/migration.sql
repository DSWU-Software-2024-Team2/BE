/*
  Warnings:

  - The values [INSCNOOL,OUTSCHOOL,TEST] on the enum `SubCategory_subcategory_name` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `subcategory` MODIFY `subcategory_name` ENUM('CAMPUS', 'SUPPORTERS', 'CERTIFICATION', 'CONTEST', 'JOB') NOT NULL;
