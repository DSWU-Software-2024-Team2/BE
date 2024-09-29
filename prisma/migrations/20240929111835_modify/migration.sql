-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_sub_category_id_fkey` FOREIGN KEY (`sub_category_id`) REFERENCES `SubCategory`(`subcategory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
