-- CreateTable
CREATE TABLE `Licns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `license` VARCHAR(191) NOT NULL,
    `organization` VARCHAR(191) NOT NULL,
    `parentCategory_id` INTEGER NOT NULL,
    `subCategory_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Licns` ADD CONSTRAINT `Licns_parentCategory_id_fkey` FOREIGN KEY (`parentCategory_id`) REFERENCES `ParentCategory`(`parentcategory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Licns` ADD CONSTRAINT `Licns_subCategory_id_fkey` FOREIGN KEY (`subCategory_id`) REFERENCES `SubCategory`(`subcategory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
