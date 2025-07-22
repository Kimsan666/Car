/*
  Warnings:

  - You are about to drop the column `carId` on the `itemonorder` table. All the data in the column will be lost.
  - You are about to drop the column `cartId` on the `itemonorder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `itemonorder` DROP FOREIGN KEY `ItemOnOrder_carId_fkey`;

-- DropForeignKey
ALTER TABLE `itemonorder` DROP FOREIGN KEY `ItemOnOrder_cartId_fkey`;

-- DropIndex
DROP INDEX `ItemOnOrder_carId_fkey` ON `itemonorder`;

-- DropIndex
DROP INDEX `ItemOnOrder_cartId_fkey` ON `itemonorder`;

-- AlterTable
ALTER TABLE `itemoncart` ADD COLUMN `cartId` INTEGER NULL;

-- AlterTable
ALTER TABLE `itemonorder` DROP COLUMN `carId`,
    DROP COLUMN `cartId`;

-- AddForeignKey
ALTER TABLE `ItemOnCart` ADD CONSTRAINT `ItemOnCart_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
