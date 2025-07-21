/*
  Warnings:

  - You are about to drop the column `carId` on the `order` table. All the data in the column will be lost.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_carId_fkey`;

-- DropIndex
DROP INDEX `Order_carId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `car` ADD COLUMN `soldDate` DATETIME(3) NULL,
    ADD COLUMN `soldPrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `carId`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Completed',
    ADD COLUMN `totalAmount` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `ItemOnOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `carId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemOnOrder` ADD CONSTRAINT `ItemOnOrder_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOnOrder` ADD CONSTRAINT `ItemOnOrder_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
